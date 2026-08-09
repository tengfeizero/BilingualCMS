import PostForm from "@/components/admin/PostForm";
import { PageHeader, BackLink } from "@/components/admin/ui";
import { PERMISSIONS } from "@/lib/permissions";
import { listCategories } from "@/services/category.service";
import { requirePermission } from "@/services/auth.service";
import { createPostAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  await requirePermission(PERMISSIONS.POST_CREATE);
  const categories = listCategories();

  return (
    <div>
      <PageHeader
        title="新建文章"
        description={<BackLink href="/admin/posts" />}
      />
      <PostForm action={createPostAction} categories={categories} />
    </div>
  );
}
