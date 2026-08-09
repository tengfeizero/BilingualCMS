import { NextRequest, NextResponse } from "next/server";
import { listPosts } from "@/services/post.service";

export const dynamic = "force-dynamic";

/** GET /api/posts?page=1&pageSize=10&category=slug&q=keyword */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Number(sp.get("page") ?? 1);
  const pageSize = Math.min(50, Number(sp.get("pageSize") ?? 10));
  const category = sp.get("category") ?? undefined;
  const keyword = sp.get("q") ?? undefined;

  const result = listPosts({
    page,
    pageSize,
    categorySlug: category,
    keyword,
    publishedOnly: true,
  });

  return NextResponse.json({
    items: result.items.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      coverImage: p.coverImage,
      category: p.categoryName,
      author: p.authorName,
      viewCount: p.viewCount,
      publishedAt: p.publishedAt,
    })),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  });
}
