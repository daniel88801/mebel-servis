import { NextResponse } from "next/server";
import { clearInboxSession } from "@/lib/inbox";

export const runtime = "nodejs";

export async function POST() {
  await clearInboxSession();
  return NextResponse.json({ ok: true });
}
