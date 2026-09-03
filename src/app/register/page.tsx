import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { AuthScreen } from "@/components/AuthScreen";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Регистрация",
  robots: { index: false },
};

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
