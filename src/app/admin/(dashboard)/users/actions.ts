"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PERMISSIONS } from "@/lib/permissions";
import { userSchema } from "@/lib/validate";
import { requirePermission } from "@/services/auth.service";
import { logAudit } from "@/services/audit.service";
import { createUser, toggleUserStatus, updateUserRole } from "@/services/user.service";

export type UserState = { error?: string; ok?: boolean } | null;

export async function createUserAction(
  _prev: UserState,
  formData: FormData,
): Promise<UserState> {
  const user = await requirePermission(PERMISSIONS.USER_MANAGE);
  const parsed = userSchema.safeParse({
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password") || undefined,
    role: formData.get("role") || "author",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "参数错误" };
  }
  if (!parsed.data.password) {
    return { error: "请输入密码" };
  }
  try {
    const id = createUser({
      email: parsed.data.email,
      username: parsed.data.username,
      password: parsed.data.password,
      role: parsed.data.role,
    });
    logAudit({
      userId: user.id,
      action: "user.create",
      targetType: "user",
      targetId: id,
      detail: parsed.data.email,
    });
  } catch {
    return { error: "邮箱或用户名已存在" };
  }
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function updateUserRoleAction(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.USER_MANAGE);
  const id = Number(formData.get("id"));
  const role = String(formData.get("role") ?? "");
  if (id && role) {
    updateUserRole(id, role);
    logAudit({
      userId: user.id,
      action: "user.role",
      targetType: "user",
      targetId: id,
      detail: `role → ${role}`,
    });
    revalidatePath("/admin/users");
  }
  redirect("/admin/users");
}

export async function toggleUserStatusAction(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.USER_MANAGE);
  const id = Number(formData.get("id"));
  if (id) {
    toggleUserStatus(id);
    logAudit({
      userId: user.id,
      action: "user.status",
      targetType: "user",
      targetId: id,
    });
    revalidatePath("/admin/users");
  }
  redirect("/admin/users");
}
