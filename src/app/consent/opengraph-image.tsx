import { ogScene, ogSize, ogType } from "@/lib/og";

export const alt = "Согласие на обработку персональных данных — Мебель-Сервис";
export const size = ogSize;
export const contentType = ogType;

export default function Image() {
  return ogScene({
    photo: "/images/og/legal.jpg",
    kicker: "Документы",
    title: "Согласие на обработку персональных данных",
  });
}
