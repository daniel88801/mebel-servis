"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "./Logo";
import { RequestButton } from "./RequestModal";
import { HeaderIcons } from "./HeaderIcons";
import { company } from "@/data/catalog";

const NAV = [
  { href: "/catalog", label: "Каталог" },
  { href: "/wholesale", label: "Оптом" },
  { href: "/delivery", label: "Доставка" },
  { href: "/about", label: "О компании" },
  { href: "/contacts", label: "Контакты" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Карточка товара подсвечивает «Каталог» — как и в исходной версии.
  const isActive = (href: string) =>
    pathname === href || (href === "/catalog" && pathname.startsWith("/product"));

  return (
    <header className="header">
      <div className="header-inner">
        <Link className="logo" href="/">
          <LogoMark />
          <span className="logo-text">
            <strong>Мебель-Сервис</strong>
            <span>производство · Н. Новгород</span>
          </span>
        </Link>
        <nav className={`nav${open ? " open" : ""}`}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-phone" href="tel:+79200050110">
            {company.phones[0]}
          </a>
          <HeaderIcons />
          <RequestButton className="btn btn-primary btn-sm">Оставить заявку</RequestButton>
          <button
            className="burger"
            type="button"
            aria-label="Меню"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
