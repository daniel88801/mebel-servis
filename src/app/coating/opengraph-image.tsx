import { ogScene, ogSize, ogType } from "@/lib/og";

export const alt = "Порошковая окраска металла на производстве Мебель-Сервис";
export const size = ogSize;
export const contentType = ogType;

export default function Image() {
  return ogScene({
    photo: "/images/og/about.jpg",
    kicker: "Услуга",
    title: "Порошковая окраска",
  });
}
