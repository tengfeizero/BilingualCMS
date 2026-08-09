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
  slug: z.string().trim().optional(),
  content: z.string().default(""),
  excerpt: z.string().max(500, "摘要不能超过 500 字").optional(),
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
  slug: z.string().trim().optional(),
  parentId: emptyToNull,
  description: z.string().max(500).optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const userSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  username: z.string().min(2, "用户名至少 2 个字符").max(50),
  password: z.string().min(6, "密码至少 6 位").optional(),
  role: z.string().default("author"),
});
