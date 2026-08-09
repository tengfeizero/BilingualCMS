import Link from "next/link";
import ProductCard, { type ProductListItem } from "@/components/front/ProductCard";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { listProducts } from "@/services/product.service";
import { getSettings } from "@/services/setting.service";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();
  const lang: Locale = langParam;
  const dict = getDict(lang);
  const settings = getSettings();

  const { items: products } = listProducts({
    pageSize: 8,
    featuredOnly: true,
  });

  const heroTitle = lang === "en"
    ? settings.site_description_en || "Quality products from our factory"
    : settings.site_description || "工厂直供，品质保障";

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20factory%20workshop%20with%20advanced%20machinery%20clean%20professional%20lighting&image_size=landscape_16_9)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-32 md:py-44 text-center">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
            {heroTitle}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            {lang === "en"
              ? "Professional factory offering high-quality products and OEM/ODM services for global customers."
              : "专业工厂，为全球客户提供高品质产品与 OEM/ODM 定制服务。"}
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href={`/${lang}/products`}
              className="bg-white text-gray-900 hover:bg-gray-200 rounded-full px-8 py-3 text-base font-medium transition-colors"
            >
              {dict.home.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* 产品展示 */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-(--t-text)">
              {dict.home.products}
            </h2>
            <p className="mt-2 text-(--t-muted2)">
              {lang === "en"
                ? "Explore our featured products"
                : "探索我们的精选产品"}
            </p>
          </div>
          <Link
            href={`/${lang}/products`}
            className="text-sm text-(--t-muted) hover:text-(--t-text)"
          >
            {dict.home.productsMore} →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 text-(--t-faint)">
            {lang === "en" ? "Products coming soon" : "产品即将上线"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p as ProductListItem} lang={lang} />
            ))}
          </div>
        )}
      </section>

      {/* 工厂优势 */}
      <section className="bg-(--t-surface2) border-y border-(--t-border)">
        <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            lang === "en"
              ? { title: "Factory Direct", desc: "Direct from our own factory, competitive pricing" }
              : { title: "工厂直供", desc: "自有工厂直供，价格更具竞争力" },
            lang === "en"
              ? { title: "Quality Assured", desc: "Strict QC process and certifications" }
              : { title: "品质保证", desc: "严格质检流程，品质有保障" },
            lang === "en"
              ? { title: "Global Shipping", desc: "Experience exporting to worldwide markets" }
              : { title: "全球发货", desc: "丰富的海外出口经验，发货全球" },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="text-lg font-medium text-(--t-text)">{item.title}</h3>
              <p className="mt-2 text-(--t-muted2) leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
