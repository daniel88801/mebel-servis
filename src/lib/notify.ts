import nodemailer, { type Transporter } from "nodemailer";
import { company } from "@/data/catalog";
import { absolute } from "@/lib/site";

/**
 * Почта — основной канал: с сервера закрыты и api.telegram.org, и обычные
 * порты SMTP (25, 465, 587). Открыт порт 2525, на нём работают релеи почтовых
 * сервисов. Те же настройки подойдут и для smtp.mail.ru, если хостинг
 * когда-нибудь откроет 465.
 */
let transport: Transporter | null = null;

function mailTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null;
  if (!transport) {
    const port = Number(process.env.SMTP_PORT ?? 2525);
    transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transport;
}

export async function sendEmail(subject: string, html: string) {
  const mailer = mailTransport();
  if (!mailer) {
    console.warn("[notify] SMTP не настроен, письмо не отправлено.\n" + html);
    return { ok: false as const, reason: "not-configured" as const };
  }

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM ?? `Мебель-Сервис <${process.env.SMTP_USER}>`,
      to: process.env.LEAD_EMAIL_TO ?? company.email,
      subject,
      html,
      text: html.replace(/<[^>]+>/g, ""),
    });
    return { ok: true as const };
  } catch (error) {
    console.error("[notify] почта:", error);
    return { ok: false as const, reason: "smtp-error" as const };
  }
}

export async function sendToTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[notify] TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы.\n" + text);
    return { ok: false as const, reason: "not-configured" as const };
  }

  try {
    // С этого сервера api.telegram.org недоступен: без таймаута отправка
    // формы будет висеть до срабатывания сетевого таймаута.
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error("[notify] Telegram ответил", res.status, await res.text().catch(() => ""));
      return { ok: false as const, reason: "telegram-error" as const };
    }
    return { ok: true as const };
  } catch (error) {
    console.error("[notify] Telegram недоступен:", error);
    return { ok: false as const, reason: "telegram-error" as const };
  }
}

/**
 * Уведомление сотрудникам. Уходит на почту и, если настроен, в Telegram.
 * Персональных данных внутри нет — только номер и ссылка на служебную ленту,
 * поэтому письмо можно слать через внешний релей.
 */
export async function notifyStaff(input: { subject: string; html: string }) {
  const [mail, telegram] = await Promise.all([
    sendEmail(input.subject, input.html),
    sendToTelegram(input.html),
  ]);
  return { ok: mail.ok || telegram.ok, mail, telegram };
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
export function staffAlert(input: { kind: "lead" | "order"; number: string; extra?: string[] }) {
  const title = input.kind === "lead" ? "Новая заявка" : "Новый заказ";
  const lines = [
    `📦 <b>${title} ${escapeHtml(input.number)}</b>`,
    ...(input.extra ?? []).filter(Boolean).map((line) => escapeHtml(line)),
    `Персональные данные сохранены на сервере в РФ. Служебная лента: ${absolute("/inbox")}`,
    "",
    notifyFooter(),
  ];
  return lines.join("\n");
}
