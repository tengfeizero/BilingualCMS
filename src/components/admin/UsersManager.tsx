"use client";

import { useActionState } from "react";
import {
  createUserAction,
  toggleUserStatusAction,
  updateUserRoleAction,
} from "@/app/admin/(dashboard)/users/actions";
import { PageHeader, FormError, btnPrimaryCls, inputCls, labelCls } from "./ui";
import { ROLE_LABEL } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";

interface UserItem {
  id: number;
  email: string;
  username: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function UsersManager({
  users,
  currentUserId,
}: {
  users: UserItem[];
  currentUserId: number;
}) {
  const [state, formAction, pending] = useActionState(createUserAction, null);

  return (
    <div>
      <PageHeader title="用户管理" description={`共 ${users.length} 个用户`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4 h-fit">
          <h2 className="font-medium mb-4">添加用户</h2>
          <form action={formAction} className="space-y-3">
            <FormError message={state?.error} />
            {state?.ok && (
              <div className="text-sm text-green-700 bg-green-50 rounded p-2.5">
                用户创建成功
              </div>
            )}
            <div>
              <label className={labelCls}>邮箱</label>
              <input
                name="email"
                type="email"
                required
                className={inputCls}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className={labelCls}>用户名</label>
              <input name="username" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>初始密码</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className={inputCls}
                placeholder="至少 6 位"
              />
            </div>
            <div>
              <label className={labelCls}>角色</label>
              <select name="role" defaultValue="author" className={inputCls}>
                <option value="author">作者</option>
                <option value="editor">编辑</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={pending}
              className={`${btnPrimaryCls} w-full`}
            >
              {pending ? "创建中..." : "创建用户"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="px-4 py-2.5">用户</th>
                <th className="px-4 py-2.5 w-28">角色</th>
                <th className="px-4 py-2.5 w-24">状态</th>
                <th className="px-4 py-2.5 w-36">注册时间</th>
                <th className="px-4 py-2.5 w-32">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.username}</div>
                    <div className="text-xs text-gray-400">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateUserRoleAction}>
                      <input type="hidden" name="id" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        onChange={(e) => e.target.form?.requestSubmit()}
                        disabled={u.id === currentUserId}
                        className="border border-gray-200 rounded px-2 py-1 text-xs"
                      >
                        {Object.entries(ROLE_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        u.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {u.status === "active" ? "正常" : "禁用"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(u.createdAt, false)}
                  </td>
                  <td className="px-4 py-3">
                    {u.id !== currentUserId ? (
                      <form
                        action={toggleUserStatusAction}
                        onSubmit={(e) => {
                          if (
                            !window.confirm(
                              u.status === "active"
                                ? `确定禁用用户 ${u.username} 吗？`
                                : `确定启用用户 ${u.username} 吗？`,
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="id" value={u.id} />
                        <button className="text-xs text-red-600 hover:underline">
                          {u.status === "active" ? "禁用" : "启用"}
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-gray-400">当前账号</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
