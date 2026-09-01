import { NextResponse } from "next/server";
import { company } from "@/data/catalog";

export const runtime = "nodejs";

const MAX_FIELD = 2000;

const SOURCE_LABELS: Record<string, string> = {
  home: "Форма на главной",
  request: "Заявка из модалки",
  contacts: "Сообщение со страницы контактов",
  callback: "Обратный звонок",
};

type Lead = {
  name: string;
  phone: string;
  company?: string;
  comment?: string;
  product?: string;
  source?: string;
};

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_FIELD) : "";
}

/** Телефон принимаем в любом виде, но цифр должно быть достаточно для звонка. */
function looksLikePhone(value: string) {
  return (value.match(/\d/g) ?? []).length >= 10;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function format(lead: Lead) {
  const rows: [string, string | undefined][] = [
    ["Имя", lead.name],
    ["Телефон", lead.phone],
    ["Компания / объект", lead.company],
    ["Позиция", lead.product],
    ["Комментарий", lead.comment],
  ];
  const title = SOURCE_LABELS[lead.source ?? ""] ?? "Заявка с сайта";
  const body = rows
    .filter(([, value]) => value)
    .map(([label, value]) => `<b>${label}:</b> ${escapeHtml(value as string)}`)
    .join("\n");
  return `🔔 <b>${title}</b>\n\n${body}\n\n<i>${company.name} · ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })} МСК</i>`;
}

async function sendToTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Бот ещё не подключён — не теряем заявку хотя бы в логах сервера.
    console.warn("[lead] TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы. Заявка:\n" + text);
    return { ok: false as const, reason: "not-configured" as const };
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  if (!res.ok) {
    console.error("[lead] Telegram ответил", res.status, await res.text().catch(() => ""));
    return { ok: false as const, reason: "telegram-error" as const };
  }
  return { ok: true as const };
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Не удалось прочитать заявку" }, { status: 400 });
  }

  const raw = payload as Record<string, unknown>;
  const lead: Lead = {
    name: clean(raw.name),
    phone: clean(raw.phone),
    company: clean(raw.company),
    comment: clean(raw.comment),
    product: clean(raw.product),
    source: clean(raw.source),
  };

  // Ловушка для ботов: поле скрыто от людей, заполнить его может только автозаполнялка.
  if (clean(raw.website)) return NextResponse.json({ ok: true });

  if (!lead.name) {
    return NextResponse.json({ error: "Укажите имя" }, { status: 422 });
  }
  if (!looksLikePhone(lead.phone)) {
    return NextResponse.json({ error: "Проверьте номер телефона" }, { status: 422 });
  }

  const result = await sendToTelegram(format(lead));

  if (!result.ok && result.reason === "telegram-error") {
    return NextResponse.json(
      { error: "Не смогли отправить заявку. Позвоните нам — " + company.phones[0] },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
