import Link from "next/link";
import ProductCard, { type ProductListItem } from "@/components/front/ProductCard";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { listProductCategories, listProducts } from "@/services/product.service";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();
  const lang: Locale = langParam;
  const dict = getDict(lang);
  const sp = await searchParams;
  const categorySlug = typeof sp.category === "string" ? sp.category : "";
  const page = Math.max(1, Number(sp.page ?? 1));

  const categories = listProductCategories();
  const { items, total, pageSize } = listProducts({
    page,
    pageSize: 12,
    categorySlug: categorySlug || undefined,
    status: "published",
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight text-(--t-text)">
        {dict.nav.products}
      </h1>

      {/* 分类筛选 */}
      {categories.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href={`/${lang}/products`}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              !categorySlug
                ? "bg-(--t-ink) text-(--t-on-ink) border-(--t-ink)"
                : "border-(--t-border2) text-(--t-muted) hover:border-(--t-muted2)"
            }`}
          >
            {dict.product.all}
          </Link>
          {categories.map((c) => {
            const name = lang === "en" ? c.nameEn || c.name : c.name;
            return (
              <Link
                key={c.id}
                href={`/${lang}/products?category=${encodeURIComponent(c.slug)}`}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                  categorySlug === c.slug
                    ? "bg-(--t-ink) text-(--t-on-ink) border-(--t-ink)"
                    : "border-(--t-border2) text-(--t-muted) hover:border-(--t-muted2)"
                }`}
              >
                {name}
              </Link>
            );
          })}
        </div>
      )}

      {/* 产品网格 */}
      <div className="mt-10">
        {items.length === 0 ? (
          <div className="text-center py-20 text-(--t-faint)">
            {dict.product.noProducts}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((p) => (
              <ProductCard key={p.id} product={p as ProductListItem} lang={lang} />
            ))}
          </div>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12">
          <Link
            href={`/${lang}/products?${new URLSearchParams({
              ...(categorySlug ? { category: categorySlug } : {}),
              page: String(page - 1),
            })}`}
            className={`text-sm ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
          >
            ← {lang === "en" ? "Prev" : "上一页"}
          </Link>
          <span className="text-sm text-(--t-muted2)">
            {page} / {totalPages}
          </span>
          <Link
            href={`/${lang}/products?${new URLSearchParams({
              ...(categorySlug ? { category: categorySlug } : {}),
              page: String(page + 1),
            })}`}
            className={`text-sm ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
          >
            {lang === "en" ? "Next" : "下一页"} →
          </Link>
        </div>
      )}
    </div>
  );
}
