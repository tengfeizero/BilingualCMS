import Image from "next/image";
import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";

export interface ProductListItem {
  id: number;
  name: string;
  nameEn: string | null;
  slug: string;
  summary: string | null;
  summaryEn: string | null;
  coverImage: string | null;
  viewCount: number;
}

export default function ProductCard({
  product,
  lang,
}: {
  product: ProductListItem;
  lang: Locale;
}) {
  const dict = getDict(lang);
  const name = lang === "en" ? product.nameEn || product.name : product.name;
  const summary =
    lang === "en" ? product.summaryEn || product.summary : product.summary;

  return (
    <Link
      href={`/${lang}/products/${product.slug}`}
      className="group block bg-(--t-surface) rounded-2xl overflow-hidden shadow-sm border border-(--t-border) hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="aspect-[4/3] bg-(--t-surface3) relative overflow-hidden">
        {product.coverImage ? (
          <Image
            src={product.coverImage}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-(--t-faint) text-sm">
            {name}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-medium text-(--t-text) leading-snug line-clamp-1">
          {name}
        </h3>
        {summary && (
          <p className="mt-1.5 text-sm text-(--t-muted2) line-clamp-2">{summary}</p>
        )}
      </div>
    </Link>
  );
}
