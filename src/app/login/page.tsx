import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { AuthScreen } from "@/components/AuthScreen";
import { getCurrentUser } from "@/lib/auth";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Вход в кабинет",
  description:
    "Вход в кабинет заказчика ООО «Мебель-Сервис»: заявки и заказы на металлическую и ЛДСП-мебель для объектов с производства в Нижнем Новгороде.",
  path: "/login",
  robots: { index: false },
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  const { next } = await searchParams;
  const dest = next && next.startsWith("/") ? next : "/account";
  if (user) redirect(dest);

  return (
    <AuthScreen
      crumb="Вход"
      title="Вход в кабинет"
      lead="После входа гостевая корзина перенесётся в кабинет. Заказы и профиль хранятся на сервере."
    >
      <AuthForm mode="login" next={dest} />
    </AuthScreen>
  );
}
