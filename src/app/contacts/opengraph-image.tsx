import { ogScene, ogSize, ogType } from "@/lib/og";

export const alt = "Контакты Мебель-Сервис, Нижний Новгород";
export const size = ogSize;
export const contentType = ogType;

export default function Image() {
  return ogScene({
    photo: "/images/og/contacts.jpg",
    kicker: "Контакты",
    title: "Производство в Нижнем Новгороде",
  });
}
