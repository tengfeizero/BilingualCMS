import Link from "next/link";

export default function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Link
        href={buildHref(page - 1)}
        className={`text-sm text-(--t-muted) hover:text-(--t-text) ${
          page <= 1 ? "pointer-events-none opacity-40" : ""
        }`}
      >
        ← 上一页
      </Link>
      <span className="text-sm text-(--t-faint)">
        {page} / {totalPages}
      </span>
      <Link
        href={buildHref(page + 1)}
        className={`text-sm text-(--t-muted) hover:text-(--t-text) ${
          page >= totalPages ? "pointer-events-none opacity-40" : ""
        }`}
      >
        下一页 →
      </Link>
    </div>
  );
}
