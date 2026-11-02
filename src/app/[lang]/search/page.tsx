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
  const isEn = lang === "en";

  const posts: PostListItem[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    titleEn: item.title_en,
    slug: item.slug,
    excerpt: item.excerpt,
    excerptEn: item.excerpt_en,
    coverImage: item.cover_image,
    categoryName: item.category_name,
    categoryNameEn: item.category_name_en,
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
          {q
            ? isEn
              ? `Results for “${q}”`
              : `搜索「${q}」的结果`
            : isEn
              ? "Search"
              : "搜索"}
        </h1>
        <p className="text-sm text-(--t-muted2) mt-1">
          {isEn ? `${total} related articles found` : `共找到 ${total} 篇相关文章`}
        </p>
      </div>

      {!q ? (
        <div className="text-center py-20 text-(--t-faint)">
          {isEn ? "Enter a keyword to search" : "请输入关键词搜索"}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-(--t-faint)">
          {isEn
            ? `No articles found for “${q}”`
            : `没有找到与「${q}」相关的文章`}
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
