import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

/** 用户表 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // bcrypt 哈希
  role: text("role").notNull().default("author"),
  avatar: text("avatar"),
  bio: text("bio"),
  status: text("status").notNull().default("active"), // active / disabled
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

/** 角色表（RBAC） */
export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(), // super_admin / admin / editor / author
  permissions: text("permissions").notNull().default("[]"), // JSON 数组
  description: text("description"),
});

/** 分类表（树形） */
export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    nameEn: text("name_en"),
    slug: text("slug").notNull().unique(),
    parentId: integer("parent_id"),
    description: text("description"),
    descriptionEn: text("description_en"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [index("idx_categories_parent").on(t.parentId)],
);

/** 标签表 */
export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

/** 文章表 */
export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    titleEn: text("title_en"),
    slug: text("slug").notNull().unique(),
    content: text("content").notNull().default(""),
    contentEn: text("content_en").notNull().default(""),
    excerpt: text("excerpt"),
    excerptEn: text("excerpt_en"),
    coverImage: text("cover_image"),
    status: text("status").notNull().default("draft"), // draft / pending / published / archived
    type: text("type").notNull().default("post"), // post / page
    categoryId: integer("category_id"),
    authorId: integer("author_id").notNull(),
    isPinned: integer("is_pinned").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    publishedAt: text("published_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [
    index("idx_posts_status").on(t.status),
    index("idx_posts_category").on(t.categoryId),
    index("idx_posts_published").on(t.publishedAt),
  ],
);

/** 文章-标签关联表 */
export const postTags = sqliteTable(
  "post_tags",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [index("idx_post_tags_tag").on(t.tagId)],
);

/** 文章版本历史 */
export const postVersions = sqliteTable(
  "post_versions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    titleEn: text("title_en"),
    content: text("content").notNull(),
    contentEn: text("content_en"),
    editorId: integer("editor_id"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [index("idx_post_versions_post").on(t.postId)],
);

/** 媒体文件 */
export const media = sqliteTable(
  "media",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    filename: text("filename").notNull(), // 存储文件名（防冲突重命名）
    originalName: text("original_name").notNull(),
    url: text("url").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    width: integer("width"),
    height: integer("height"),
    thumbUrl: text("thumb_url"), // 缩略图
    category: text("category").notNull().default("image"), // image / file / video
    uploaderId: integer("uploader_id"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [index("idx_media_uploader").on(t.uploaderId)],
);

/** 操作日志 */
export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id"),
    action: text("action").notNull(), // post.create / post.publish / user.delete ...
    targetType: text("target_type"),
    targetId: integer("target_id"),
    detail: text("detail"),
    ip: text("ip"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [index("idx_audit_logs_user").on(t.userId)],
);

/** 站点设置（KV 存储） */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(), // JSON 序列化
});

/** 产品分类（海外独立站） */
export const productCategories = sqliteTable(
  "product_categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(), // 中文名
    nameEn: text("name_en"), // 英文名
    slug: text("slug").notNull().unique(),
    parentId: integer("parent_id"),
    description: text("description"),
    descriptionEn: text("description_en"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [index("idx_product_categories_parent").on(t.parentId)],
);

/** 产品（海外独立站） */
export const products = sqliteTable(
  "products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(), // 中文名
    nameEn: text("name_en"), // 英文名
    slug: text("slug").notNull().unique(),
    categoryId: integer("category_id"),
    summary: text("summary"), // 中文简介
    summaryEn: text("summary_en"), // 英文简介
    description: text("description"), // 中文详情（HTML）
    descriptionEn: text("description_en"), // 英文详情（HTML）
    spec: text("spec"), // 规格参数 JSON [{label,value}]（中文）
    specEn: text("spec_en"), // 规格参数 JSON [{label,value}]（英文）
    coverImage: text("cover_image"),
    images: text("images").notNull().default("[]"), // 多图 JSON 数组
    status: text("status").notNull().default("draft"), // draft / published / archived
    isFeatured: integer("is_featured").notNull().default(0), // 首页精选
    viewCount: integer("view_count").notNull().default(0),
    seoTitle: text("seo_title"),
    seoKeywords: text("seo_keywords"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [
    index("idx_products_category").on(t.categoryId),
    index("idx_products_status").on(t.status),
  ],
);

/** 询盘记录（海外独立站） */
export const inquiries = sqliteTable(
  "inquiries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    whatsapp: text("whatsapp"),
    country: text("country"),
    company: text("company"),
    productId: integer("product_id"),
    message: text("message"),
    ip: text("ip"),
    status: text("status").notNull().default("new"), // new / processing / done
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [index("idx_inquiries_status").on(t.status)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Media = typeof media.$inferSelect;
