import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Pagination from "@/components/front/Pagination";
import PostCard, { type PostListItem } from "@/components/front/PostCard";
import { listPostsByTag } from "@/services/post.service";
import { decodeSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = listPostsByTag(decodeSlug(slug), 1, 1);
  if (!result.tag) return { title: "标签不存在" };
  return { title: `${result.tag.name} - 标签` };
}

export default async function TagPage({
  params,
  searchParams,
}: TagPageProps) {
  const { slug } = await params;
  const search = await searchParams;
  const page = Math.max(1, Number(search.page ?? 1));
  const pageSize = 10;

  const { items, total, tag } = listPostsByTag(decodeSlug(slug), page, pageSize);
  if (!tag) notFound();

  const posts: PostListItem[] = items;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900"># {tag.name}</h1>
        <p className="text-xs text-gray-400 mt-1">共 {total} 篇文章</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">该标签下暂无文章</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(p) => `/tag/${tag.slug}?page=${p}`}
      />

      <div className="mt-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
