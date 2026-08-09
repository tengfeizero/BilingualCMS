import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".bmp": "image/bmp",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".zip": "application/zip",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const filename = segments.join("/");
  const safePath = path.normalize(path.join(UPLOADS_DIR, filename));

  // 防目录穿越
  if (
    !safePath.startsWith(UPLOADS_DIR) ||
    !fs.existsSync(safePath) ||
    !fs.statSync(safePath).isFile()
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const buf = fs.readFileSync(safePath);
  const ext = path.extname(safePath).toLowerCase();
  return new NextResponse(buf, {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
