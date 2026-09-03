"use client";

import { useState, type FormEvent } from "react";

export function InboxLogin() {
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/inbox/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Не удалось войти");
      window.location.reload();
    } catch (err) {
      setSending(false);
      setError(err instanceof Error ? err.message : "Не удалось войти");
    }
  }

  return (
    <form className="form-card form-grid" onSubmit={onSubmit} style={{ maxWidth: 420 }}>
      <label>
        Пароль служебной ленты
        <input name="password" type="password" required autoComplete="current-password" />
      </label>
      <button className="btn btn-primary" type="submit" disabled={sending}>
        {sending ? "Входим…" : "Войти"}
      </button>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
    </form>
  );
}
