"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        action={formAction}
        className="w-full max-w-sm bg-white rounded-lg shadow p-8"
      >
        <h1 className="text-xl font-bold text-center mb-1">CMS 管理后台</h1>
        <p className="text-sm text-gray-400 text-center mb-6">请登录后继续操作</p>

        {state?.error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 rounded p-2.5">
            {state.error}
          </div>
        )}

        <label className="block text-sm font-medium mb-1" htmlFor="email">
          邮箱
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="admin@example.com"
          className="w-full mb-4 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-medium mb-1" htmlFor="password">
          密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="请输入密码"
          className="w-full mb-6 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded py-2 text-sm font-medium"
        >
          {pending ? "登录中..." : "登录"}
        </button>
      </form>
    </div>
  );
}
