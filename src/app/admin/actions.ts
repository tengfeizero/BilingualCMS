"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { login, logout } from "@/services/auth.service";

const loginSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(1, "请输入密码"),
});

export type LoginState = { error?: string } | null;

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "参数错误" };
  }
  const user = await login(parsed.data.email, parsed.data.password);
  if (!user) return { error: "邮箱或密码错误" };
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}
