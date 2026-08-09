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

export default function PostCard({ post }: { post: PostListItem }) {
  return (
    <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
          {post.categoryName && post.categorySlug ? (
            <Link
              href={`/category/${post.categorySlug}`}
              className="text-blue-600 hover:underline"
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
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600 leading-snug">
            {post.title}
          </h2>
        </Link>
        {post.excerpt && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
        )}
      </div>
    </article>
  );
}
