/** Боевой адрес сайта. Задаётся через NEXT_PUBLIC_SITE_URL при деплое. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://meb-srv.ru").replace(
  /\/$/,
  "",
);

export function absolute(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
