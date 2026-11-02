import { sqlite } from "@/db";
import { paginate } from "@/lib/utils";

interface SearchResultItem {
  id: number;
  title: string;
  title_en: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_en: string | null;
  cover_image: string | null;
  published_at: string | null;
  view_count: number;
  category_name: string | null;
  category_name_en: string | null;
  category_slug: string | null;
  author_name: string | null;
}

/** FTS5 全文搜索（trigram 分词器，支持中文） */
export function searchPosts(
  keyword: string,
  page = 1,
  pageSize = 10,
): { items: SearchResultItem[]; total: number; page: number; pageSize: number } {
  const { offset, limit } = paginate(page, pageSize);
  // 去除 FTS 特殊字符，避免语法错误
  const query = keyword
    .trim()
    .replace(/["'~*^()<>{}[\]\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!query) return { items: [], total: 0, page, pageSize };

  const total = sqlite
    .prepare(
      `SELECT COUNT(*) AS c FROM posts_fts f
       JOIN posts p ON p.id = f.rowid
       WHERE posts_fts MATCH ? AND p.status = 'published'`,
    )
    .get(query) as { c: number };

  const items = sqlite
    .prepare(
      `SELECT p.id, p.title, p.title_en, p.slug, p.excerpt, p.excerpt_en,
              p.cover_image, p.published_at, p.view_count,
              c.name AS category_name, c.name_en AS category_name_en,
              c.slug AS category_slug, u.username AS author_name
       FROM posts_fts f
       JOIN posts p ON p.id = f.rowid
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.author_id = u.id
       WHERE posts_fts MATCH ? AND p.status = 'published'
       ORDER BY bm25(posts_fts)
       LIMIT ? OFFSET ?`,
    )
    .all(query, limit, offset) as SearchResultItem[];

  return { items, total: total.c, page, pageSize };
}
