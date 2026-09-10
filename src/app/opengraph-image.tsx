import { ogScene, ogSize, ogType } from "@/lib/og";

export const alt = "Мебель-Сервис — производство мебели для объектов, Нижний Новгород";
export const size = ogSize;
export const contentType = ogType;

export default function Image() {
  return ogScene({
    photo: "/images/og/home.jpg",
    kicker: "Нижний Новгород",
    title: "Мебель, которая выдерживает объект",
  });
}
