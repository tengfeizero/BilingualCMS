/**
 * Husqvarna 模拟数据导入脚本
 * 运行：npx tsx mock/import-husqvarna.ts
 * 幂等：已存在的分类/产品（按 slug 判断）会被跳过。
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

interface SpecRow {
  label: string;
  value: string;
}
interface ProductData {
  name: string;
  nameEn: string;
  slug: string;
  summary: string;
  summaryEn: string;
  description: string;
  descriptionEn: string;
  spec: SpecRow[];
  specEn: SpecRow[];
  coverImage: string;
  images: string[];
  status: string;
  isFeatured: number;
}
interface CategoryData {
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  sortOrder: number;
  products: ProductData[];
}

const dbPath = path.resolve(process.cwd(), "data/cms.db");
if (!fs.existsSync(dbPath)) {
  console.error("未找到数据库文件：" + dbPath);
  process.exit(1);
}

const data: { source: string; categories: CategoryData[] } = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "mock/husqvarna-products.json"), "utf-8"),
);

const db = new Database(dbPath);

const existsCat = db.prepare("SELECT id FROM product_categories WHERE slug = ?");
const insertCat = db.prepare(
  "INSERT INTO product_categories (name, name_en, slug, description, sort_order) VALUES (?, ?, ?, ?, ?)",
);
const existsProd = db.prepare("SELECT id FROM products WHERE slug = ?");
const insertProd = db.prepare(
  `INSERT INTO products
    (name, name_en, slug, category_id, summary, summary_en, description, description_en,
     spec, spec_en, cover_image, images, status, is_featured, view_count)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
);

let newCats = 0;
let newProds = 0;
let skippedCats = 0;
let skippedProds = 0;

const tx = db.transaction(() => {
  for (const cat of data.categories) {
    const existing = existsCat.get(cat.slug) as { id: number } | undefined;
    let catId: number;
    if (existing) {
      skippedCats++;
      catId = existing.id;
    } else {
      const r = insertCat.run(cat.name, cat.nameEn, cat.slug, cat.description, cat.sortOrder);
      catId = Number(r.lastInsertRowid);
      newCats++;
    }

    for (const p of cat.products) {
      if (existsProd.get(p.slug)) {
        skippedProds++;
        continue;
      }
      insertProd.run(
        p.name,
        p.nameEn,
        p.slug,
        catId,
        p.summary,
        p.summaryEn,
        p.description,
        p.descriptionEn,
        JSON.stringify(p.spec),
        JSON.stringify(p.specEn),
        p.coverImage || null,
        JSON.stringify(p.images || []),
        p.status || "published",
        p.isFeatured ? 1 : 0,
      );
      newProds++;
    }
  }
});
tx();

db.close();
console.log(`导入完成：新增分类 ${newCats} 个（跳过 ${skippedCats}），新增产品 ${newProds} 个（跳过 ${skippedProds}）。`);
console.log(`数据来源：${data.source}`);
