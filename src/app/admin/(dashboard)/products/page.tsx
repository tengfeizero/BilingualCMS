import ProductManager from "@/components/admin/ProductManager";
import { PERMISSIONS } from "@/lib/permissions";
import { requirePermission } from "@/services/auth.service";
import { listProductCategories, listProducts } from "@/services/product.service";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission(PERMISSIONS.PRODUCT_MANAGE);
  const sp = await searchParams;
  const keyword = typeof sp.q === "string" ? sp.q : "";
  const page = Math.max(1, Number(sp.page ?? 1));

  const { items, total, pageSize } = listProducts({
    page,
    pageSize: 20,
    keyword: keyword || undefined,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const categories = listProductCategories();

  return (
    <ProductManager
      items={items}
      total={total}
      page={page}
      totalPages={totalPages}
      keyword={keyword}
      categories={categories}
    />
  );
}
