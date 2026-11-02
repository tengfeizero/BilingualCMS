import { z } from "zod";

export const POST_STATUS = ["draft", "pending", "published", "archived"] as const;
export const POST_TYPE = ["post", "page"] as const;

const emptyToNull = z.preprocess(
  (v) => {
    if (v === "" || v === undefined || v === null) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  },
  z.number().int().positive().nullable(),
);

export const postSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200, "标题不能超过 200 字"),
  titleEn: z.string().max(200, "英文标题不能超过 200 字").optional(),
  slug: z.string().trim().optional(),
  content: z.string().default(""),
  contentEn: z.string().default(""),
  excerpt: z.string().max(500, "摘要不能超过 500 字").optional(),
  excerptEn: z.string().max(500, "英文摘要不能超过 500 字").optional(),
  coverImage: z.string().max(500).optional(),
  status: z.enum(POST_STATUS).default("draft"),
  type: z.enum(POST_TYPE).default("post"),
  categoryId: emptyToNull,
  isPinned: z.coerce.number().int().min(0).max(1).default(0),
  tags: z.string().optional(),
});

export type PostInput = z.infer<typeof postSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "分类名称不能为空").max(100, "分类名称过长"),
  nameEn: z.string().max(100, "英文分类名称过长").optional(),
  slug: z.string().trim().optional(),
  parentId: emptyToNull,
  description: z.string().max(500).optional(),
  descriptionEn: z.string().max(500).optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const userSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  username: z.string().min(2, "用户名至少 2 个字符").max(50),
  password: z.string().min(6, "密码至少 6 位").optional(),
  role: z.string().default("author"),
});

export const PRODUCT_STATUS = ["draft", "published", "archived"] as const;

export const productCategorySchema = z.object({
  name: z.string().min(1, "分类名称不能为空").max(100, "分类名称过长"),
  nameEn: z.string().max(100).optional(),
  slug: z.string().trim().optional(),
  parentId: emptyToNull,
  description: z.string().max(500).optional(),
  descriptionEn: z.string().max(500).optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export type ProductCategoryInput = z.infer<typeof productCategorySchema>;

export const productSchema = z.object({
  name: z.string().min(1, "产品名称不能为空").max(200, "产品名称不能超过 200 字"),
  nameEn: z.string().max(200).optional(),
  slug: z.string().trim().optional(),
  categoryId: emptyToNull,
  summary: z.string().max(1000).optional(),
  summaryEn: z.string().max(1000).optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  spec: z.string().optional(), // JSON [{label,value}]（中文）
  specEn: z.string().optional(), // JSON [{label,value}]（英文）
  coverImage: z.string().max(500).optional(),
  images: z.string().optional(), // JSON 数组
  status: z.enum(PRODUCT_STATUS).default("draft"),
  isFeatured: z.coerce.number().int().min(0).max(1).default(0),
  seoTitle: z.string().max(200).optional(),
  seoKeywords: z.string().max(500).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
