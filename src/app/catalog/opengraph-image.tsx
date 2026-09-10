import { ogScene, ogSize, ogType } from "@/lib/og";

export const alt = "Каталог мебели Мебель-Сервис";
export const size = ogSize;
export const contentType = ogType;

export default function Image() {
  return ogScene({
    photo: "/images/og/catalog.jpg",
    kicker: "Каталог",
    title: "Мебель для казарм, общежитий и объектов",
  });
}
