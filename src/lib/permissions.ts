/**
 * RBAC 权限定义。
 * 角色权限以代码为准（roles 表仅作记录），便于统一管理。
 */
export type Role = "super_admin" | "admin" | "editor" | "author";

export const PERMISSIONS = {
  POST_CREATE: "post:create",
  POST_UPDATE: "post:update",
  POST_DELETE: "post:delete",
  POST_PUBLISH: "post:publish",
  MEDIA_UPLOAD: "media:upload",
  MEDIA_DELETE: "media:delete",
  CATEGORY_MANAGE: "category:manage",
  USER_MANAGE: "user:manage",
  SETTING_MANAGE: "setting:manage",
  AUDIT_VIEW: "audit:view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS] | "*";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ["*"],
  admin: [
    PERMISSIONS.POST_CREATE,
    PERMISSIONS.POST_UPDATE,
    PERMISSIONS.POST_DELETE,
    PERMISSIONS.POST_PUBLISH,
    PERMISSIONS.MEDIA_UPLOAD,
    PERMISSIONS.MEDIA_DELETE,
    PERMISSIONS.CATEGORY_MANAGE,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.SETTING_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
  ],
  editor: [
    PERMISSIONS.POST_CREATE,
    PERMISSIONS.POST_UPDATE,
    PERMISSIONS.POST_PUBLISH,
    PERMISSIONS.MEDIA_UPLOAD,
  ],
  author: [
    PERMISSIONS.POST_CREATE,
    PERMISSIONS.POST_UPDATE,
    PERMISSIONS.MEDIA_UPLOAD,
  ],
};

export function hasPermission(role: string, perm: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as Role] ?? [];
  return perms.includes("*") || perms.includes(perm);
}

/** 角色中文名 */
export const ROLE_LABEL: Record<string, string> = {
  super_admin: "超级管理员",
  admin: "管理员",
  editor: "编辑",
  author: "作者",
};
