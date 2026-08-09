import type { MetadataRoute } from "next";
import { listCategories } from "@/services/category.service";
import { listPosts } from "@/services/post.service";
import { listProductCategories, listProducts } from "@/services/product.service";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const LANGS = ["", "en"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // 首页（中英）
  for (const lang of LANGS) {
    entries.push({
      url: `${BASE}/${lang}`.replace(/\/$/, ""),
      lastModified: new Date(),
    });
  }

  // 产品列表与详情（中英）
  const products = listProducts({ status: "published", pageSize: 500 }).items;
  const productCategories = listProductCategories();
  for (const lang of LANGS) {
    const prefix = lang ? `/${lang}` : "";
    entries.push({ url: `${BASE}${prefix}/products` });
    for (const product of products) {
      entries.push({
        url: `${BASE}${prefix}/products/${product.slug}`,
        lastModified: new Date(`${product.updatedAt}Z`),
      });
    }
    for (const category of productCategories) {
      entries.push({
        url: `${BASE}${prefix}/products?category=${encodeURIComponent(category.slug)}`,
      });
    }
  }

  // 文章（中文）
  const posts = listPosts({ publishedOnly: true, pageSize: 500 }).items;
  for (const post of posts) {
    entries.push({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: new Date(`${post.updatedAt}Z`),
    });
  }

  const categories = listCategories();
  for (const category of categories) {
    entries.push({ url: `${BASE}/category/${category.slug}` });
  }

  return entries;
}
