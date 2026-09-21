import { company } from "./catalog";

/**
 * Мессенджеры. Ссылка построена на телефоне, который заказчик просил ставить везде.
 * Подключение этого номера к WhatsApp явно не подтверждено.
 * Telegram-бота пока нет — пункт не выводится.
 */
export const MESSENGERS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: `https://wa.me/${company.phones[0].replace(/\D/g, "")}`,
  },
  // { id: "telegram", label: "Telegram", href: "https://t.me/<аккаунт>" },
] as const;
