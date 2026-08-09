"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";
import type { SafeUser } from "@/services/auth.service";
import { hasPermission, PERMISSIONS, type Permission } from "@/lib/permissions";

const NAV_ITEMS: { href: string; label: string; perm?: Permission }[] = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/posts", label: "文章管理" },
  { href: "/admin/categories", label: "分类管理", perm: PERMISSIONS.CATEGORY_MANAGE },
  { href: "/admin/media", label: "媒体库", perm: PERMISSIONS.MEDIA_UPLOAD },
  { href: "/admin/users", label: "用户管理", perm: PERMISSIONS.USER_MANAGE },
  { href: "/admin/logs", label: "操作日志", perm: PERMISSIONS.AUDIT_VIEW },
  { href: "/admin/settings", label: "系统设置", perm: PERMISSIONS.SETTING_MANAGE },
];

export default function AdminNav({ user }: { user: SafeUser }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) =>
    item.perm ? hasPermission(user.role, item.perm) : true,
  );

  return (
    <aside className="w-56 bg-gray-900 text-gray-200 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-700">
        <div className="font-bold text-white">CMS 后台</div>
        <div className="text-xs text-gray-400 mt-1 truncate">{user.username}</div>
      </div>
      <nav className="flex-1 py-2">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2.5 text-sm ${
                active ? "bg-gray-700 text-white" : "hover:bg-gray-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAction} className="p-4 border-t border-gray-700">
        <button className="w-full text-left text-sm text-gray-300 hover:text-white">
          退出登录
        </button>
      </form>
    </aside>
  );
}
