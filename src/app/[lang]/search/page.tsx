import Pagination from "@/components/front/Pagination";
import PostCard, { type PostListItem } from "@/components/front/PostCard";
import { searchPosts } from "@/services/search.service";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const page = Math.max(1, Number(sp.page ?? 1));
  const pageSize = 10;

  const { items, total } = searchPosts(q, page, pageSize);

  const posts: PostListItem[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    coverImage: item.cover_image,
    categoryName: item.category_name,
    categorySlug: item.category_slug,
    authorName: item.author_name,
    publishedAt: item.published_at,
    viewCount: item.view_count,
  }));

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-(--t-text)">
          {q ? `搜索「${q}」的结果` : "搜索"}
        </h1>
        <p className="text-sm text-(--t-muted2) mt-1">
          共找到 {total} 篇相关文章
        </p>
      </div>

      {!q ? (
        <div className="text-center py-20 text-(--t-faint)">请输入关键词搜索</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-(--t-faint)">
          没有找到与「{q}」相关的文章
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} lang={lang} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(p) => `/${lang}/search?q=${encodeURIComponent(q)}&page=${p}`}
      />
    </div>
  );
}
