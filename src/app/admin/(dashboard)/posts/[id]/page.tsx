import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmForm from "@/components/admin/ConfirmForm";
import PostForm from "@/components/admin/PostForm";
import {
  btnDangerCls,
  PageHeader,
  BackLink,
} from "@/components/admin/ui";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import { requireLogin } from "@/services/auth.service";
import { listCategories } from "@/services/category.service";
import {
  getPostById,
  getPostTags,
  getPostVersions,
} from "@/services/post.service";
import {
  deletePostAction,
  restoreVersionAction,
  setPostStatusAction,
  updatePostAction,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);
  const post = getPostById(postId);
  if (!post) notFound();

  const user = await requireLogin();
  const canUpdate = hasPermission(user.role, PERMISSIONS.POST_UPDATE);
  const canPublish = hasPermission(user.role, PERMISSIONS.POST_PUBLISH);
  const canDelete = hasPermission(user.role, PERMISSIONS.POST_DELETE);

  if (!canUpdate) {
    return (
      <div className="text-center py-20 text-gray-500">
        当前账号没有编辑文章的权限
      </div>
    );
  }

  const categories = listCategories();
  const tags = getPostTags(postId);
  const versions = getPostVersions(postId);
  const tagNames = tags.map((t) => t.name).join(", ");

  return (
    <div>
      <PageHeader
        title="编辑文章"
        description={<BackLink href="/admin/posts" />}
        action={
          <div className="flex gap-2">
            {canPublish &&
              (post.status === "published" ? (
                <form action={setPostStatusAction}>
                  <input type="hidden" name="id" value={post.id} />
                  <input type="hidden" name="status" value="archived" />
                  <button className="border border-gray-300 hover:bg-gray-50 rounded px-4 py-2 text-sm">
                    下线
                  </button>
                </form>
              ) : (
                <form action={setPostStatusAction}>
                  <input type="hidden" name="id" value={post.id} />
                  <input type="hidden" name="status" value="published" />
                  <button className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2 text-sm font-medium">
                    发布
                  </button>
                </form>
              ))}
            {canDelete && (
              <ConfirmForm
                action={deletePostAction}
                confirmMessage="确定删除这篇文章吗？"
                hidden={[{ name: "id", value: post.id }]}
              >
                <button className={btnDangerCls}>删除</button>
              </ConfirmForm>
            )}
          </div>
        }
      />

      <PostForm
        action={updatePostAction}
        categories={categories}
        initial={{
          id: post.id,
          title: post.title,
          titleEn: post.titleEn,
          slug: post.slug,
          content: post.content,
          contentEn: post.contentEn,
          excerpt: post.excerpt,
          excerptEn: post.excerptEn,
          coverImage: post.coverImage,
          status: post.status,
          type: post.type,
          categoryId: post.categoryId,
          isPinned: post.isPinned,
          tags: tagNames,
        }}
      />

      <div className="mt-8">
        <h2 className="font-medium mb-3">版本历史（{versions.length}）</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {versions.length === 0 ? (
            <div className="p-6 text-sm text-gray-400">暂无历史版本</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="px-4 py-2.5">版本</th>
                  <th className="px-4 py-2.5">标题</th>
                  <th className="px-4 py-2.5 w-40">保存时间</th>
                  <th className="px-4 py-2.5 w-24">操作</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v, i) => (
                  <tr key={v.id} className="border-b last:border-0">
                    <td className="px-4 py-2.5 text-gray-500">
                      {versions.length - i}
                    </td>
                    <td className="px-4 py-2.5">{v.title}</td>
                    <td className="px-4 py-2.5 text-gray-500">
                      {formatDate(v.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <ConfirmForm
                        action={restoreVersionAction}
                        confirmMessage="恢复该版本将覆盖当前内容，确定吗？"
                        hidden={[{ name: "versionId", value: v.id }]}
                      >
                        <button className="text-blue-600 hover:underline text-xs">
                          恢复
                        </button>
                      </ConfirmForm>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Link href="/admin/posts" className="text-sm text-gray-500 hover:text-gray-800">
          ← 返回文章列表
        </Link>
      </div>
    </div>
  );
}
