"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PERMISSIONS } from "@/lib/permissions";
import { categorySchema } from "@/lib/validate";
import { requirePermission } from "@/services/auth.service";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/services/category.service";

export type CategoryState = { error?: string } | null;

function parseCategoryInput(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    parentId: formData.get("parentId") || null,
    description: formData.get("description") || "",
    sortOrder: formData.get("sortOrder") || "0",
  });
}

export async function createCategoryAction(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  const user = await requirePermission(PERMISSIONS.CATEGORY_MANAGE);
  const parsed = parseCategoryInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "参数错误" };
  }
  createCategory(user.id, parsed.data);
  revalidatePath("/admin/categories");
  return null;
}

export async function updateCategoryAction(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  const user = await requirePermission(PERMISSIONS.CATEGORY_MANAGE);
  const id = Number(formData.get("id"));
  if (!id) return { error: "缺少分类 ID" };
  const parsed = parseCategoryInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "参数错误" };
  }
  updateCategory(user.id, id, parsed.data);
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return null;
}

export async function deleteCategoryAction(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.CATEGORY_MANAGE);
  const id = Number(formData.get("id"));
  if (id) {
    deleteCategory(user.id, id);
    revalidatePath("/admin/categories");
    revalidatePath("/");
  }
  redirect("/admin/categories");
}
