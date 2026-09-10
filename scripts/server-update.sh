#!/usr/bin/env bash
# Обновляет сайт до готового образа из GHCR. Запускается на сервере из CI.
# Сборки здесь нет: образ уже собран в GitHub Actions.
#
#   bash scripts/server-update.sh ghcr.io/daniel88801/mebel-servis:sha-abc1234
set -euo pipefail

IMAGE="${1:?не передан образ}"
APP_DIR="${APP_DIR:-/opt/mebel-servis}"

cd "$APP_DIR"

# Токен приходит из CI на время запуска и тут же отзывается — на сервере не оседает.
if [ -n "${GHCR_TOKEN:-}" ]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "${GHCR_USER:-x}" --password-stdin >/dev/null
fi
cleanup() { docker logout ghcr.io >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo "==> Образ: $IMAGE"
docker pull -q "$IMAGE"

# WEB_IMAGE читает docker-compose.yml; остальные значения в .env не трогаем.
touch .env
grep -v '^WEB_IMAGE=' .env > .env.next || true
echo "WEB_IMAGE=$IMAGE" >> .env.next
chmod 600 .env.next
mv .env.next .env

echo "==> Перезапуск"
docker compose up -d --no-build

echo "==> Проверка"
for _ in $(seq 1 30); do
  code="$(docker compose exec -T web node -e \
    "fetch('http://127.0.0.1:3000').then(r=>console.log(r.status)).catch(()=>console.log(0))" \
    2>/dev/null | tr -d '\r' || true)"
  [ "$code" = "200" ] && break
  sleep 4
done

if [ "${code:-}" != "200" ]; then
  echo "Приложение не ответило 200, откатываться нечем — логи ниже." >&2
  docker compose logs --tail 60 web >&2
  exit 1
fi

echo "web: 200 на 127.0.0.1:3000"
docker compose ps --format '{{.Service}}: {{.Status}}'

# Диска на сервере мало — чистим слои прошлых сборок.
docker image prune -f >/dev/null
df -h / | tail -1
