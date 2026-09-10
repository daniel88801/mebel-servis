import { ogScene, ogSize, ogType } from "@/lib/og";

export const alt = "Оферта для юридических лиц и ИП — Мебель-Сервис";
export const size = ogSize;
export const contentType = ogType;

export default function Image() {
  return ogScene({
    photo: "/images/og/legal.jpg",
    kicker: "Документы",
    title: "Оферта для юридических лиц и ИП",
  });
}
