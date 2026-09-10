import { ogScene, ogSize, ogType } from "@/lib/og";

export const alt = "Собственное производство Мебель-Сервис в Нижнем Новгороде";
export const size = ogSize;
export const contentType = ogType;

export default function Image() {
  return ogScene({
    photo: "/images/og/about.jpg",
    kicker: "О компании",
    title: "Собственное производство",
  });
}
