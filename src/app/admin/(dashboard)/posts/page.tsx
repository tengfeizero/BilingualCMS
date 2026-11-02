import PostManager from "@/components/admin/PostManager";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { getCurrentUser } from "@/services/auth.service";
import { listCategories } from "@/services/category.service";
import { listPosts } from "@/services/post.service";

export const dynamic = "force-dynamic";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const keyword = typeof params.q === "string" ? params.q : "";
  const page = Math.max(1, Number(params.page ?? 1));
  const user = await getCurrentUser();

  const canPublish = !!user && hasPermission(user.role, PERMISSIONS.POST_PUBLISH);
  const canDelete = !!user && hasPermission(user.role, PERMISSIONS.POST_DELETE);

  const { items, total, pageSize } = listPosts({
    page,
    pageSize: 15,
    status: status || undefined,
    keyword: keyword || undefined,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const categories = listCategories();

  return (
    <PostManager
      items={items}
      total={total}
      page={page}
      totalPages={totalPages}
      status={status}
      keyword={keyword}
      categories={categories}
      canPublish={canPublish}
      canDelete={canDelete}
    />
  );
}
