import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Pagination from "@/components/front/Pagination";
import PostCard, { type PostListItem } from "@/components/front/PostCard";
import { getCategoryBySlug } from "@/services/category.service";
import { listPosts } from "@/services/post.service";
import { decodeSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(decodeSlug(slug));
  if (!category) return { title: "分类不存在" };
  return { title: `${category.name} - 分类` };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const search = await searchParams;
  const page = Math.max(1, Number(search.page ?? 1));
  const pageSize = 10;

  const categorySlug = decodeSlug(slug);
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const { items, total } = listPosts({
    page,
    pageSize,
    categorySlug,
    publishedOnly: true,
  });

  const posts: PostListItem[] = items;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="text-sm text-gray-500 mt-1">{category.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">共 {total} 篇文章</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">该分类下暂无文章</div>
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
        buildHref={(p) => `/category/${category.slug}?page=${p}`}
      />

      <div className="mt-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
