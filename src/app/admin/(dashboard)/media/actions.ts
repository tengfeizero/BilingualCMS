"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { PERMISSIONS } from "@/lib/permissions";
import { requirePermission } from "@/services/auth.service";
import {
  deleteMediaRecord,
  saveMediaRecord,
  UPLOADS_DIR,
} from "@/services/media.service";

const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_EXT = [
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg", ".ico",
  ".bmp", ".pdf", ".txt", ".mp4", ".webm", ".mp3", ".wav", ".zip",
];

export type MediaState = { error?: string } | null;

export async function uploadMediaAction(
  _prev: MediaState,
  formData: FormData,
): Promise<MediaState> {
  const user = await requirePermission(PERMISSIONS.MEDIA_UPLOAD);
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "未选择文件" };
  if (file.size === 0) return { error: "文件为空" };
  if (file.size > MAX_SIZE) return { error: "文件不能超过 20MB" };

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) return { error: "不支持的文件类型" };

  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  await fs.promises.writeFile(path.join(UPLOADS_DIR, filename), bytes);

  // 图片读取宽高（svg 跳过）
  let width: number | null = null;
  let height: number | null = null;
  const isImage = file.type.startsWith("image/") && file.type !== "image/svg+xml";
  if (isImage) {
    try {
      const meta = await sharp(bytes).metadata();
      width = meta.width ?? null;
      height = meta.height ?? null;
    } catch {
      // 忽略元数据读取失败
    }
  }

  saveMediaRecord({
    filename,
    originalName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    width,
    height,
    category: isImage
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : "file",
    uploaderId: user.id,
  });
  revalidatePath("/admin/media");
  return null;
}

export async function deleteMediaAction(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.MEDIA_DELETE);
  const id = Number(formData.get("id"));
  if (id) {
    deleteMediaRecord(user.id, id);
    revalidatePath("/admin/media");
  }
  redirect("/admin/media");
}
