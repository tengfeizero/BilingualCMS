"use client";

import { useActionState, useState } from "react";
import {
  btnPrimaryCls,
  FormError,
  inputCls,
  labelCls,
} from "./ui";
import type { ProductState } from "@/app/admin/(dashboard)/products/actions";

export interface ProductFormValue {
  id?: number;
  name?: string;
  nameEn?: string | null;
  slug?: string;
  categoryId?: number | null;
  summary?: string | null;
  summaryEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  spec?: string | null; // JSON [{label,value}]（中文）
  specEn?: string | null; // JSON [{label,value}]（英文）
  coverImage?: string | null;
  images?: string; // JSON 数组
  status?: string;
  isFeatured?: number;
  seoTitle?: string | null;
  seoKeywords?: string | null;
}

interface ProductFormProps {
  action: (prev: ProductState, formData: FormData) => Promise<ProductState>;
  initial?: ProductFormValue;
  categories: { id: number; name: string; nameEn: string | null }[];
}

const STATUS_OPTIONS = [
  { value: "draft", label: "草稿" },
  { value: "published", label: "已发布" },
  { value: "archived", label: "已归档" },
];

export default function ProductForm({
  action,
  initial,
  categories,
}: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [images, setImages] = useState<string[]>(
    (() => {
      try {
        const arr = JSON.parse(initial?.images ?? "[]");
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    })(),
  );
  const [spec, setSpec] = useState<{ label: string; value: string }[]>(
    (() => {
      try {
        const arr = JSON.parse(initial?.spec ?? "[]");
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    })(),
  );
  const [specEn, setSpecEn] = useState<{ label: string; value: string }[]>(
    (() => {
      try {
        const arr = JSON.parse(initial?.specEn ?? "[]");
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    })(),
  );
  const [newImage, setNewImage] = useState("");

  function addSpec(
    list: { label: string; value: string }[],
    setList: (v: { label: string; value: string }[]) => void,
  ) {
    setList([...list, { label: "", value: "" }]);
  }

  function updateSpec(
    list: { label: string; value: string }[],
    setList: (v: { label: string; value: string }[]) => void,
    index: number,
    key: "label" | "value",
    value: string,
  ) {
    setList(list.map((r, j) => (j === index ? { ...r, [key]: value } : r)));
  }

  function addImage() {
    const url = newImage.trim();
    if (!url) return;
    setImages([...images, url]);
    setNewImage("");
  }

  return (
    <form action={formAction}>
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <FormError message={state?.error} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>产品名称（中文）</label>
              <input
                name="name"
                required
                defaultValue={initial?.name}
                className={inputCls}
                placeholder="如：全自动灌装机"
              />
            </div>
            <div>
              <label className={labelCls}>产品名称（英文）</label>
              <input
                name="nameEn"
                defaultValue={initial?.nameEn ?? ""}
                className={inputCls}
                placeholder="如：Automatic Filling Machine"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>中文简介</label>
              <textarea
                name="summary"
                defaultValue={initial?.summary ?? ""}
                className={inputCls}
                rows={2}
                placeholder="产品列表页展示的中文简介"
              />
            </div>
            <div>
              <label className={labelCls}>英文简介</label>
              <textarea
                name="summaryEn"
                defaultValue={initial?.summaryEn ?? ""}
                className={inputCls}
                rows={2}
                placeholder="Product summary shown on listing pages"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>中文详情（支持 HTML）</label>
            <textarea
              name="description"
              defaultValue={initial?.description ?? ""}
              className={`${inputCls} font-mono text-xs`}
              rows={6}
              placeholder="<p>产品详细介绍…</p>"
            />
          </div>

          <div>
            <label className={labelCls}>英文详情（支持 HTML）</label>
            <textarea
              name="descriptionEn"
              defaultValue={initial?.descriptionEn ?? ""}
              className={`${inputCls} font-mono text-xs`}
              rows={6}
              placeholder="<p>Detailed product description…</p>"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>状态</label>
            <select
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
            <label className={labelCls}>产品分类</label>
            <select
              name="categoryId"
              defaultValue={initial?.categoryId ?? ""}
              className={inputCls}
            >
              <option value="">无分类</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.nameEn ? ` / ${c.nameEn}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>URL 别名（留空自动生成）</label>
            <input
              name="slug"
              defaultValue={initial?.slug}
              className={inputCls}
              placeholder="automatic-filling-machine"
            />
          </div>

          <div>
            <label className={labelCls}>封面图 URL</label>
            <input
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
            <label className={labelCls}>产品图库（多图）</label>
            <input type="hidden" name="images" value={JSON.stringify(images)} />
            <div className="flex gap-2">
              <input
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className={inputCls}
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={addImage}
                className="border border-gray-300 hover:bg-gray-50 rounded px-3 text-sm shrink-0"
              >
                添加
              </button>
            </div>
            {images.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {images.map((url, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1"
                  >
                    <span className="flex-1 text-xs text-gray-600 truncate">
                      {url}
                    </span>
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, j) => j !== i))}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      移除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isFeatured"
              value="1"
              defaultChecked={initial?.isFeatured === 1}
              className="rounded"
            />
            首页精选展示
          </label>

          <div>
            <label className={labelCls}>SEO 标题</label>
            <input
              name="seoTitle"
              defaultValue={initial?.seoTitle ?? ""}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>SEO 关键词</label>
            <input
              name="seoKeywords"
              defaultValue={initial?.seoKeywords ?? ""}
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className={`${btnPrimaryCls} w-full`}
          >
            {pending ? "保存中..." : initial?.id ? "保存修改" : "创建产品"}
          </button>
        </div>
      </div>

      {/* 规格参数（双语） */}
      <div className="mt-8">
        <input type="hidden" name="spec" value={JSON.stringify(spec)} />
        <input type="hidden" name="specEn" value={JSON.stringify(specEn)} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            {
              title: "规格参数（中文）",
              list: spec,
              setList: setSpec,
              labelPlaceholder: "参数名（如：功率）",
              valuePlaceholder: "参数值（如：5.5kW）",
            },
            {
              title: "规格参数（英文）",
              list: specEn,
              setList: setSpecEn,
              labelPlaceholder: "Label (e.g. Power)",
              valuePlaceholder: "Value (e.g. 5.5kW)",
            },
          ].map((col) => (
            <div key={col.title} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{col.title}</h3>
                <button
                  type="button"
                  onClick={() => addSpec(col.list, col.setList)}
                  className="border border-gray-300 hover:bg-gray-50 rounded px-3 py-1 text-sm bg-white"
                >
                  + 添加参数
                </button>
              </div>
              {col.list.length === 0 ? (
                <p className="text-sm text-gray-400">
                  暂无规格参数。规格参数会展示在产品详情页的规格表中。
                </p>
              ) : (
                <div className="space-y-2">
                  {col.list.map((row, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={row.label}
                        onChange={(e) =>
                          updateSpec(
                            col.list,
                            col.setList,
                            i,
                            "label",
                            e.target.value,
                          )
                        }
                        className={inputCls}
                        placeholder={col.labelPlaceholder}
                      />
                      <input
                        value={row.value}
                        onChange={(e) =>
                          updateSpec(
                            col.list,
                            col.setList,
                            i,
                            "value",
                            e.target.value,
                          )
                        }
                        className={inputCls}
                        placeholder={col.valuePlaceholder}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          col.setList(col.list.filter((_, j) => j !== i))
                        }
                        className="text-red-500 hover:text-red-700 text-sm px-2"
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
