import { NextResponse } from "next/server";
import { LEGAL_VERSION } from "@/lib/legal";
import { logCookieConsent } from "@/lib/store";

export const runtime = "nodejs";

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "";
  return request.headers.get("x-real-ip") ?? "";
}

export async function POST(request: Request) {
  const raw = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const choice = raw.choice === "necessary" ? "necessary" : raw.choice === "all" ? "all" : "";
  if (!choice) return NextResponse.json({ error: "Нет выбора" }, { status: 422 });

  const version = typeof raw.version === "string" && raw.version ? raw.version.slice(0, 32) : LEGAL_VERSION;
  logCookieConsent({
    choice,
    version,
    ip: clientIp(request).slice(0, 80),
    userAgent: (request.headers.get("user-agent") ?? "").slice(0, 300),
  });
  return NextResponse.json({ ok: true });
}
