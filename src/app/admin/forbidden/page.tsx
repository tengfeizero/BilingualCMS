import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">403</h1>
      <p className="text-gray-500 mt-2">当前账号没有执行此操作的权限</p>
      <Link
        href="/admin"
        className="mt-4 text-sm text-blue-600 hover:underline"
      >
        返回后台首页
      </Link>
    </div>
  );
}
