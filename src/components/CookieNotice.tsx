"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

const KEY = "ms-cookie-consent";

/** Подписки нет: значение меняем только сами и сразу гасим баннер через состояние. */
const subscribe = () => () => {};

function readConsent() {
  try {
    return localStorage.getItem(KEY) ?? "none";
  } catch {
    // приватный режим — баннер не показываем, сохранить выбор всё равно не выйдет
    return "blocked";
  }
}

/** На сервере баннера нет, чтобы разметка совпала до чтения localStorage. */
const serverConsent = () => "server";

export function CookieNotice() {
  const consent = useSyncExternalStore(subscribe, readConsent, serverConsent);
  const [dismissed, setDismissed] = useState(false);

  if (consent !== "none" || dismissed) return null;

  function accept() {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {
      // не смогли запомнить — покажем ещё раз при следующем визите
    }
    setDismissed(true);
  }

  return (
    <div className="cookie-notice" role="region" aria-label="Использование файлов cookie">
      <p>
        Сайт использует файлы cookie и метрики, чтобы работать корректно и понимать, какие разделы
        каталога полезнее. Продолжая, вы соглашаетесь с{" "}
        <Link href="/privacy">политикой обработки персональных данных</Link>.
      </p>
      <button className="btn btn-primary btn-sm" type="button" onClick={accept}>
        Принять
      </button>
    </div>
  );
}
