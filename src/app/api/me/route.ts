import { NextResponse } from "next/server";
import { getCurrentUser, updateUser } from "@/lib/auth";
import { clean, looksLikePhone } from "@/lib/validate";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      company: user.company,
    },
  });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нужно войти" }, { status: 401 });
  const raw = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = clean(raw.name, 120);
  const phone = clean(raw.phone, 40);
  const company = clean(raw.company, 160);
  if (!name) return NextResponse.json({ error: "Укажите имя" }, { status: 422 });
  if (phone && !looksLikePhone(phone)) {
    return NextResponse.json({ error: "Проверьте номер телефона" }, { status: 422 });
  }
  updateUser(user.id, { name, phone, company });
  return NextResponse.json({ ok: true, user: { ...user, name, phone, company } });
}
