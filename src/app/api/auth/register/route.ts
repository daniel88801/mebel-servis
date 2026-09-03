import { NextResponse } from "next/server";
import { createSession, createUser, findUserByEmail, hashPassword } from "@/lib/auth";
import { clean, isStrongPassword, looksLikeEmail, looksLikePhone } from "@/lib/validate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const raw = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = clean(raw.name, 120);
  const email = clean(raw.email, 120).toLowerCase();
  const phone = clean(raw.phone, 40);
  const company = clean(raw.company, 160);
  const password = typeof raw.password === "string" ? raw.password : "";

  if (!name) return NextResponse.json({ error: "Укажите имя" }, { status: 422 });
  if (!looksLikeEmail(email)) return NextResponse.json({ error: "Проверьте электронную почту" }, { status: 422 });
  if (!looksLikePhone(phone)) return NextResponse.json({ error: "Проверьте номер телефона" }, { status: 422 });
  if (!isStrongPassword(password)) {
    return NextResponse.json({ error: "Пароль не короче 8 символов" }, { status: 422 });
  }
  if (findUserByEmail(email)) {
    return NextResponse.json({ error: "Этот email уже зарегистрирован" }, { status: 409 });
  }

  const id = createUser({
    email,
    passwordHash: await hashPassword(password),
    name,
    phone,
    company,
  });
  await createSession(id);
  return NextResponse.json({ ok: true });
}
