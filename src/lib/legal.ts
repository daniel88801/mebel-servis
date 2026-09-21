import { company } from "@/data/catalog";

/** Версия публичных документов. Меняйте вместе с текстом политики, согласия и оферты. */
export const LEGAL_VERSION = "2026-09-21";

export const OPERATOR = {
  short: company.name,
  legal: company.legal,
  inn: company.inn,
  kpp: company.kpp,
  ogrn: company.ogrn,
  address: company.address,
  email: company.email,
  phones: company.phones,
  hours: company.hours,
  site: "https://meb-srv.ru",
} as const;
