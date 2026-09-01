"use client";

import { useState, type CSSProperties, type FormEvent, type ReactNode } from "react";

/**
 * `home` — имя и телефон в две колонки, «Что нужно оснастить».
 * `request` — форма модалки: поля в столбик, привязка к позиции каталога.
 * `contacts` — имя, телефон, свободное сообщение.
 * `callback` — только имя и телефон, для виджета обратного звонка.
 */
type Variant = "home" | "request" | "contacts" | "callback";

type Status = "idle" | "sending" | "sent" | "error";

export function LeadForm({
  variant,
  product,
  className = "form-grid",
  style,
  heading,
  submitLabel,
  okText,
  consent,
}: {
  variant: Variant;
  product?: string;
  className?: string;
  style?: CSSProperties;
  heading?: ReactNode;
  submitLabel: string;
  okText: string;
  consent: ReactNode;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: variant, product: product ?? "" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Не удалось отправить заявку");
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Не удалось отправить заявку");
    }
  }

  const sending = status === "sending";

  return (
    <form className={className} style={style} onSubmit={onSubmit} noValidate={false}>
      {heading}

      {variant === "home" ? (
        <div className="form-grid two">
          <label>
            Имя
            <input name="name" required disabled={sending} />
          </label>
          <label>
            Телефон
            <input name="phone" type="tel" required placeholder="+7" disabled={sending} />
          </label>
        </div>
      ) : (
        <>
          <label>
            Имя
            <input
              name="name"
              required
              disabled={sending}
              placeholder={variant === "request" ? "Как к вам обращаться" : undefined}
            />
          </label>
          <label>
            Телефон
            <input name="phone" type="tel" required placeholder="+7" disabled={sending} />
          </label>
        </>
      )}

      {(variant === "home" || variant === "request") && (
        <label>
          Компания / объект
          <input
            name="company"
            disabled={sending}
            placeholder={variant === "request" ? "Необязательно" : undefined}
          />
        </label>
      )}

      {variant !== "callback" && (
        <label>
          {variant === "home"
            ? "Что нужно оснастить"
            : variant === "request"
              ? "Комментарий"
              : "Сообщение"}
          <textarea
            name="comment"
            disabled={sending}
            placeholder={
              variant === "home"
                ? "Категории, количество, сроки"
                : variant === "request"
                  ? "Количество, сроки, ТЗ"
                  : undefined
            }
          />
        </label>
      )}

      {/* Ловушка для ботов: людям поле не видно и не доступно с клавиатуры. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="honeypot"
      />

      <label className="check">
        <input type="checkbox" required disabled={sending} /> {consent}
      </label>

      <button className="btn btn-primary" type="submit" disabled={sending}>
        {sending ? "Отправляем…" : submitLabel}
      </button>

      {status === "sent" && <div className="form-ok show">{okText}</div>}
      {status === "error" && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
    </form>
  );
}
