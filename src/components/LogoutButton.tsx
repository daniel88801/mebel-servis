"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.assign("/");
      }}
    >
      Выйти
    </button>
  );
}
