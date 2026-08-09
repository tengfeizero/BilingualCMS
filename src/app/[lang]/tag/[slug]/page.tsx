import Pagination from "@/components/front/Pagination";
import PostCard, { type PostListItem } from "@/components/front/PostCard";
import { listPostsByTag } from "@/services/post.service";
import { decodeSlug } from "@/lib/utils";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const search = await searchParams;
  const page = Math.max(1, Number(search.page ?? 1));
  const pageSize = 10;

  const { items, total, tag } = listPostsByTag(decodeSlug(slug), page, pageSize);
  if (!tag) notFound();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-(--t-text)">标签：{tag.name}</h1>
        <p className="text-sm text-(--t-muted2) mt-1">共 {total} 篇文章</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-(--t-faint)">该标签下暂无文章</div>
      ) : (
        <div className="space-y-4">
          {items.map((post) => (
            <PostCard key={post.id} post={post as PostListItem} lang={lang} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(p) => `/${lang}/tag/${tag.slug}?page=${p}`}
      />
    </div>
  );
}
