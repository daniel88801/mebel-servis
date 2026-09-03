import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "ms_inbox";

function expectedToken() {
  const password = process.env.INBOX_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("inbox-v1").digest("hex");
}

export function inboxConfigured() {
  return Boolean(process.env.INBOX_PASSWORD);
}

export function inboxTokenMatches(password: string) {
  const expected = process.env.INBOX_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function hasInboxSession() {
  const token = expectedToken();
  if (!token) return false;
  const jar = await cookies();
  const got = jar.get(COOKIE)?.value;
  if (!got || got.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(token));
}

export async function setInboxSession() {
  const token = expectedToken();
  if (!token) return;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearInboxSession() {
  const jar = await cookies();
  jar.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
}
