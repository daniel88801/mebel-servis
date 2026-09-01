import Link from "next/link";

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
