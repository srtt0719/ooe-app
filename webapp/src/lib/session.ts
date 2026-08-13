import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// 共通パスワード＋利用者選択の軽量セッション。
// セッションは60日間保持し、その間はパスワード入力なしで使える。
const SESSION_COOKIE = "daiei_session";
const PASSWORD_OK_COOKIE = "daiei_pw_ok";
const SESSION_DAYS = 60;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET が設定されていません");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function pack(userId: number, exp: number): string {
  const payload = `${userId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

function unpack(token: string): { userId: number; exp: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userIdStr, expStr, sig] = parts;
  const payload = `${userIdStr}.${expStr}`;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return null;
  const userId = Number(userIdStr);
  if (!Number.isFinite(userId)) return null;
  return { userId, exp };
}

export async function createSession(userId: number) {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const token = pack(userId, exp);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(exp),
  });
  jar.delete(PASSWORD_OK_COOKIE);
}

export async function getSessionUserId(): Promise<number | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const parsed = unpack(token);
  return parsed?.userId ?? null;
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

// 共通パスワード確認後、利用者選択に進むまでの短時間だけ使う一時Cookie
export async function markPasswordVerified() {
  const jar = await cookies();
  jar.set(PASSWORD_OK_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
}

export async function isPasswordVerified(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(PASSWORD_OK_COOKIE)?.value === "1";
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
