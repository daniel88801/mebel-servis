import { NextResponse } from "next/server";
import { notifyStaff, staffAlert } from "@/lib/notify";
import { createLead } from "@/lib/store";
import { clean as cleanField, looksLikePhone } from "@/lib/validate";

export const runtime = "nodejs";

const MAX_FIELD = 2000;

const SOURCE_LABELS: Record<string, string> = {
  home: "Форма на главной",
  request: "Заявка из модалки",
  contacts: "Сообщение со страницы контактов",
  callback: "Обратный звонок",
  cart: "Спецификация из корзины",
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
  return cleanField(value, MAX_FIELD);
}

function staffText(lead: { number: string; source?: string; product?: string }) {
  const source = SOURCE_LABELS[lead.source ?? ""] ?? "Заявка с сайта";
  const extra = [`Источник: ${source}`];
  if (lead.product) extra.push(`Позиция: ${lead.product}`);
  return staffAlert({ kind: "lead", number: lead.number, extra });
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

  const saved = createLead({
    name: lead.name,
    phone: lead.phone,
    company: lead.company ?? "",
    comment: lead.comment ?? "",
    product: lead.product ?? "",
    source: lead.source ?? "",
  });

  const result = await notifyStaff({
    subject: `Новая заявка ${saved.number} — Мебель-Сервис`,
    html: staffText(saved),
  });
  if (!result.ok) {
    console.error("[lead] заявка", saved.number, "сохранена, уведомление не ушло");
  }

  return NextResponse.json({ ok: true, number: saved.number });
}
