import Pagination from "@/components/front/Pagination";
import PostCard, { type PostListItem } from "@/components/front/PostCard";
import { listPosts } from "@/services/post.service";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = 10;

  const { items, total } = listPosts({
    page,
    pageSize,
    publishedOnly: true,
  });

  const posts: PostListItem[] = items;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">最新文章</h1>
        <p className="text-sm text-gray-500 mt-1">
          共 {total} 篇文章，分享知识与见闻
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          暂无文章，去后台发布第一篇吧
        </div>
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
        buildHref={(p) => `/?page=${p}`}
      />
    </div>
  );
}
