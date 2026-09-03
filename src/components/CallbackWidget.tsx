"use client";

import { useEffect, useState } from "react";
import { LeadForm } from "./LeadForm";
import { PdConsentText } from "./LegalConsent";
import { company } from "@/data/catalog";

/** Плавающая кнопка звонка: у конкурентов она есть на всех страницах, у нас не было. */
export function CallbackWidget() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="callback-fab"
        aria-label={open ? "Закрыть форму звонка" : "Заказать обратный звонок"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2z"
              fill="currentColor"
            />
          </svg>
        )}
      </button>

      {open && (
        <div className="callback-panel" role="dialog" aria-label="Обратный звонок">
          <p className="mono" style={{ color: "var(--copper)" }}>
            Обратный звонок
          </p>
          <h3>Перезвоним в рабочее время</h3>
          <p className="note">
            {company.hours}. Или позвоните сами: {company.phones[0]}
          </p>
          <LeadForm
            variant="callback"
            style={{ marginTop: 14 }}
            submitLabel="Жду звонка"
            okText="Заявка принята — перезвоним в рабочее время."
            consent={<PdConsentText />}
          />
        </div>
      )}
    </>
  );
}
