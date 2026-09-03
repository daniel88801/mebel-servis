"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { readCookieConsent, subscribeCookieConsent } from "@/lib/cookie-consent";

/** Яндекс.Метрика. Грузим только после явного согласия. */
export function Metrika() {
  const id = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  const choice = useSyncExternalStore(
    subscribeCookieConsent,
    () => readCookieConsent()?.choice ?? "none",
    () => "none",
  );
  if (!id || choice !== "all") return null;

  return (
    <Script id="yandex-metrika" strategy="afterInteractive">
      {`
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
        ym(${JSON.stringify(id)}, 'init', { webvisor: true, clickmap: true, accurateTrackBounce: true, trackLinks: true });
      `}
    </Script>
  );
}
