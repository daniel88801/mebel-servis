"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LeadForm } from "./LeadForm";
import { PdConsentText } from "./LegalConsent";

type RequestModalContext = { open: (product?: string) => void };

const Ctx = createContext<RequestModalContext | null>(null);

export function useRequestModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRequestModal вне RequestModalProvider");
  return ctx;
}

export function RequestModalProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<string | null>(null);

  const open = useCallback((p?: string) => setProduct(p ?? ""), []);
  const close = useCallback(() => setProduct(null), []);

  useEffect(() => {
    if (product == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [product, close]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <div
        className={`modal${product == null ? "" : " open"}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={product == null}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {product != null && (
          <div className="modal-card">
            <p className="mono kicker" style={{ color: "var(--copper)" }}>
              Заявка
            </p>
            <h3>Расчёт поставки</h3>
            <p className="note">
              {product
                ? `Позиция: ${product}`
                : "Опишите объект и объём — ответим в рабочее время."}
            </p>
            <LeadForm
              variant="request"
              product={product}
              style={{ marginTop: 16 }}
              submitLabel="Отправить"
              okText="Заявка принята. Мы свяжемся с вами в ближайшее рабочее время."
              consent={<PdConsentText />}
            />
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

export function RequestButton({
  product,
  className = "btn btn-primary",
  children,
}: {
  product?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useRequestModal();
  return (
    <button type="button" className={className} onClick={() => open(product)}>
      {children}
    </button>
  );
}
