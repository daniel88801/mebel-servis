import Link from "next/link";
import { LogoMark } from "./Logo";
import { categories, company } from "@/data/catalog";
import { MESSENGERS } from "@/data/contacts";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <Link className="logo" href="/">
            <LogoMark />
            <span className="logo-text">
              <strong>Мебель-Сервис</strong>
              <span>ООО «Мебель-Сервис»</span>
            </span>
          </Link>
          <p style={{ marginTop: 16, maxWidth: "36ch" }}>
            Производим металлическую и корпусную мебель для объектов с интенсивной эксплуатацией. От
            единичного изделия до оснащения крупного объекта.
          </p>
        </div>
        <div>
          <h4>Каталог</h4>
          <ul>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link href={`/catalog/${cat.id}`}>{cat.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Компания</h4>
          <ul>
            <li>
              <Link href="/about">О компании</Link>
            </li>
            <li>
              <Link href="/wholesale">Оптом и на объект</Link>
            </li>
            <li>
              <Link href="/delivery">Доставка</Link>
            </li>
            <li>
              <Link href="/payment">Оплата и реквизиты</Link>
            </li>
            <li>
              <Link href="/contacts">Контакты и реквизиты</Link>
            </li>
            <li>
              <Link href="/privacy">Политика конфиденциальности</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Связаться</h4>
          <ul>
            <li>
              <a href="tel:+79200050110">{company.phones[0]}</a>
            </li>
            <li>
              <a href="tel:+79308117395">{company.phones[1]}</a>
            </li>
            <li>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </li>
            <li>{company.address}</li>
            <li>{company.hours}</li>
          </ul>
          {MESSENGERS.length > 0 && (
            <div className="messengers">
              {MESSENGERS.map((m) => (
                <a
                  key={m.id}
                  className="messenger"
                  href={m.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Написать в ${m.label}`}
                  title={m.label}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5v-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.1 2.1-.5 3.4a11 11 0 0 0 4.7 4.7c1.6.7 2.8.7 3.6.4.5-.2 1.2-.8 1.4-1.4.2-.5.2-1 .1-1.1l-.6-.1z" />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>
          © {new Date().getFullYear()} {company.legal} · ИНН {company.inn} · ОГРН {company.ogrn} ·{" "}
          <Link href="/payment">реквизиты</Link>
        </span>
        <span>Цены ориентировочные, для оптовых партий — по запросу</span>
      </div>
    </footer>
  );
}
