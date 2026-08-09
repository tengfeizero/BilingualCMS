import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, type User } from "@/db/schema";
import {
  clearSessionCookie,
  createSessionToken,
  getSessionUserId,
  setSessionCookie,
} from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/permissions";

export type SafeUser = Omit<User, "password">;

function toSafeUser(user: User): SafeUser {
  const { password: _password, ...rest } = user;
  return rest;
}

/** 当前登录用户（无会话返回 null） */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user || user.status !== "active") return null;
  return toSafeUser(user);
}

/** 邮箱密码登录，成功后写入会话 Cookie */
export async function login(
  email: string,
  password: string,
): Promise<SafeUser | null> {
  const user = db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .get();
  if (!user || user.status !== "active") return null;
  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return null;
  const token = await createSessionToken(user.id);
  await setSessionCookie(token);
  return toSafeUser(user);
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
}

/** 要求已登录，否则重定向到登录页 */
export async function requireLogin(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** 要求已登录且拥有指定权限，否则跳转 */
export async function requirePermission(perm: Permission): Promise<SafeUser> {
  const user = await requireLogin();
  if (!hasPermission(user.role, perm)) redirect("/admin/forbidden");
  return user;
}
