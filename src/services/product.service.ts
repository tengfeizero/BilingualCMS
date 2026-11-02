import { and, count, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/db";
import { productCategories, products } from "@/db/schema";
import { paginate, slugify } from "@/lib/utils";
import { logAudit } from "./audit.service";

/** 产品分类 */
export function listProductCategories() {
  return db
    .select()
    .from(productCategories)
    .orderBy(desc(productCategories.sortOrder), desc(productCategories.id))
    .all();
}

export function getProductCategoryBySlug(slug: string) {
  return db
    .select()
    .from(productCategories)
    .where(eq(productCategories.slug, slug))
    .get() ?? null;
}

export function getProductCategoryById(id: number) {
  return db
    .select()
    .from(productCategories)
    .where(eq(productCategories.id, id))
    .get() ?? null;
}

export interface ProductCategoryInput {
  name: string;
  nameEn?: string | null;
  slug?: string;
  parentId?: number | null;
  description?: string | null;
  descriptionEn?: string | null;
  sortOrder?: number;
}

export function createProductCategory(input: ProductCategoryInput): number {
  const slug = slugify(input.slug || input.name);
  const r = db
    .insert(productCategories)
    .values({
      name: input.name,
      nameEn: input.nameEn || null,
      slug,
      parentId: input.parentId ?? null,
      description: input.description || null,
      descriptionEn: input.descriptionEn || null,
      sortOrder: input.sortOrder ?? 0,
    })
    .run();
  return Number(r.lastInsertRowid);
}

export function updateProductCategory(id: number, input: ProductCategoryInput) {
  db.update(productCategories)
    .set({
      name: input.name,
      nameEn: input.nameEn || null,
      slug: slugify(input.slug || input.name),
      parentId: input.parentId ?? null,
      description: input.description || null,
      descriptionEn: input.descriptionEn || null,
      sortOrder: input.sortOrder ?? 0,
    })
    .where(eq(productCategories.id, id))
    .run();
}

export function deleteProductCategory(id: number) {
  db.delete(productCategories).where(eq(productCategories.id, id)).run();
}

/** 产品 */
export interface ProductInput {
  name: string;
  nameEn?: string | null;
  slug?: string;
  categoryId?: number | null;
  summary?: string | null;
  summaryEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  spec?: string | null; // JSON 字符串 [{label,value}]（中文）
  specEn?: string | null; // JSON 字符串 [{label,value}]（英文）
  coverImage?: string | null;
  images?: string; // JSON 字符串数组
  status?: string;
  isFeatured?: number;
  seoTitle?: string | null;
  seoKeywords?: string | null;
}

export interface ListProductsParams {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  categoryId?: number;
  status?: string;
  keyword?: string;
  featuredOnly?: boolean;
}

function uniqueProductSlug(base: string, excludeId?: number): string {
  let candidate = base;
  let counter = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, candidate))
      .get();
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

export function listProducts(params: ListProductsParams = {}) {
  const { page = 1, pageSize = 12 } = params;
  const { offset, limit } = paginate(page, pageSize);
  const conditions = [];
  if (params.categorySlug) {
    const cat = getProductCategoryBySlug(params.categorySlug);
    if (cat) conditions.push(eq(products.categoryId, cat.id));
  }
  if (params.categoryId) conditions.push(eq(products.categoryId, params.categoryId));
  if (params.status) conditions.push(eq(products.status, params.status));
  if (params.featuredOnly) {
    conditions.push(
      and(eq(products.isFeatured, 1), eq(products.status, "published")),
    );
  }
  if (params.keyword) {
    conditions.push(
      or(
        like(products.name, `%${params.keyword}%`),
        like(products.nameEn, `%${params.keyword}%`),
      ),
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const items = db
    .select({
      id: products.id,
      name: products.name,
      nameEn: products.nameEn,
      slug: products.slug,
      categoryId: products.categoryId,
      categoryName: productCategories.name,
      categoryNameEn: productCategories.nameEn,
      summary: products.summary,
      summaryEn: products.summaryEn,
      coverImage: products.coverImage,
      status: products.status,
      isFeatured: products.isFeatured,
      viewCount: products.viewCount,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
    .where(where)
    .orderBy(desc(products.isFeatured), desc(products.id))
    .limit(limit)
    .offset(offset)
    .all();

  const total =
    db
      .select({ value: count() })
      .from(products)
      .leftJoin(productCategories, eq(products.categoryId, productCategories.id))
      .where(where)
      .get()?.value ?? 0;

  return { items, total, page, pageSize };
}

/** 前台产品详情（已发布）并累加浏览量 */
export function getPublishedProductBySlug(slug: string) {
  const product = db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.status, "published")))
    .get();
  if (!product) return null;
  db.update(products)
    .set({ viewCount: product.viewCount + 1 })
    .where(eq(products.id, product.id))
    .run();
  return product;
}

export function getProductById(id: number) {
  return db.select().from(products).where(eq(products.id, id)).get() ?? null;
}

export function createProduct(userId: number, input: ProductInput): number {
  const slug = uniqueProductSlug(slugify(input.slug || input.nameEn || input.name));
  const r = db
    .insert(products)
    .values({
      name: input.name,
      nameEn: input.nameEn || null,
      slug,
      categoryId: input.categoryId ?? null,
      summary: input.summary || null,
      summaryEn: input.summaryEn || null,
      description: input.description || null,
      descriptionEn: input.descriptionEn || null,
      spec: input.spec || null,
      coverImage: input.coverImage || null,
      images: input.images || "[]",
      status: input.status ?? "draft",
      isFeatured: input.isFeatured ?? 0,
      seoTitle: input.seoTitle || null,
      seoKeywords: input.seoKeywords || null,
    })
    .run();
  const id = Number(r.lastInsertRowid);
  logAudit({
    userId,
    action: "product.create",
    targetType: "product",
    targetId: id,
    detail: input.name,
  });
  return id;
}

export function updateProduct(userId: number, id: number, input: ProductInput) {
  const existing = getProductById(id);
  if (!existing) throw new Error("产品不存在");
  const slug = uniqueProductSlug(slugify(input.slug || input.name), id);
  db.update(products)
    .set({
      name: input.name,
      nameEn: input.nameEn || null,
      slug,
      categoryId: input.categoryId ?? null,
      summary: input.summary ?? existing.summary,
      summaryEn: input.summaryEn ?? existing.summaryEn,
      description: input.description ?? existing.description,
      descriptionEn: input.descriptionEn ?? existing.descriptionEn,
      spec: input.spec ?? existing.spec,
      specEn: input.specEn ?? existing.specEn,
      coverImage: input.coverImage ?? existing.coverImage,
      images: input.images ?? existing.images,
      status: input.status ?? existing.status,
      isFeatured: input.isFeatured ?? existing.isFeatured,
      seoTitle: input.seoTitle ?? existing.seoTitle,
      seoKeywords: input.seoKeywords ?? existing.seoKeywords,
      updatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    })
    .where(eq(products.id, id))
    .run();
  logAudit({
    userId,
    action: "product.update",
    targetType: "product",
    targetId: id,
    detail: input.name,
  });
}

export function deleteProduct(userId: number, id: number) {
  const existing = getProductById(id);
  if (!existing) return;
  db.delete(products).where(eq(products.id, id)).run();
  logAudit({
    userId,
    action: "product.delete",
    targetType: "product",
    targetId: id,
    detail: existing.name,
  });
}
