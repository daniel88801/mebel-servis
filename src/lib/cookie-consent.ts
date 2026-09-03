export const COOKIE_CONSENT_KEY = "ms-cookie-consent";

export type CookieChoice = "all" | "necessary";

export type StoredCookieConsent = {
  v: string;
  choice: CookieChoice;
  at: string;
};

const listeners = new Set<() => void>();

export function subscribeCookieConsent(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStoreChange);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStoreChange);
    }
  };
}

function notify() {
  for (const listener of listeners) listener();
}

export function parseCookieConsent(raw: string | null): StoredCookieConsent | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as StoredCookieConsent;
    if (data?.choice === "all" || data?.choice === "necessary") return data;
  } catch {
    // Старый баннер писал ISO-дату — считаем согласие на аналитику.
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      return { v: "legacy", choice: "all", at: raw };
    }
  }
  return null;
}

export function readCookieConsent(): StoredCookieConsent | null {
  try {
    return parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY));
  } catch {
    return null;
  }
}

export function writeCookieConsent(choice: CookieChoice, version: string): StoredCookieConsent {
  const stored: StoredCookieConsent = { v: version, choice, at: new Date().toISOString() };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(stored));
  notify();
  return stored;
}
