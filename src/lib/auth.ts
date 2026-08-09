/**
 * 基于 JWT（jose）的自定义会话认证。
 * 说明：README 原计划使用 Auth.js v5，但该库与 Next.js 16 存在兼容性风险，
 * 故改用 jose 签发 httpOnly Cookie JWT，实现同样的会话能力且零额外依赖。
 */
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "cms_session";
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 天（秒）

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("缺少环境变量 AUTH_SECRET，请在 .env.local 中配置");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.sub ? Number(payload.sub) : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** 读取当前会话中的用户 ID（无会话返回 null） */
export async function getSessionUserId(): Promise<number | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
