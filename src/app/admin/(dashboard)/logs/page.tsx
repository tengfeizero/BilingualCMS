import Link from "next/link";
import { PERMISSIONS } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import { requirePermission } from "@/services/auth.service";
import { listAuditLogs, ACTION_LABEL } from "@/services/audit.service";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function actionLabel(action: string): string {
  return ACTION_LABEL[action] ?? action;
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission(PERMISSIONS.AUDIT_VIEW);
  const params = await searchParams;
  const keyword = typeof params.q === "string" ? params.q : "";
  const page = Math.max(1, Number(params.page ?? 1));

  const { items, total, pageSize } = listAuditLogs({
    page,
    pageSize: 20,
    keyword: keyword || undefined,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <PageHeader
        title="操作日志"
        description={`共 ${total} 条记录`}
      />

      <form action="/admin/logs" method="get" className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={keyword}
          placeholder="搜索操作类型 / 详情 / 用户名"
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
          <div className="p-10 text-center text-sm text-gray-400">暂无日志</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="px-4 py-2.5 w-32">时间</th>
                <th className="px-4 py-2.5 w-24">操作人</th>
                <th className="px-4 py-2.5 w-36">操作</th>
                <th className="px-4 py-2.5">详情</th>
                <th className="px-4 py-2.5 w-40">目标</th>
              </tr>
            </thead>
            <tbody>
              {items.map((log) => (
                <tr key={log.id} className="border-b last:border-0">
                  <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-2.5">{log.username ?? "-"}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-0.5">
                      {actionLabel(log.action)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700 truncate max-w-xs">
                    {log.detail ?? "-"}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs">
                    {log.targetType ? `${log.targetType}#${log.targetId ?? ""}` : "-"}
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
            href={`/admin/logs?${new URLSearchParams({
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
            href={`/admin/logs?${new URLSearchParams({
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
