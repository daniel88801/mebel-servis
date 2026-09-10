import { ogScene, ogSize, ogType } from "@/lib/og";

export const alt = "Политика конфиденциальности Мебель-Сервис";
export const size = ogSize;
export const contentType = ogType;

export default function Image() {
  return ogScene({
    photo: "/images/og/legal.jpg",
    kicker: "Документы",
    title: "Политика конфиденциальности",
  });
}
