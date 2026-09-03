import { company } from "@/data/catalog";

export async function sendToTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[notify] TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы.\n" + text);
    return { ok: false as const, reason: "not-configured" as const };
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  if (!res.ok) {
    console.error("[notify] Telegram ответил", res.status, await res.text().catch(() => ""));
    return { ok: false as const, reason: "telegram-error" as const };
  }
  return { ok: true as const };
}

export function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function stamp() {
  return new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
}

export function notifyFooter() {
  return `<i>${escapeHtml(company.name)} · ${stamp()} МСК</i>`;
}

/** Служебный алерт без ФИО, телефона, почты и адреса — ПДн остаются в базе в РФ. */
export function staffAlert(input: {
  kind: "lead" | "order";
  number: string;
  extra?: string[];
}) {
  const title = input.kind === "lead" ? "Новая заявка" : "Новый заказ";
  const lines = [
    `📦 <b>${title} ${escapeHtml(input.number)}</b>`,
    ...(input.extra ?? []).filter(Boolean).map((line) => escapeHtml(line)),
    "Персональные данные сохранены на сервере в РФ. Откройте служебную ленту /inbox",
    "",
    notifyFooter(),
  ];
  return lines.join("\n");
}
