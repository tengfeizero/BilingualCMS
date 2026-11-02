import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryById } from "@/services/category.service";
import {
  getPostTags,
  getPublishedPostBySlug,
} from "@/services/post.service";
import { formatDate, decodeSlug } from "@/lib/utils";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

interface PostPageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = getPublishedPostBySlug(decodeSlug(slug));
  if (!post) return { title: "文章不存在" };
  const title = (lang === "en" && post.titleEn) || post.title;
  const description =
    (lang === "en" && post.excerptEn) || post.excerpt || undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const post = getPublishedPostBySlug(decodeSlug(slug));
  if (!post) notFound();

  const isEn = lang === "en";
  const title = (isEn && post.titleEn) || post.title;
  const content = (isEn && post.contentEn) || post.content;
  const tags = getPostTags(post.id);
  const category = post.categoryId ? getCategoryById(post.categoryId) : null;
  const categoryName = category
    ? (isEn && category.nameEn) || category.name
    : null;
  const viewCount = post.viewCount + 1; // getPublishedPostBySlug 已累加

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-6">
        <div className="flex items-center gap-3 text-xs text-(--t-faint) mb-3">
          {category && (
            <Link
              href={`/${lang}/category/${category.slug}`}
              className="text-(--t-accent) hover:underline"
            >
              {categoryName}
            </Link>
          )}
          <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          <span>·</span>
          <span>
            {viewCount} {isEn ? "views" : "次浏览"}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-(--t-text) leading-tight">
          {title}
        </h1>
      </div>

      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt={title}
          className="w-full max-h-96 object-cover rounded-lg mb-6"
        />
      )}

      <div
        className="prose-cms text-(--t-text)"
        // 内容入库前已通过 sanitize-html 消毒
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/${lang}/tag/${tag.slug}`}
              className="text-xs bg-(--t-surface3) hover:bg-(--t-border3) text-(--t-muted) rounded-full px-3 py-1"
            >
              # {tag.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link
          href={`/${lang}`}
          className="text-sm text-(--t-muted2) hover:text-(--t-text)"
        >
          ← {lang === "en" ? "Back to Home" : "返回首页"}
        </Link>
      </div>
    </article>
  );
}
