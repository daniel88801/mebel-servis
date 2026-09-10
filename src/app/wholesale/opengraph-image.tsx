import { ogScene, ogSize, ogType } from "@/lib/og";

export const alt = "Оптовые поставки мебели для объектов — Мебель-Сервис";
export const size = ogSize;
export const contentType = ogType;

export default function Image() {
  return ogScene({
    photo: "/images/og/wholesale.jpg",
    kicker: "Оптом и на объект",
    title: "Серийные партии под техническое задание",
  });
}
