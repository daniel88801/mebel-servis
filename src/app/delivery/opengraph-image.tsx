import { ogScene, ogSize, ogType } from "@/lib/og";

export const alt = "Доставка и отгрузка мебели с производства Мебель-Сервис";
export const size = ogSize;
export const contentType = ogType;

export default function Image() {
  return ogScene({
    photo: "/images/og/delivery.jpg",
    kicker: "Доставка",
    title: "Самовывоз, город и регионы",
  });
}
