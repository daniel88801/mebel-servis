import { ogScene, ogSize, ogType } from "@/lib/og";

export const alt = "Оплата и реквизиты ООО Мебель-Сервис";
export const size = ogSize;
export const contentType = ogType;

export default function Image() {
  return ogScene({
    photo: "/images/og/payment.jpg",
    kicker: "Оплата",
    title: "Счёт, безнал, 44-ФЗ и 223-ФЗ",
  });
}
