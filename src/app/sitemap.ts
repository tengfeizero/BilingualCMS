import type { MetadataRoute } from "next";
import { listCategories } from "@/services/category.service";
import { listPosts } from "@/services/post.service";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date() },
  ];

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
