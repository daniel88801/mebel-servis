#!/usr/bin/env bash
# Разворачивает сайт на чистой Ubuntu: Docker, код, .env, Caddy на 80/443.
# Запускать на сервере от root. Повторный запуск обновляет до свежего main.
#
#   ./deploy.sh --domain meb-srv.ru
#   curl -fsSL https://raw.githubusercontent.com/daniel88801/mebel-servis/main/deploy.sh | bash
#
# Секреты берутся из окружения либо из уже существующего .env:
#   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, LEAD_EMAIL_TO,
#   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, INBOX_PASSWORD, NEXT_PUBLIC_YANDEX_METRIKA_ID
set -euo pipefail

DOMAIN="${DOMAIN:-meb-srv.ru}"
REPO="${REPO:-https://github.com/daniel88801/mebel-servis.git}"
BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-/opt/mebel-servis}"

while [ $# -gt 0 ]; do
  case "$1" in
    --domain) DOMAIN="$2"; shift 2 ;;
    --dir)    APP_DIR="$2"; shift 2 ;;
    --branch) BRANCH="$2"; shift 2 ;;
    --repo)   REPO="$2"; shift 2 ;;
    -h|--help) awk 'NR>1 && /^#/ {print; next} NR>1 {exit}' "$0"; exit 0 ;;
    *) echo "Неизвестный аргумент: $1" >&2; exit 2 ;;
  esac
done

step() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
die()  { printf '\033[31mОшибка: %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" = "0" ] || die "нужен root (sudo bash deploy.sh)"
command -v apt-get >/dev/null || die "скрипт рассчитан на Ubuntu/Debian"

step "Пакеты"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq ca-certificates curl git

step "Docker"
if ! command -v docker >/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  . /etc/os-release
  codename="${UBUNTU_CODENAME:-$VERSION_CODENAME}"
  # Свежие релизы Ubuntu появляются в репозитории Docker не сразу — берём последний известный.
  curl -fsSI "https://download.docker.com/linux/ubuntu/dists/$codename/Release" >/dev/null 2>&1 || codename=noble
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $codename stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi
docker --version
docker compose version >/dev/null || die "нет плагина docker compose"

step "Код: $REPO ($BRANCH) → $APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch --depth 1 origin "$BRANCH"
  git -C "$APP_DIR" reset --hard "origin/$BRANCH"
else
  git clone --depth 1 --branch "$BRANCH" "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"
echo "Коммит: $(git log -1 --pretty='%h %s')"

step ".env"
# Значение берём из окружения, иначе из старого .env, иначе из третьего аргумента.
prev() { [ -f .env ] || return 0; sed -n "s/^$1=//p" .env | tail -1; }
val()  { local env_val="${!1:-}" old
         if [ -n "$env_val" ]; then printf '%s' "$env_val"; return 0; fi
         old="$(prev "$1")"
         if [ -n "$old" ]; then printf '%s' "$old"; return 0; fi
         printf '%s' "${2:-}"; }

inbox="$(val INBOX_PASSWORD "$(head -c 18 /dev/urandom | base64 | tr -dc 'A-Za-z0-9')")"
umask 077
cat > .env <<ENV
SMTP_HOST=$(val SMTP_HOST)
SMTP_PORT=$(val SMTP_PORT 2525)
SMTP_USER=$(val SMTP_USER)
SMTP_PASSWORD=$(val SMTP_PASSWORD)
SMTP_FROM=$(val SMTP_FROM)
LEAD_EMAIL_TO=$(val LEAD_EMAIL_TO)
TELEGRAM_BOT_TOKEN=$(val TELEGRAM_BOT_TOKEN)
TELEGRAM_CHAT_ID=$(val TELEGRAM_CHAT_ID)
INBOX_PASSWORD=$inbox
NEXT_PUBLIC_SITE_URL=https://$DOMAIN
DOMAIN=$DOMAIN
NEXT_PUBLIC_YANDEX_METRIKA_ID=$(val NEXT_PUBLIC_YANDEX_METRIKA_ID)
ENV
umask 022
[ -n "$(val SMTP_HOST)" ] || echo "SMTP не настроен — заявки останутся только в /inbox и логе."

step "Сеть"
if command -v ufw >/dev/null && ufw status | grep -q '^Status: active'; then
  for p in 22 80 443; do ufw allow "$p"/tcp >/dev/null; done
fi
resolved="$(getent hosts "$DOMAIN" | awk '{print $1; exit}' || true)"
myip="$(curl -fsS --max-time 10 https://api.ipify.org || true)"
if [ -n "$resolved" ] && [ -n "$myip" ] && [ "$resolved" != "$myip" ]; then
  echo "Внимание: $DOMAIN → $resolved, а сервер $myip. Caddy не получит сертификат, пока DNS не сойдётся."
fi

step "Сборка и запуск"
docker compose up -d --build
docker compose ps

step "Проверка"
for i in $(seq 1 30); do
  code="$(docker compose exec -T web node -e "fetch('http://127.0.0.1:3000').then(r=>console.log(r.status)).catch(()=>console.log(0))" 2>/dev/null | tr -d '\r' || true)"
  [ "$code" = "200" ] && break
  sleep 4
done
[ "${code:-}" = "200" ] || { docker compose logs --tail 50 web; die "приложение не ответило 200"; }
echo "web: 200 на 127.0.0.1:3000"
echo "снаружи: $(curl -fsS -o /dev/null -w '%{http_code}' --max-time 20 "https://$DOMAIN" || echo 'нет ответа — проверьте DNS и сертификат')"

cat <<OUT

Готово. Сайт: https://$DOMAIN
Лента заявок: https://$DOMAIN/inbox (пароль $inbox)
Каталог на сервере: $APP_DIR   Логи: docker compose -f $APP_DIR/docker-compose.yml logs -f
OUT
