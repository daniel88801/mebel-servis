"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export function AuthForm({
  mode,
  next = "/account",
}: {
  mode: "login" | "register";
  next?: string;
}) {
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (mode === "register" && data.password !== data.password2) {
      setError("Пароли не совпадают");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Не удалось войти");
      window.location.assign(safeNext);
    } catch (err) {
      setSending(false);
      setError(err instanceof Error ? err.message : "Не удалось войти");
    }
  }

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      {mode === "register" && (
        <div className="auth-row">
          <label>
            Имя
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            Электронная почта
            <input name="email" type="email" required autoComplete="email" />
          </label>
        </div>
      )}
      {mode === "login" && (
        <label>
          Электронная почта
          <input name="email" type="email" required autoComplete="email" />
        </label>
      )}
      {mode === "register" && (
        <div className="auth-row">
          <label>
            Телефон
            <input name="phone" type="tel" required placeholder="+7" autoComplete="tel" />
          </label>
          <label>
            Компания / объект
            <input name="company" autoComplete="organization" placeholder="Необязательно" />
          </label>
        </div>
      )}
      {mode === "login" ? (
        <label>
          Пароль
          <input name="password" type="password" required minLength={8} autoComplete="current-password" />
        </label>
      ) : (
        <div className="auth-row">
          <label>
            Пароль
            <input name="password" type="password" required minLength={8} autoComplete="new-password" />
          </label>
          <label>
            Ещё раз
            <input name="password2" type="password" required minLength={8} autoComplete="new-password" />
          </label>
        </div>
      )}
      {mode === "register" && (
        <label className="check">
          <input type="checkbox" name="pd_consent" required /> Даю{" "}
          <Link href="/consent">согласие на обработку персональных данных</Link>
        </label>
      )}
      <button className="btn btn-primary auth-submit" type="submit" disabled={sending}>
        {sending ? "Отправляем…" : mode === "login" ? "Войти" : "Создать кабинет"}
      </button>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <p className="auth-switch">
        {mode === "login" ? (
          <>
            Нет кабинета?{" "}
            <Link href={`/register?next=${encodeURIComponent(safeNext)}`}>Зарегистрироваться</Link>
          </>
        ) : (
          <>
            Уже есть кабинет? <Link href={`/login?next=${encodeURIComponent(safeNext)}`}>Войти</Link>
          </>
        )}
      </p>
    </form>
  );
}
