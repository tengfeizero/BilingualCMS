import { and, count, desc, eq, like, or } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import { db } from "@/db";
import { categories, posts, postTags, postVersions, tags, users } from "@/db/schema";
import { paginate, slugify } from "@/lib/utils";
import { logAudit } from "./audit.service";

/** SQLite 时间统一存 UTC，与 datetime('now') 保持一致 */
export function nowUtc(): string {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

/** 富文本消毒，防止存储型 XSS */
export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "strike", "ul", "ol",
      "li", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre",
      "a", "img", "table", "thead", "tbody", "tfoot", "tr", "th", "td",
      "hr", "span", "div", "figure", "figcaption", "mark", "sub", "sup",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      span: ["style"],
      th: ["style", "colspan", "rowspan"],
      td: ["style", "colspan", "rowspan"],
      table: ["style", "width"],
      h1: ["id"],
      h2: ["id"],
      h3: ["id"],
      pre: ["class"],
      code: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}

export interface PostInput {
  title: string;
  titleEn?: string;
  slug?: string;
  content?: string;
  contentEn?: string;
  excerpt?: string | null;
  excerptEn?: string | null;
  coverImage?: string | null;
  status?: string;
  type?: string;
  categoryId?: number | null;
  isPinned?: number;
  tags?: string;
}

export interface ListPostsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  type?: string;
  categoryId?: number;
  categorySlug?: string;
  tagSlug?: string;
  keyword?: string;
  publishedOnly?: boolean;
}

function uniqueSlug(base: string, excludeId?: number): string {
  let candidate = base;
  let counter = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.slug, candidate))
      .get();
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

function parseTagNames(tagsStr?: string): string[] {
  if (!tagsStr) return [];
  return [...new Set(tagsStr.split(",").map((t) => t.trim()).filter(Boolean))];
}

function syncTags(
  tx: Pick<typeof db, "insert" | "delete" | "select" | "update">,
  postId: number,
  tagsStr?: string,
) {
  tx.delete(postTags).where(eq(postTags.postId, postId)).run();
  for (const name of parseTagNames(tagsStr)) {
    const tag = tx.select().from(tags).where(eq(tags.name, name)).get();
    let tagId: number;
    if (!tag) {
      const slug = slugify(name);
      let candidate = slug;
      let counter = 2;
      while (tx.select({ id: tags.id }).from(tags).where(eq(tags.slug, candidate)).get()) {
        candidate = `${slug}-${counter++}`;
      }
      const r = tx
        .insert(tags)
        .values({ name, slug: candidate })
        .run();
      tagId = Number(r.lastInsertRowid);
    } else {
      tagId = tag.id;
    }
    tx.insert(postTags).values({ postId, tagId }).run();
  }
}

/** 文章列表（可筛选状态/分类/标签/关键词） */
export function listPosts(params: ListPostsParams = {}) {
  const { page = 1, pageSize = 10 } = params;
  const { offset, limit } = paginate(page, pageSize);
  const conditions = [];

  if (params.status) conditions.push(eq(posts.status, params.status));
  if (params.type) conditions.push(eq(posts.type, params.type));
  if (params.categoryId) conditions.push(eq(posts.categoryId, params.categoryId));
  if (params.categorySlug) conditions.push(eq(categories.slug, params.categorySlug));
  if (params.publishedOnly) conditions.push(eq(posts.status, "published"));
  if (params.keyword) {
    conditions.push(
      or(
        like(posts.title, `%${params.keyword}%`),
        like(posts.titleEn, `%${params.keyword}%`),
        like(posts.excerpt, `%${params.keyword}%`),
        like(posts.excerptEn, `%${params.keyword}%`),
        like(posts.content, `%${params.keyword}%`),
        like(posts.contentEn, `%${params.keyword}%`),
      ),
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const items = db
    .select({
      id: posts.id,
      title: posts.title,
      titleEn: posts.titleEn,
      slug: posts.slug,
      excerpt: posts.excerpt,
      excerptEn: posts.excerptEn,
      coverImage: posts.coverImage,
      status: posts.status,
      type: posts.type,
      categoryId: posts.categoryId,
      categoryName: categories.name,
      categoryNameEn: categories.nameEn,
      categorySlug: categories.slug,
      authorName: users.username,
      isPinned: posts.isPinned,
      viewCount: posts.viewCount,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(where)
    .orderBy(desc(posts.isPinned), desc(posts.id))
    .limit(limit)
    .offset(offset)
    .all();

  const total =
    db
      .select({ value: count() })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(where)
      .get()?.value ?? 0;
  return { items, total, page, pageSize };
}

/** 通过 tagSlug 查询文章（单独封装，避免复杂 join） */
export function listPostsByTag(tagSlug: string, page = 1, pageSize = 10) {
  const tag = db.select().from(tags).where(eq(tags.slug, tagSlug)).get();
  if (!tag) return { items: [], total: 0, page, pageSize, tag: null };
  const { offset, limit } = paginate(page, pageSize);
  const where = and(
    eq(postTags.tagId, tag.id),
    eq(posts.status, "published"),
  );
  const items = db
    .select({
      id: posts.id,
      title: posts.title,
      titleEn: posts.titleEn,
      slug: posts.slug,
      excerpt: posts.excerpt,
      excerptEn: posts.excerptEn,
      coverImage: posts.coverImage,
      publishedAt: posts.publishedAt,
      viewCount: posts.viewCount,
    })
    .from(postTags)
    .innerJoin(posts, eq(postTags.postId, posts.id))
    .where(where)
    .orderBy(desc(posts.id))
    .limit(limit)
    .offset(offset)
    .all();
  const total = db
    .select({ value: count() })
    .from(postTags)
    .innerJoin(posts, eq(postTags.postId, posts.id))
    .where(where)
    .get()?.value ?? 0;
  return { items, total, page, pageSize, tag };
}

export function getPostById(id: number) {
  return db.select().from(posts).where(eq(posts.id, id)).get() ?? null;
}

/** 前台获取已发布文章并累加浏览量 */
export function getPublishedPostBySlug(slug: string) {
  const post = db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .get();
  if (!post) return null;
  db.update(posts)
    .set({ viewCount: post.viewCount + 1 })
    .where(eq(posts.id, post.id))
    .run();
  return post;
}

export function getPostTags(postId: number) {
  return db
    .select({ id: tags.id, name: tags.name, slug: tags.slug })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, postId))
    .all();
}

export function createPost(userId: number, input: PostInput): number {
  const finalSlug = uniqueSlug(slugify(input.slug || input.title));
  const isPublished = input.status === "published";
  const postId = db.transaction((tx) => {
    const result = tx
      .insert(posts)
      .values({
        title: input.title,
        titleEn: input.titleEn || null,
        slug: finalSlug,
        content: input.content ?? "",
        contentEn: input.contentEn ?? "",
        excerpt: input.excerpt || null,
        excerptEn: input.excerptEn || null,
        coverImage: input.coverImage || null,
        status: input.status ?? "draft",
        type: input.type ?? "post",
        categoryId: input.categoryId ?? null,
        authorId: userId,
        isPinned: input.isPinned ?? 0,
        publishedAt: isPublished ? nowUtc() : null,
      })
      .run();
    const id = Number(result.lastInsertRowid);
    syncTags(tx, id, input.tags);
    tx.insert(postVersions)
      .values({
        postId: id,
        title: input.title,
        titleEn: input.titleEn || null,
        content: input.content ?? "",
        contentEn: input.contentEn ?? "",
        editorId: userId,
      })
      .run();
    return id;
  });
  logAudit({
    userId,
    action: "post.create",
    targetType: "post",
    targetId: postId,
    detail: input.title,
  });
  return postId;
}

export function updatePost(userId: number, id: number, input: PostInput) {
  const existing = getPostById(id);
  if (!existing) throw new Error("文章不存在");
  const finalSlug = input.slug
    ? uniqueSlug(slugify(input.slug), id)
    : existing.slug;
  const wasPublished = existing.status === "published";
  const isPublished = input.status === "published";
  db.transaction((tx) => {
    tx.update(posts)
      .set({
        title: input.title,
        titleEn: input.titleEn !== undefined ? input.titleEn || null : existing.titleEn,
        slug: finalSlug,
        content: input.content ?? existing.content,
        contentEn: input.contentEn ?? existing.contentEn,
        excerpt: input.excerpt !== undefined ? input.excerpt || null : existing.excerpt,
        excerptEn:
          input.excerptEn !== undefined
            ? input.excerptEn || null
            : existing.excerptEn,
        coverImage: input.coverImage !== undefined ? input.coverImage || null : existing.coverImage,
        status: input.status ?? existing.status,
        type: input.type ?? existing.type,
        categoryId: input.categoryId !== undefined ? input.categoryId : existing.categoryId,
        isPinned: input.isPinned ?? existing.isPinned,
        publishedAt:
          isPublished && !wasPublished ? nowUtc() : existing.publishedAt,
        updatedAt: nowUtc(),
      })
      .where(eq(posts.id, id))
      .run();
    syncTags(tx, id, input.tags);
    tx.insert(postVersions)
      .values({
        postId: id,
        title: input.title,
        titleEn: input.titleEn !== undefined ? input.titleEn || null : existing.titleEn,
        content: input.content ?? existing.content,
        contentEn: input.contentEn ?? existing.contentEn,
        editorId: userId,
      })
      .run();
  });
  logAudit({
    userId,
    action: "post.update",
    targetType: "post",
    targetId: id,
    detail: input.title,
  });
}

export function deletePost(userId: number, id: number) {
  const existing = getPostById(id);
  if (!existing) return;
  db.delete(posts).where(eq(posts.id, id)).run();
  logAudit({
    userId,
    action: "post.delete",
    targetType: "post",
    targetId: id,
    detail: existing.title,
  });
}

/** 状态流转：draft / pending / published / archived */
export function setPostStatus(userId: number, id: number, status: string) {
  const existing = getPostById(id);
  if (!existing) return;
  db.update(posts)
    .set({
      status,
      publishedAt:
        status === "published" && existing.status !== "published"
          ? nowUtc()
          : existing.publishedAt,
      updatedAt: nowUtc(),
    })
    .where(eq(posts.id, id))
    .run();
  logAudit({
    userId,
    action: `post.status:${status}`,
    targetType: "post",
    targetId: id,
    detail: existing.title,
  });
}

export function getPostVersions(postId: number) {
  return db
    .select()
    .from(postVersions)
    .where(eq(postVersions.postId, postId))
    .orderBy(desc(postVersions.id))
    .all();
}

export function restoreVersion(userId: number, versionId: number) {
  const version = db
    .select()
    .from(postVersions)
    .where(eq(postVersions.id, versionId))
    .get();
  if (!version) throw new Error("版本不存在");
  updatePost(userId, version.postId, {
    title: version.title,
    titleEn: version.titleEn ?? "",
    content: version.content,
    contentEn: version.contentEn ?? "",
  });
  return version.postId;
}
