import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryById } from "@/services/category.service";
import {
  getPostTags,
  getPublishedPostBySlug,
} from "@/services/post.service";
import { formatDate, decodeSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPublishedPostBySlug(decodeSlug(slug));
  if (!post) return { title: "文章不存在" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPublishedPostBySlug(decodeSlug(slug));
  if (!post) notFound();

  const tags = getPostTags(post.id);
  const category = post.categoryId ? getCategoryById(post.categoryId) : null;
  const viewCount = post.viewCount + 1; // getPublishedPostBySlug 已累加

  return (
    <article>
      <div className="mb-6">
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          {category && (
            <Link
              href={`/category/${category.slug}`}
              className="text-blue-600 hover:underline"
            >
              {category.name}
            </Link>
          )}
          <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          <span>·</span>
          <span>{viewCount} 次浏览</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          {post.title}
        </h1>
      </div>

      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full max-h-96 object-cover rounded-lg mb-6"
        />
      )}

      <div
        className="prose-cms text-gray-800"
        // 内容入库前已通过 sanitize-html 消毒
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full px-3 py-1"
            >
              # {tag.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          ← 返回首页
        </Link>
      </div>
    </article>
  );
}
