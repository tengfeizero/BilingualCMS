import Link from "next/link";
import ConfirmForm from "@/components/admin/ConfirmForm";
import InquiryStatusSelect from "@/components/admin/InquiryStatusSelect";
import { PageHeader } from "@/components/admin/ui";
import { PERMISSIONS } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import { requirePermission } from "@/services/auth.service";
import { listInquiries } from "@/services/inquiry.service";
import { getProductById } from "@/services/product.service";
import { deleteInquiryAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  new: "待处理",
  processing: "处理中",
  done: "已处理",
};

const STATUS_BADGE: Record<string, string> = {
  new: "bg-red-50 text-red-700",
  processing: "bg-amber-50 text-amber-700",
  done: "bg-green-50 text-green-700",
};

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission(PERMISSIONS.INQUIRY_MANAGE);
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const page = Math.max(1, Number(sp.page ?? 1));

  const { items, total, pageSize } = listInquiries({
    page,
    pageSize: 20,
    status: status || undefined,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const newCount = listInquiries({ page: 1, pageSize: 1, status: "new" }).total;

  return (
    <div>
      <PageHeader
        title="询盘管理"
        description={`共 ${total} 条，其中待处理 ${newCount} 条`}
      />

      {/* 状态筛选 */}
      <div className="mb-4 flex gap-2">
        {[
          { value: "", label: "全部" },
          { value: "new", label: "待处理" },
          { value: "processing", label: "处理中" },
          { value: "done", label: "已处理" },
        ].map((s) => (
          <Link
            key={s.value}
            href={`/admin/inquiries${s.value ? `?status=${s.value}` : ""}`}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              status === s.value
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            暂无询盘记录
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="px-4 py-2.5 w-28">时间</th>
                <th className="px-4 py-2.5 w-28">客户</th>
                <th className="px-4 py-2.5 w-44">邮箱 / WhatsApp</th>
                <th className="px-4 py-2.5 w-40">产品</th>
                <th className="px-4 py-2.5">询盘内容</th>
                <th className="px-4 py-2.5 w-24">状态</th>
                <th className="px-4 py-2.5 w-32">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inq) => {
                const product = inq.productId
                  ? getProductById(inq.productId)
                  : null;
                return (
                  <tr key={inq.id} className="border-b last:border-0 align-top">
                    <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(inq.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{inq.name}</div>
                      {inq.company && (
                        <div className="text-xs text-gray-400">{inq.company}</div>
                      )}
                      {inq.country && (
                        <div className="text-xs text-gray-400">{inq.country}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs break-all">
                      <div>{inq.email}</div>
                      {inq.whatsapp && (
                        <div className="text-gray-500">{inq.whatsapp}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      {product ? product.name : "通用咨询"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-pre-wrap max-w-xs">
                      {inq.message ?? "-"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-xs rounded px-2 py-0.5 ${
                          STATUS_BADGE[inq.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {STATUS_LABEL[inq.status] ?? inq.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <InquiryStatusSelect id={inq.id} status={inq.status} />
                      <ConfirmForm
                        action={deleteInquiryAction}
                        confirmMessage="确定删除该询盘记录吗？"
                        hidden={[{ name: "id", value: inq.id }]}
                        className="mt-1"
                      >
                        <button className="text-red-600 hover:underline text-xs">
                          删除
                        </button>
                      </ConfirmForm>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Link
            href={`/admin/inquiries?${new URLSearchParams({
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
            href={`/admin/inquiries?${new URLSearchParams({
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
