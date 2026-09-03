import { NextResponse } from "next/server";
import { inboxConfigured, inboxTokenMatches, setInboxSession } from "@/lib/inbox";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!inboxConfigured()) return NextResponse.json({ error: "Лента не настроена" }, { status: 404 });
  const raw = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const password = typeof raw.password === "string" ? raw.password : "";
  if (!inboxTokenMatches(password)) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }
  await setInboxSession();
  return NextResponse.json({ ok: true });
}
