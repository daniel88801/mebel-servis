"use client";

import { useState, type FormEvent } from "react";

export function ProfileForm({
  name,
  phone,
  company,
}: {
  name: string;
  phone: string;
  company: string;
}) {
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setSending(true);
    setOk(false);
    setError("");
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Не удалось сохранить");
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="form-card form-grid" onSubmit={onSubmit}>
      <p className="mono" style={{ color: "var(--copper)" }}>
        Профиль
      </p>
      <label>
        Имя
        <input name="name" required defaultValue={name} />
      </label>
      <label>
        Телефон
        <input name="phone" type="tel" defaultValue={phone} />
      </label>
      <label>
        Компания / объект
        <input name="company" defaultValue={company} />
      </label>
      <button className="btn btn-primary" type="submit" disabled={sending}>
        {sending ? "Сохраняем…" : "Сохранить"}
      </button>
      {ok && <div className="form-ok show">Данные обновлены на сервере.</div>}
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
    </form>
  );
}
