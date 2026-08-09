import ProductCategoryManager from "@/components/admin/ProductCategoryManager";
import { PERMISSIONS } from "@/lib/permissions";
import { requirePermission } from "@/services/auth.service";
import { listProductCategories } from "@/services/product.service";

export const dynamic = "force-dynamic";

export default async function ProductCategoriesPage() {
  await requirePermission(PERMISSIONS.PRODUCT_MANAGE);
  const categories = listProductCategories();
  return <ProductCategoryManager categories={categories} />;
}
