"use client";

import { useActionState, useState } from "react";
import Editor from "./Editor";
import {
  btnPrimaryCls,
  FormError,
  inputCls,
  labelCls,
} from "./ui";
import type { ActionState } from "@/app/admin/(dashboard)/posts/actions";

export interface PostFormValue {
  id?: number;
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string | null;
  coverImage?: string | null;
  status?: string;
  type?: string;
  categoryId?: number | null;
  isPinned?: number;
  tags?: string;
}

interface PostFormProps {
  action: (
    prev: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  initial?: PostFormValue;
  categories: { id: number; name: string; parentId: number | null }[];
}

const STATUS_OPTIONS = [
  { value: "draft", label: "草稿" },
  { value: "pending", label: "待审核" },
  { value: "published", label: "已发布" },
  { value: "archived", label: "已归档" },
];

export default function PostForm({
  action,
  initial,
  categories,
}: PostFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");

  return (
    <form action={formAction}>
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <FormError message={state?.error} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className={labelCls} htmlFor="title">
              标题
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={initial?.title}
              className={inputCls}
              placeholder="请输入标题"
            />
          </div>

          <div>
            <label className={labelCls}>正文</label>
            <Editor value={content} onChange={setContent} />
            <input type="hidden" name="content" value={content} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="status">
              状态
            </label>
            <select
              id="status"
              name="status"
              defaultValue={initial?.status ?? "draft"}
              className={inputCls}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls} htmlFor="type">
              类型
            </label>
            <select
              id="type"
              name="type"
              defaultValue={initial?.type ?? "post"}
              className={inputCls}
            >
              <option value="post">文章</option>
              <option value="page">页面</option>
            </select>
          </div>

          <div>
            <label className={labelCls} htmlFor="categoryId">
              分类
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={initial?.categoryId ?? ""}
              className={inputCls}
            >
              <option value="">无分类</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls} htmlFor="tags">
              标签（逗号分隔）
            </label>
            <input
              id="tags"
              name="tags"
              defaultValue={initial?.tags}
              className={inputCls}
              placeholder="如：前端, Next.js"
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="slug">
              URL 别名（留空自动生成）
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={initial?.slug}
              className={inputCls}
              placeholder="my-post-slug"
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="coverImage">
              封面图 URL
            </label>
            <input
              id="coverImage"
              name="coverImage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className={inputCls}
              placeholder="https://..."
            />
            {coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImage}
                alt="封面预览"
                className="mt-2 w-full max-h-40 object-cover rounded border"
              />
            )}
          </div>

          <div>
            <label className={labelCls} htmlFor="excerpt">
              摘要
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              defaultValue={initial?.excerpt ?? ""}
              className={inputCls}
              rows={3}
              placeholder="列表页展示的摘要，留空自动截取"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPinned"
              value="1"
              defaultChecked={initial?.isPinned === 1}
              className="rounded"
            />
            置顶文章
          </label>

          <button
            type="submit"
            disabled={pending}
            className={`${btnPrimaryCls} w-full`}
          >
            {pending ? "保存中..." : initial?.id ? "保存修改" : "创建文章"}
          </button>
        </div>
      </div>
    </form>
  );
}
