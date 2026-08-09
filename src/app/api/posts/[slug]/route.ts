import { NextResponse } from "next/server";
import { getPostTags, getPublishedPostBySlug } from "@/services/post.service";

export const dynamic = "force-dynamic";

/** GET /api/posts/:slug */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getPublishedPostBySlug(slug);
  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }
  const tags = getPostTags(post.id);
  return NextResponse.json({ ...post, tags });
}
