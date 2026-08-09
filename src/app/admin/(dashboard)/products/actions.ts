"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PERMISSIONS } from "@/lib/permissions";
import { productSchema } from "@/lib/validate";
import { requirePermission } from "@/services/auth.service";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/services/product.service";

export type ProductState = { error?: string } | null;

function parseProductInput(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    nameEn: formData.get("nameEn") || "",
    slug: formData.get("slug") || undefined,
    categoryId: formData.get("categoryId") || null,
    summary: formData.get("summary") || "",
    summaryEn: formData.get("summaryEn") || "",
    description: formData.get("description") || "",
    descriptionEn: formData.get("descriptionEn") || "",
    spec: formData.get("spec") || "",
    specEn: formData.get("specEn") || "",
    coverImage: formData.get("coverImage") || "",
    images: formData.get("images") || "[]",
    status: formData.get("status") || "draft",
    isFeatured: formData.get("isFeatured") || "0",
    seoTitle: formData.get("seoTitle") || "",
    seoKeywords: formData.get("seoKeywords") || "",
  });
}

export async function createProductAction(
  _prev: ProductState,
  formData: FormData,
): Promise<ProductState> {
  const user = await requirePermission(PERMISSIONS.PRODUCT_MANAGE);
  const parsed = parseProductInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "参数错误" };
  }
  let id: number;
  try {
    id = createProduct(user.id, parsed.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "创建失败" };
  }
  redirect(`/admin/products/${id}`);
}

export async function updateProductAction(
  _prev: ProductState,
  formData: FormData,
): Promise<ProductState> {
  const user = await requirePermission(PERMISSIONS.PRODUCT_MANAGE);
  const id = Number(formData.get("id"));
  if (!id) return { error: "缺少产品 ID" };
  const parsed = parseProductInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "参数错误" };
  }
  try {
    updateProduct(user.id, id, parsed.data);
    revalidatePath("/admin/products");
    revalidatePath("/zh");
    revalidatePath("/en");
  } catch (err) {
    return { error: err instanceof Error ? err.message : "保存失败" };
  }
  return null;
}

export async function deleteProductAction(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.PRODUCT_MANAGE);
  const id = Number(formData.get("id"));
  if (id) {
    deleteProduct(user.id, id);
    revalidatePath("/admin/products");
    revalidatePath("/");
  }
  redirect("/admin/products");
}
