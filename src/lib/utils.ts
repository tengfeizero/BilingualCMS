/** 生成 URL 别名（支持中文保留） */
export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `post-${Date.now().toString(36)}`;
}

/**
 * 解码动态路由段参数。
 * Next.js 16 的 page 组件 params 中，非 ASCII 字符保持百分号编码形式
 * （如 %E6%88%91），而 route handler 会自动解码，这里统一做安全解码。
 */
export function decodeSlug(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** SQLite datetime('now') 返回 UTC "YYYY-MM-DD HH:MM:SS"，统一转本地时间格式化 */
export function formatDate(
  value: string | null | undefined,
  withTime = true,
): string {
  if (!value) return "-";
  const date = new Date(value.includes("T") ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  if (!withTime) return `${y}-${m}-${d}`;
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${y}-${m}-${d} ${h}:${min}`;
}

/** 分页工具 */
export function paginate(page: number, pageSize: number) {
  const safePage = Math.max(1, page);
  const safeSize = Math.min(100, Math.max(1, pageSize));
  return { offset: (safePage - 1) * safeSize, limit: safeSize, page: safePage };
}

/** 列表状态中文映射 */
export const POST_STATUS_LABEL: Record<string, string> = {
  draft: "草稿",
  pending: "待审核",
  published: "已发布",
  archived: "已归档",
};
