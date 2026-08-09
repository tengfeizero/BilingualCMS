"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PERMISSIONS } from "@/lib/permissions";
import { postSchema } from "@/lib/validate";
import { requirePermission } from "@/services/auth.service";
import {
  createPost,
  deletePost,
  restoreVersion,
  sanitizeContent,
  setPostStatus,
  updatePost,
} from "@/services/post.service";

export type ActionState = { error?: string } | null;

function parsePostInput(formData: FormData) {
  return postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    content: formData.get("content") || "",
    excerpt: formData.get("excerpt") || "",
    coverImage: formData.get("coverImage") || "",
    status: formData.get("status") || "draft",
    type: formData.get("type") || "post",
    categoryId: formData.get("categoryId") || null,
    isPinned: formData.get("isPinned") || "0",
    tags: formData.get("tags") || "",
  });
}

export async function createPostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requirePermission(PERMISSIONS.POST_CREATE);
  const parsed = parsePostInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "参数错误" };
  }
  const input = parsed.data;
  const postId = createPost(user.id, {
    ...input,
    content: sanitizeContent(input.content),
  });
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${postId}`);
}

export async function updatePostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requirePermission(PERMISSIONS.POST_UPDATE);
  const id = Number(formData.get("id"));
  if (!id) return { error: "缺少文章 ID" };
  const parsed = parsePostInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "参数错误" };
  }
  const input = parsed.data;
  updatePost(user.id, id, {
    ...input,
    content: sanitizeContent(input.content),
  });
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${input.slug || ""}`);
  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${id}`);
}

export async function deletePostAction(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.POST_DELETE);
  const id = Number(formData.get("id"));
  if (id) {
    deletePost(user.id, id);
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/admin/posts");
  }
  redirect("/admin/posts");
}

export async function setPostStatusAction(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.POST_PUBLISH);
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (id && status) {
    setPostStatus(user.id, id, status);
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/admin/posts");
  }
  redirect(`/admin/posts/${id}`);
}

export async function restoreVersionAction(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.POST_UPDATE);
  const versionId = Number(formData.get("versionId"));
  if (versionId) {
    const postId = restoreVersion(user.id, versionId);
    revalidatePath("/admin/posts");
    redirect(`/admin/posts/${postId}`);
  }
  redirect("/admin/posts");
}
