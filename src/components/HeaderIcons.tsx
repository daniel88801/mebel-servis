"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";

export function HeaderIcons() {
  const { count, ready, user } = useCart();
  const pathname = usePathname();
  const accountHref = user ? "/account" : "/login?next=/account";

  return (
    <div className="header-icons">
      <Link
        href={accountHref}
        className={`header-icon${pathname.startsWith("/account") || pathname.startsWith("/login") ? " is-on" : ""}`}
        aria-label={user ? "Кабинет" : "Войти в кабинет"}
        title={user ? "Кабинет" : "Войти"}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 19.2c.8-3.2 3.4-5.2 6.5-5.2s5.7 2 6.5 5.2" />
        </svg>
      </Link>
      <Link
        href="/cart"
        className={`header-icon${pathname === "/cart" ? " is-on" : ""}`}
        aria-label={ready && count ? `Корзина, ${count}` : "Корзина"}
        title="Корзина"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 7h14l-1.2 11.2H6.2L5 7Z" />
          <path d="M8 7V6.2A4 4 0 0 1 12 2.2 4 4 0 0 1 16 6.2V7" />
        </svg>
        {ready && count > 0 && <span className="header-icon-count">{count > 99 ? "99+" : count}</span>}
      </Link>
    </div>
  );
}
