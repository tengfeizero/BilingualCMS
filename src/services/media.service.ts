import { count, desc, eq } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";
import { db } from "@/db";
import { media } from "@/db/schema";
import { paginate } from "@/lib/utils";
import { logAudit } from "./audit.service";

export const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export interface SaveMediaInput {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  thumbUrl?: string | null;
  category: string;
  uploaderId?: number | null;
}

export function saveMediaRecord(input: SaveMediaInput): number {
  const result = db
    .insert(media)
    .values({
      filename: input.filename,
      originalName: input.originalName,
      url: `/uploads/${input.filename}`,
      mimeType: input.mimeType,
      size: input.size,
      width: input.width ?? null,
      height: input.height ?? null,
      thumbUrl: input.thumbUrl ?? null,
      category: input.category,
      uploaderId: input.uploaderId ?? null,
    })
    .run();
  return Number(result.lastInsertRowid);
}

export function listMedia({
  page = 1,
  pageSize = 24,
  category,
}: {
  page?: number;
  pageSize?: number;
  category?: string;
} = {}) {
  const { offset, limit } = paginate(page, pageSize);
  const where = category ? eq(media.category, category) : undefined;
  const items = db
    .select()
    .from(media)
    .where(where)
    .orderBy(desc(media.id))
    .limit(limit)
    .offset(offset)
    .all();
  const total =
    db.select({ value: count() }).from(media).where(where).get()?.value ?? 0;
  return { items, total, page, pageSize };
}

export function getMediaById(id: number) {
  return db.select().from(media).where(eq(media.id, id)).get() ?? null;
}

export function deleteMediaRecord(userId: number, id: number) {
  const item = getMediaById(id);
  if (!item) return;
  try {
    const filePath = path.join(UPLOADS_DIR, item.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (item.thumbUrl) {
      const thumbPath = path.join(UPLOADS_DIR, path.basename(item.thumbUrl));
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }
  } catch {
    // 文件删除失败不阻塞记录删除
  }
  db.delete(media).where(eq(media.id, id)).run();
  logAudit({
    userId,
    action: "media.delete",
    targetType: "media",
    targetId: id,
    detail: item.originalName,
  });
}
