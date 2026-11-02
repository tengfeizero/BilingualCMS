"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PERMISSIONS } from "@/lib/permissions";
import { productCategorySchema } from "@/lib/validate";
import { requirePermission } from "@/services/auth.service";
import {
  createProductCategory,
  deleteProductCategory,
  updateProductCategory,
} from "@/services/product.service";

export type ProductCategoryState = { error?: string; ok?: boolean } | null;

function parseInput(formData: FormData) {
  return productCategorySchema.safeParse({
    name: formData.get("name"),
    nameEn: formData.get("nameEn") || "",
    slug: formData.get("slug") || undefined,
    parentId: formData.get("parentId") || null,
    description: formData.get("description") || "",
    descriptionEn: formData.get("descriptionEn") || "",
    sortOrder: formData.get("sortOrder") || "0",
  });
}

export async function createProductCategoryAction(
  _prev: ProductCategoryState,
  formData: FormData,
): Promise<ProductCategoryState> {
  await requirePermission(PERMISSIONS.PRODUCT_MANAGE);
  const parsed = parseInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "参数错误" };
  }
  createProductCategory(parsed.data);
  revalidatePath("/admin/product-categories");
  return { ok: true };
}

export async function updateProductCategoryAction(
  _prev: ProductCategoryState,
  formData: FormData,
): Promise<ProductCategoryState> {
  await requirePermission(PERMISSIONS.PRODUCT_MANAGE);
  const id = Number(formData.get("id"));
  if (!id) return { error: "缺少分类 ID" };
  const parsed = parseInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "参数错误" };
  }
  updateProductCategory(id, parsed.data);
  revalidatePath("/admin/product-categories");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteProductCategoryAction(formData: FormData) {
  await requirePermission(PERMISSIONS.PRODUCT_MANAGE);
  const id = Number(formData.get("id"));
  if (id) {
    deleteProductCategory(id);
    revalidatePath("/admin/product-categories");
    revalidatePath("/");
  }
  redirect("/admin/product-categories");
}
