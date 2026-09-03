import { NextResponse } from "next/server";
import { createSession, findUserByEmail, verifyPassword } from "@/lib/auth";
import { clean, looksLikeEmail } from "@/lib/validate";

export const runtime = "nodejs";

const attempts = new Map<string, { n: number; t: number }>();

function limited(email: string) {
  const now = Date.now();
  const rec = attempts.get(email);
  if (!rec || now - rec.t > 15 * 60 * 1000) {
    attempts.set(email, { n: 1, t: now });
    return false;
  }
  rec.n += 1;
  rec.t = now;
  return rec.n > 8;
}

export async function POST(request: Request) {
  const raw = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const email = clean(raw.email, 120).toLowerCase();
  const password = typeof raw.password === "string" ? raw.password : "";

  if (!looksLikeEmail(email) || !password) {
    return NextResponse.json({ error: "Укажите почту и пароль" }, { status: 422 });
  }
  if (limited(email)) {
    return NextResponse.json({ error: "Слишком много попыток. Подождите 15 минут." }, { status: 429 });
  }

  const user = findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Неверная почта или пароль" }, { status: 401 });
  }

  await createSession(user.id);
  attempts.delete(email);
  return NextResponse.json({ ok: true });
}
