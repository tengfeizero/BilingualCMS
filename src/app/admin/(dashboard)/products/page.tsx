import Link from "next/link";
import ConfirmForm from "@/components/admin/ConfirmForm";
import { PageHeader } from "@/components/admin/ui";
import { PERMISSIONS } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import { requirePermission } from "@/services/auth.service";
import { listProducts } from "@/services/product.service";
import { deleteProductAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  draft: "草稿",
  published: "已发布",
  archived: "已归档",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission(PERMISSIONS.PRODUCT_MANAGE);
  const sp = await searchParams;
  const keyword = typeof sp.q === "string" ? sp.q : "";
  const page = Math.max(1, Number(sp.page ?? 1));

  const { items, total, pageSize } = listProducts({
    page,
    pageSize: 20,
    keyword: keyword || undefined,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex items-start justify-between">
        <PageHeader title="产品管理" description={`共 ${total} 个产品`} />
        <Link
          href="/admin/products/new"
          className="bg-gray-900 hover:bg-gray-700 text-white rounded px-4 py-2 text-sm"
        >
          + 新建产品
        </Link>
      </div>

      <form action="/admin/products" method="get" className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={keyword}
          placeholder="搜索产品名称（中/英文）"
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
            {keyword ? "未找到匹配的产品" : "暂无产品，点击右上角创建"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="px-4 py-2.5 w-16">ID</th>
                <th className="px-4 py-2.5">产品名称</th>
                <th className="px-4 py-2.5 w-40">英文名</th>
                <th className="px-4 py-2.5 w-24">状态</th>
                <th className="px-4 py-2.5 w-32">创建时间</th>
                <th className="px-4 py-2.5 w-28">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-2.5 text-gray-400">{p.id}</td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="hover:text-blue-600"
                    >
                      {p.name}
                    </Link>
                    {p.isFeatured === 1 && (
                      <span className="ml-2 text-xs bg-amber-50 text-amber-700 rounded px-1.5 py-0.5">
                        精选
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {p.nameEn ?? "-"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-xs rounded px-2 py-0.5 ${
                        p.status === "published"
                          ? "bg-green-50 text-green-700"
                          : p.status === "draft"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-4 py-2.5 flex gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      编辑
                    </Link>
                    <ConfirmForm
                      action={deleteProductAction}
                      confirmMessage={`确定删除产品「${p.name}」吗？`}
                      hidden={[{ name: "id", value: p.id }]}
                    >
                      <button className="text-red-600 hover:underline text-xs">
                        删除
                      </button>
                    </ConfirmForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Link
            href={`/admin/products?${new URLSearchParams({
              ...(keyword ? { q: keyword } : {}),
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
            href={`/admin/products?${new URLSearchParams({
              ...(keyword ? { q: keyword } : {}),
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
