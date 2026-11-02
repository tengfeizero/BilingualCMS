import Pagination from "@/components/front/Pagination";
import PostCard, { type PostListItem } from "@/components/front/PostCard";
import { getCategoryBySlug } from "@/services/category.service";
import { listPosts } from "@/services/post.service";
import { decodeSlug } from "@/lib/utils";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
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

  const categorySlug = decodeSlug(slug);
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();
  const isEn = lang === "en";
  const categoryName = (isEn && category.nameEn) || category.name;
  const categoryDescription =
    (isEn && category.descriptionEn) || category.description;

  const { items, total } = listPosts({
    page,
    pageSize,
    categorySlug,
    publishedOnly: true,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-(--t-text)">
          {isEn ? "Category" : "分类"}：{categoryName}
        </h1>
        {categoryDescription && (
          <p className="text-sm text-(--t-muted2) mt-2">{categoryDescription}</p>
        )}
        <p className="text-sm text-(--t-muted2) mt-1">
          {isEn ? `${total} articles` : `共 ${total} 篇文章`}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-(--t-faint)">
          {isEn ? "No articles in this category yet" : "该分类下暂无文章"}
        </div>
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
        buildHref={(p) => `/${lang}/category/${categorySlug}?page=${p}`}
      />
    </div>
  );
}
