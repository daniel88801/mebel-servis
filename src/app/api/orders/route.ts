import { NextResponse } from "next/server";
import { getCurrentUser, updateUser } from "@/lib/auth";
import { company } from "@/data/catalog";
import { sendToTelegram, staffAlert } from "@/lib/notify";
import { createOrder, DELIVERY_LABEL, getCart } from "@/lib/store";
import { clean, looksLikePhone } from "@/lib/validate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нужно войти, чтобы оформить заказ" }, { status: 401 });

  const raw = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = clean(raw.name, 120);
  const phone = clean(raw.phone, 40);
  const companyName = clean(raw.company, 160);
  const comment = clean(raw.comment, 2000);
  const delivery = clean(raw.delivery, 20) || "pickup";
  const address = clean(raw.address, 400);

  if (!name) return NextResponse.json({ error: "Укажите имя" }, { status: 422 });
  if (!looksLikePhone(phone)) return NextResponse.json({ error: "Проверьте номер телефона" }, { status: 422 });
  if (!["pickup", "city", "transport"].includes(delivery)) {
    return NextResponse.json({ error: "Выберите способ получения" }, { status: 422 });
  }
  if (delivery !== "pickup" && address.length < 6) {
    return NextResponse.json({ error: "Укажите адрес доставки или терминал ТК" }, { status: 422 });
  }

  const items = getCart(user.id);
  if (!items.length) return NextResponse.json({ error: "Корзина пуста" }, { status: 422 });

  updateUser(user.id, { name, phone, company: companyName });
  const order = createOrder(user.id, {
    name,
    phone,
    company: companyName,
    comment,
    delivery,
    address,
    items,
  });

  const text = staffAlert({
    kind: "order",
    number: order.number,
    extra: [
      `Позиций: ${order.items.length}`,
      `Получение: ${DELIVERY_LABEL[delivery] ?? delivery}`,
    ],
  });

  const result = await sendToTelegram(text);
  if (!result.ok && result.reason === "telegram-error") {
    return NextResponse.json(
      { error: "Заказ сохранён, но уведомление не ушло. Позвоните нам — " + company.phones[0], id: order.id, number: order.number },
      { status: 200 },
    );
  }

  return NextResponse.json({ ok: true, id: order.id, number: order.number });
}
