import { company } from "./catalog";

/**
 * Мессенджеры. Ссылки построены на основном телефоне компании.
 *
 * TODO перед запуском: подтвердить, что номер действительно подключён к WhatsApp,
 * и указать реальный аккаунт Telegram — сейчас его нет и пункт не выводится.
 */
export const MESSENGERS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: `https://wa.me/${company.phones[0].replace(/\D/g, "")}`,
  },
  // { id: "telegram", label: "Telegram", href: "https://t.me/<аккаунт>" },
] as const;
