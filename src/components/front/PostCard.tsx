import Link from "next/link";
import { formatDate } from "@/lib/utils";

export interface PostListItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  authorName?: string | null;
  publishedAt: string | null;
  viewCount: number;
}

export default function PostCard({
  post,
  lang,
}: {
  post: PostListItem;
  lang: string;
}) {
  return (
    <article className="bg-(--t-surface) rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs text-(--t-faint) mb-2">
          {post.categoryName && post.categorySlug ? (
            <Link
              href={`/${lang}/category/${post.categorySlug}`}
              className="text-(--t-accent) hover:underline"
            >
              {post.categoryName}
            </Link>
          ) : (
            <span>未分类</span>
          )}
          <span>{formatDate(post.publishedAt)}</span>
          <span>·</span>
          <span>{post.viewCount} 次浏览</span>
        </div>
        <Link href={`/${lang}/blog/${post.slug}`}>
          <h2 className="text-lg font-semibold text-(--t-text) hover:text-(--t-accent) leading-snug">
            {post.title}
          </h2>
        </Link>
        {post.excerpt && (
          <p className="mt-2 text-sm text-(--t-muted2) line-clamp-2">{post.excerpt}</p>
        )}
      </div>
    </article>
  );
}
