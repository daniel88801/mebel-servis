import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { AuthScreen } from "@/components/AuthScreen";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Вход в кабинет",
  robots: { index: false },
};

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
