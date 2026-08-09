import CategoryManager from "@/components/admin/CategoryManager";
import { PERMISSIONS } from "@/lib/permissions";
import { requirePermission } from "@/services/auth.service";
import { buildCategoryTree, listCategories } from "@/services/category.service";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requirePermission(PERMISSIONS.CATEGORY_MANAGE);
  const categories = listCategories();
  const tree = buildCategoryTree(categories);
  const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  return <CategoryManager tree={tree} parentOptions={parentOptions} />;
}
