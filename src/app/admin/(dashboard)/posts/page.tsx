import Link from "next/link";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { formatDate, POST_STATUS_LABEL } from "@/lib/utils";
import { getCurrentUser } from "@/services/auth.service";
import { listPosts } from "@/services/post.service";
import ConfirmForm from "@/components/admin/ConfirmForm";
import {
  deletePostAction,
  setPostStatusAction,
} from "./actions";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const STATUS_TABS = [
  { value: "", label: "全部" },
  { value: "draft", label: "草稿" },
  { value: "pending", label: "待审核" },
  { value: "published", label: "已发布" },
  { value: "archived", label: "已归档" },
];

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const keyword = typeof params.q === "string" ? params.q : "";
  const page = Math.max(1, Number(params.page ?? 1));
  const user = await getCurrentUser();

  const canPublish = !!user && hasPermission(user.role, PERMISSIONS.POST_PUBLISH);
  const canDelete = !!user && hasPermission(user.role, PERMISSIONS.POST_DELETE);

  const { items, total, pageSize } = listPosts({
    page,
    pageSize: 15,
    status: status || undefined,
    keyword: keyword || undefined,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <PageHeader
        title="文章管理"
        description={`共 ${total} 篇文章`}
        action={
          <Link
            href="/admin/posts/new"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm font-medium"
          >
            + 新建文章
          </Link>
        }
      />

      {/* 状态筛选 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.value;
          const href = tab.value
            ? `/admin/posts?status=${tab.value}`
            : "/admin/posts";
          return (
            <Link
              key={tab.value}
              href={href}
              className={`px-3 py-1.5 text-sm rounded-full ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <form action="/admin/posts" method="get" className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={keyword}
          placeholder="搜索标题 / 内容"
          className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none"
        />
        <button
          type="submit"
          className="border border-gray-300 hover:bg-gray-50 rounded px-4 py-2 text-sm"
        >
          搜索
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            暂无文章
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="px-4 py-2.5">标题</th>
                <th className="px-4 py-2.5 w-28">分类</th>
                <th className="px-4 py-2.5 w-24">状态</th>
                <th className="px-4 py-2.5 w-20">浏览量</th>
                <th className="px-4 py-2.5 w-40">更新时间</th>
                <th className="px-4 py-2.5 w-56">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((post) => (
                <tr key={post.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-medium hover:text-blue-600"
                    >
                      {post.title}
                    </Link>
                    {post.isPinned === 1 && (
                      <span className="ml-2 text-xs text-orange-600 bg-orange-50 rounded px-1.5 py-0.5">
                        置顶
                      </span>
                    )}
                    {post.status === "published" && (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="ml-2 text-xs text-blue-500 hover:underline"
                        target="_blank"
                      >
                        查看
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {post.categoryName ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700"
                          : post.status === "draft"
                            ? "bg-gray-100 text-gray-600"
                            : post.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {POST_STATUS_LABEL[post.status] ?? post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{post.viewCount}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(post.updatedAt)}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      编辑
                    </Link>
                    {canPublish &&
                      (post.status === "published" ? (
                        <form action={setPostStatusAction}>
                          <input type="hidden" name="id" value={post.id} />
                          <input type="hidden" name="status" value="archived" />
                          <button className="text-gray-500 hover:underline text-xs">
                            下线
                          </button>
                        </form>
                      ) : (
                        <form action={setPostStatusAction}>
                          <input type="hidden" name="id" value={post.id} />
                          <input type="hidden" name="status" value="published" />
                          <button className="text-green-600 hover:underline text-xs">
                            发布
                          </button>
                        </form>
                      ))}
                    {canDelete && (
                      <ConfirmForm
                        action={deletePostAction}
                        confirmMessage="确定删除这篇文章吗？"
                        hidden={[{ name: "id", value: post.id }]}
                        className="inline"
                      >
                        <button className="text-red-600 hover:underline text-xs">
                          删除
                        </button>
                      </ConfirmForm>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Link
            href={`/admin/posts?${new URLSearchParams({
              ...(status ? { status } : {}),
              page: String(page - 1),
            })}`}
            className={`text-sm ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
          >
            ← 上一页
          </Link>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <Link
            href={`/admin/posts?${new URLSearchParams({
              ...(status ? { status } : {}),
              page: String(page + 1),
            })}`}
            className={`text-sm ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
          >
            下一页 →
          </Link>
        </div>
      )}
    </div>
  );
}
