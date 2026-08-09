import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { PageHeader, BackLink } from "@/components/admin/ui";
import { PERMISSIONS } from "@/lib/permissions";
import { requirePermission } from "@/services/auth.service";
import { getProductById, listProductCategories } from "@/services/product.service";
import { updateProductAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.PRODUCT_MANAGE);
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!id) notFound();

  const product = getProductById(id);
  if (!product) notFound();
  const categories = listProductCategories();

  return (
    <div>
      <BackLink href="/admin/products" label="返回产品列表" />
      <PageHeader title={`编辑产品：${product.name}`} />
      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm action={updateProductAction} initial={product} categories={categories} />
      </div>
    </div>
  );
}
