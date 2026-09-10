import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Страница не найдена",
  description:
    "Такой страницы или товара нет. Каталог ООО «Мебель-Сервис»: металлические кровати, шкафы и мебель на каркасе с производства в Нижнем Новгороде.",
  robots: { index: false, follow: true },
});

export default function NotFound() {
  return (
    <main className="wrap" id="content">
      <div className="page-hero">
        <h1>Страница не найдена</h1>
      </div>
      <div className="empty" style={{ paddingBottom: 80 }}>
        Такой страницы или товара нет. <Link href="/catalog">Вернуться в каталог</Link>
      </div>
    </main>
  );
}
