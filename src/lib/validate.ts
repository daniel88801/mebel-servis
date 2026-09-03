export function clean(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function looksLikePhone(value: string) {
  return (value.match(/\d/g) ?? []).length >= 10;
}

export function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 120;
}

export function isStrongPassword(value: string) {
  return value.length >= 8 && value.length <= 100;
}
