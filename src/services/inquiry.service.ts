import { and, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { paginate } from "@/lib/utils";

export interface InquiryInput {
  name: string;
  email: string;
  whatsapp?: string | null;
  country?: string | null;
  company?: string | null;
  productId?: number | null;
  message?: string | null;
  ip?: string | null;
}

/** 公开提交询盘（前台） */
export function createInquiry(input: InquiryInput): number {
  const r = db
    .insert(inquiries)
    .values({
      name: input.name,
      email: input.email,
      whatsapp: input.whatsapp || null,
      country: input.country || null,
      company: input.company || null,
      productId: input.productId ?? null,
      message: input.message || null,
      ip: input.ip || null,
      status: "new",
    })
    .run();
  return Number(r.lastInsertRowid);
}

/** 询盘列表（后台，可筛选状态/关键词） */
export function listInquiries({
  page = 1,
  pageSize = 20,
  status,
  keyword,
}: {
  page?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
} = {}) {
  const { offset, limit } = paginate(page, pageSize);
  const conditions = [];
  if (status) conditions.push(eq(inquiries.status, status));
  if (keyword) {
    conditions.push(
      or(
        like(inquiries.name, `%${keyword}%`),
        like(inquiries.email, `%${keyword}%`),
        like(inquiries.company, `%${keyword}%`),
        like(inquiries.message, `%${keyword}%`),
      ),
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const items = db
    .select()
    .from(inquiries)
    .where(where)
    .orderBy(desc(inquiries.id))
    .limit(limit)
    .offset(offset)
    .all();

  const total =
    db
      .select({ value: count() })
      .from(inquiries)
      .where(where)
      .get()?.value ?? 0;

  return { items, total, page, pageSize };
}

/** 更新询盘状态 */
export function updateInquiryStatus(id: number, status: string) {
  db.update(inquiries)
    .set({ status })
    .where(eq(inquiries.id, id))
    .run();
}

export function deleteInquiry(id: number) {
  db.delete(inquiries).where(eq(inquiries.id, id)).run();
}

/** 未处理询盘数量（仪表盘） */
export function countNewInquiries(): number {
  return (
    db
      .select({ value: count() })
      .from(inquiries)
      .where(eq(inquiries.status, "new"))
      .get()?.value ?? 0
  );
}
