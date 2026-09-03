"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  readCookieConsent,
  subscribeCookieConsent,
  writeCookieConsent,
  type CookieChoice,
} from "@/lib/cookie-consent";
import { LEGAL_VERSION } from "@/lib/legal";

function getSnapshot() {
  return readCookieConsent()?.choice ?? "none";
}

const serverSnapshot = () => "server";

export function CookieNotice() {
  const choice = useSyncExternalStore(subscribeCookieConsent, getSnapshot, serverSnapshot);
  const [dismissed, setDismissed] = useState(false);

  if (choice !== "none" || dismissed) return null;

  function accept(next: CookieChoice) {
    try {
      writeCookieConsent(next, LEGAL_VERSION);
    } catch {
      // приватный режим — баннер спрячем на этот визит
    }
    setDismissed(true);
    fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice: next, version: LEGAL_VERSION }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <div className="cookie-notice" role="region" aria-label="Использование файлов cookie">
      <p>
        Сайт ставит необходимые cookie, чтобы работали кабинет и корзина. Аналитика «Яндекс.Метрика»
        (включая вебвизор) включается только после «Принять все». Подробнее — в{" "}
        <Link href="/privacy">политике конфиденциальности</Link>.
      </p>
      <div className="cookie-actions">
        <button className="btn btn-primary btn-sm" type="button" onClick={() => accept("all")}>
          Принять все
        </button>
        <button className="btn btn-ghost btn-sm cookie-necessary" type="button" onClick={() => accept("necessary")}>
          Только необходимые
        </button>
      </div>
    </div>
  );
}
