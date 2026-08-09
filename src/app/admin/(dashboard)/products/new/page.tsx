import ProductForm from "@/components/admin/ProductForm";
import { PageHeader, BackLink } from "@/components/admin/ui";
import { PERMISSIONS } from "@/lib/permissions";
import { requirePermission } from "@/services/auth.service";
import { listProductCategories } from "@/services/product.service";
import { createProductAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requirePermission(PERMISSIONS.PRODUCT_MANAGE);
  const categories = listProductCategories();

  return (
    <div>
      <BackLink href="/admin/products" label="返回产品列表" />
      <PageHeader title="新建产品" description="填写产品信息，可随时保存为草稿" />
      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm action={createProductAction} categories={categories} />
      </div>
    </div>
  );
}
