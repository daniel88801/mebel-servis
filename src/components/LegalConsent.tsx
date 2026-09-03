"use client";

import Link from "next/link";

/** Отдельное согласие по 156-ФЗ — не смешиваем с офертой. */
export function PdConsentText() {
  return (
    <>
      Даю <Link href="/consent">согласие на обработку персональных данных</Link>
    </>
  );
}

export function OfertaCheckbox() {
  return (
    <label className="check">
      <input type="checkbox" name="oferta" required />
      Принимаю <Link href="/oferta">оферту</Link> на направление заявки. Это не розничная покупка:
      дальше готовим КП и счёт.
    </label>
  );
}
