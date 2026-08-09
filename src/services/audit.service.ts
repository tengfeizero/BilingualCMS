import { and, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { paginate } from "@/lib/utils";

export function logAudit(input: {
  userId?: number | null;
  action: string;
  targetType?: string | null;
  targetId?: number | null;
  detail?: string | null;
  ip?: string | null;
}) {
  try {
    db.insert(auditLogs)
      .values({
        userId: input.userId ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        detail: input.detail ?? null,
        ip: input.ip ?? null,
      })
      .run();
  } catch {
    // 日志失败不影响主流程
  }
}

/** 操作类型 → 中文标签（与后台日志页面保持一致，用于中文关键词搜索） */
export const ACTION_LABEL: Record<string, string> = {
  "post.create": "创建文章",
  "post.update": "更新文章",
  "post.delete": "删除文章",
  "post.status:published": "发布文章",
  "post.status:archived": "下线文章",
  "post.restore": "恢复版本",
  "category.create": "创建分类",
  "category.update": "更新分类",
  "category.delete": "删除分类",
  "media.delete": "删除媒体",
  "user.create": "创建用户",
  "user.update": "更新用户",
  "user.delete": "删除用户",
  "setting.update": "更新设置",
};

/** 操作日志列表（可筛选操作类型 / 关键词） */
export function listAuditLogs({
  page = 1,
  pageSize = 20,
  keyword,
}: {
  page?: number;
  pageSize?: number;
  keyword?: string;
} = {}) {
  const { offset, limit } = paginate(page, pageSize);
  const conditions = [];
  if (keyword) {
    // 中文动作词（如“创建”）映射到 action 代码，保证中文关键词也能命中
    const actionCodes = Object.entries(ACTION_LABEL)
      .filter(([, label]) => label.includes(keyword))
      .map(([code]) => code);
    conditions.push(
      or(
        like(auditLogs.action, `%${keyword}%`),
        like(auditLogs.detail, `%${keyword}%`),
        like(users.username, `%${keyword}%`),
        ...actionCodes.map((code) => eq(auditLogs.action, code)),
      ),
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const items = db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      targetType: auditLogs.targetType,
      targetId: auditLogs.targetId,
      detail: auditLogs.detail,
      ip: auditLogs.ip,
      createdAt: auditLogs.createdAt,
      username: users.username,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(where)
    .orderBy(desc(auditLogs.id))
    .limit(limit)
    .offset(offset)
    .all();
  const total =
    db
      .select({ value: count() })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(where)
      .get()?.value ?? 0;
  return { items, total, page, pageSize };
}
