"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCart } from "@/components/CartProvider";
import { OfertaCheckbox, PdConsentText } from "@/components/LegalConsent";
import { money, productHref } from "@/lib/format";

const DELIVERY = [
  { id: "pickup", label: "Самовывоз с производства" },
  { id: "city", label: "Доставка по Нижнему Новгороду" },
  { id: "transport", label: "Отправка транспортной компанией" },
] as const;

export function CartView() {
  const { items, setQty, remove, clear, count, user } = useCart();
  const router = useRouter();
  const [delivery, setDelivery] = useState<(typeof DELIVERY)[number]["id"]>("pickup");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  const sum = items.reduce((n, i) => n + (i.price ?? 0) * i.qty, 0);
  const priced = items.every((i) => i.price != null);

  async function onOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, delivery }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Не удалось оформить заказ");
      clear();
      router.push(`/account/orders/${body.id}`);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Не удалось оформить заказ");
    }
  }

  if (items.length === 0) {
    return (
      <div className="empty">
        <p>Пока пусто. Добавьте позиции из каталога.</p>
        <Link className="btn btn-primary" href="/catalog">
          Открыть каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <div>
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item.id} className="cart-line">
              <Link href={productHref(item.id)} className="cart-thumb">
                <Image src={item.image} alt="" width={88} height={88} />
              </Link>
              <div>
                <span className="mono card-sku">{item.sku}</span>
                <h3>
                  <Link href={productHref(item.id)}>{item.name}</Link>
                </h3>
                <p className="price">
                  {item.price == null ? (
                    "по запросу"
                  ) : (
                    <>
                      <small>от</small> {money(item.price)}
                    </>
                  )}
                </p>
              </div>
              <div className="cart-qty">
                <button type="button" aria-label="Меньше" onClick={() => setQty(item.id, item.qty - 1)}>
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) => setQty(item.id, Number(e.target.value) || 1)}
                  aria-label="Количество"
                />
                <button type="button" aria-label="Больше" onClick={() => setQty(item.id, item.qty + 1)}>
                  +
                </button>
                <button type="button" className="cart-remove" onClick={() => remove(item.id)}>
                  Убрать
                </button>
              </div>
            </li>
          ))}
        </ul>
        <p className="note" style={{ marginTop: 12 }}>
          {count} поз. {priced ? <>· ориентир <small>от</small> {money(sum)}</> : "· часть позиций — по запросу"}
          {" · "}
          <button type="button" className="linkish" onClick={clear}>
            Очистить
          </button>
        </p>
      </div>

      <div className="form-card">
        <p className="mono" style={{ color: "var(--copper)" }}>
          Оформление
        </p>
        <h2 style={{ fontSize: "1.4rem", margin: "6px 0 12px" }}>Заказ</h2>
        <p className="note" style={{ marginBottom: 16 }}>
          Заказ сохраняется в кабинете. Счёт и КП готовим после подтверждения состава и объёма.
        </p>

        {!user ? (
          <div className="auth-gate">
            <p>Чтобы оформить заказ, войдите в кабинет — так заявка и история сохранятся на сервере.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/login?next=/cart">
                Войти
              </Link>
              <Link className="btn btn-ghost" href="/register?next=/cart">
                Регистрация
              </Link>
            </div>
          </div>
        ) : (
          <form className="form-grid" onSubmit={onOrder}>
            <label>
              Имя
              <input name="name" required defaultValue={user.name} />
            </label>
            <label>
              Телефон
              <input name="phone" type="tel" required defaultValue={user.phone} placeholder="+7" />
            </label>
            <label>
              Компания / объект
              <input name="company" defaultValue={user.company} />
            </label>
            <fieldset className="delivery-set">
              <legend>Получение</legend>
              {DELIVERY.map((d) => (
                <label key={d.id} className="check">
                  <input
                    type="radio"
                    name="delivery"
                    checked={delivery === d.id}
                    onChange={() => setDelivery(d.id)}
                  />
                  {d.label}
                </label>
              ))}
            </fieldset>
            {delivery !== "pickup" && (
              <label>
                Адрес или терминал ТК
                <input name="address" required placeholder="Город, улица или ТК и пункт выдачи" />
              </label>
            )}
            <label>
              Комментарий к заказу
              <textarea name="comment" placeholder="Сроки, ТЗ, цвет ЛДСП, особые условия" />
            </label>
            <label className="check">
              <input type="checkbox" name="pd_consent" required /> <PdConsentText />
            </label>
            <OfertaCheckbox />
            <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Оформляем…" : "Оформить заказ"}
            </button>
            {status === "error" && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
