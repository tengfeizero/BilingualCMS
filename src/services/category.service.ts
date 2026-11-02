import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { slugify } from "@/lib/utils";
import { logAudit } from "./audit.service";
import type { CategoryInput } from "@/lib/validate";

function uniqueSlug(base: string, excludeId?: number): string {
  let candidate = base;
  let counter = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, candidate))
      .get();
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

/** 全部分类（树形展示用，按 sort_order 排序） */
export function listCategories() {
  return db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.id))
    .all();
}

/** 构建分类树 */
export function buildCategoryTree<
  T extends { id: number; parentId: number | null },
>(list: T[]) {
  type Node = T & { children: Node[] };
  const map = new Map<number, Node>();
  for (const item of list) {
    map.set(item.id, { ...item, children: [] });
  }
  const roots: Node[] = [];
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export function getCategoryBySlug(slug: string) {
  return db.select().from(categories).where(eq(categories.slug, slug)).get() ?? null;
}

export function getCategoryById(id: number) {
  return db.select().from(categories).where(eq(categories.id, id)).get() ?? null;
}

export function createCategory(userId: number, input: CategoryInput) {
  const finalSlug = uniqueSlug(slugify(input.slug || input.name));
  const result = db
    .insert(categories)
    .values({
      name: input.name,
      nameEn: input.nameEn || null,
      slug: finalSlug,
      parentId: input.parentId ?? null,
      description: input.description || null,
      descriptionEn: input.descriptionEn || null,
      sortOrder: input.sortOrder ?? 0,
    })
    .run();
  const id = Number(result.lastInsertRowid);
  logAudit({
    userId,
    action: "category.create",
    targetType: "category",
    targetId: id,
    detail: input.name,
  });
  return id;
}

export function updateCategory(userId: number, id: number, input: CategoryInput) {
  const existing = getCategoryById(id);
  if (!existing) throw new Error("分类不存在");
  const finalSlug = input.slug
    ? uniqueSlug(slugify(input.slug), id)
    : existing.slug;
  db.update(categories)
    .set({
      name: input.name,
      nameEn: input.nameEn !== undefined ? input.nameEn || null : existing.nameEn,
      slug: finalSlug,
      parentId: input.parentId ?? existing.parentId,
      description: input.description ?? existing.description,
      descriptionEn:
        input.descriptionEn !== undefined
          ? input.descriptionEn || null
          : existing.descriptionEn,
      sortOrder: input.sortOrder ?? existing.sortOrder,
    })
    .where(eq(categories.id, id))
    .run();
  logAudit({
    userId,
    action: "category.update",
    targetType: "category",
    targetId: id,
    detail: input.name,
  });
}

export function deleteCategory(userId: number, id: number) {
  const existing = getCategoryById(id);
  if (!existing) return;
  db.delete(categories).where(eq(categories.id, id)).run();
  logAudit({
    userId,
    action: "category.delete",
    targetType: "category",
    targetId: id,
    detail: existing.name,
  });
}
