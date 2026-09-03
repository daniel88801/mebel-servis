"use client";

export function InboxLogout() {
  async function onClick() {
    await fetch("/api/inbox/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <button className="btn btn-ghost" type="button" onClick={onClick}>
      Выйти
    </button>
  );
}
