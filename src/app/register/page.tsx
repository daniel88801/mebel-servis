import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { AuthScreen } from "@/components/AuthScreen";
import { getCurrentUser } from "@/lib/auth";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Регистрация",
  description:
    "Регистрация кабинета заказчика ООО «Мебель-Сервис»: сохраняйте заявки на металлическую мебель для казарм, общежитий и школ с завода в Нижнем Новгороде.",
  path: "/register",
  robots: { index: false },
});

export default async function RegisterPage({
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
      crumb="Регистрация"
      title="Создать кабинет"
      lead="Нужен, чтобы оформлять заказы и не терять спецификации. Оплата — по счёту после КП."
    >
      <AuthForm mode="register" next={dest} />
    </AuthScreen>
  );
}
