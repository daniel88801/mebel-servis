import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getDb } from "./db";

const scryptAsync = promisify(scrypt);
const COOKIE = "ms_session";
const SESSION_DAYS = 30;

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string;
  company: string;
  created_at: string;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${buf.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hex] = stored.split(":");
  if (!salt || !hex) return false;
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hex, "hex");
  if (buf.length !== expected.length) return false;
  return timingSafeEqual(buf, expected);
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expires = Math.floor(Date.now() / 1000) + SESSION_DAYS * 24 * 60 * 60;
  getDb()
    .prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .run(hashToken(token), userId, expires);
  const jar = await cookies();
  jar.set(COOKIE, token, cookieOptions(SESSION_DAYS * 24 * 60 * 60));
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  }
  jar.delete(COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const now = Math.floor(Date.now() / 1000);
  const row = getDb()
    .prepare(
      `SELECT u.id, u.email, u.name, u.phone, u.company, u.created_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(hashToken(token), now) as User | undefined;
  return row ?? null;
}

export function findUserByEmail(email: string) {
  return getDb()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.toLowerCase()) as (User & { password_hash: string }) | undefined;
}

export function createUser(input: {
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  company: string;
}) {
  const id = randomBytes(12).toString("hex");
  const created = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO users (id, email, password_hash, name, phone, company, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, input.email.toLowerCase(), input.passwordHash, input.name, input.phone, input.company, created);
  return id;
}

export function updateUser(id: string, input: { name: string; phone: string; company: string }) {
  getDb()
    .prepare("UPDATE users SET name = ?, phone = ?, company = ? WHERE id = ?")
    .run(input.name, input.phone, input.company, id);
}

export function newId() {
  return randomBytes(12).toString("hex");
}
