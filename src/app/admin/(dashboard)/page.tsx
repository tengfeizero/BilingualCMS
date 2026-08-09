import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { media, posts, users } from "@/db/schema";
import { formatDate, POST_STATUS_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const postCount = db.select({ value: count() }).from(posts).get()?.value ?? 0;
  const publishedCount =
    db
      .select({ value: count() })
      .from(posts)
      .where(eq(posts.status, "published"))
      .get()?.value ?? 0;
  const pendingCount =
    db
      .select({ value: count() })
      .from(posts)
      .where(eq(posts.status, "pending"))
      .get()?.value ?? 0;
  const userCount = db.select({ value: count() }).from(users).get()?.value ?? 0;
  const mediaCount = db.select({ value: count() }).from(media).get()?.value ?? 0;

  const recentPosts = db
    .select({
      id: posts.id,
      title: posts.title,
      status: posts.status,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .orderBy(desc(posts.id))
    .limit(8)
    .all();

  const stats = [
    { label: "文章总数", value: postCount, href: "/admin/posts" },
    { label: "已发布", value: publishedCount, href: "/admin/posts?status=published" },
    { label: "待审核", value: pendingCount, href: "/admin/posts?status=pending" },
    { label: "媒体文件", value: mediaCount, href: "/admin/media" },
    { label: "用户", value: userCount, href: "/admin/users" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">仪表盘</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b font-medium">最近文章</div>
        {recentPosts.length === 0 ? (
          <div className="p-6 text-sm text-gray-400">暂无文章，点击右上角创建</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="px-4 py-2.5">标题</th>
                <th className="px-4 py-2.5 w-24">状态</th>
                <th className="px-4 py-2.5 w-40">时间</th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/posts/${p.id}`} className="hover:text-blue-600">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100">
                      {POST_STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {formatDate(p.publishedAt ?? p.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
