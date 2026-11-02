"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  type CategoryState,
} from "@/app/admin/(dashboard)/categories/actions";
import Modal from "./Modal";
import { PageHeader, FormError, btnPrimaryCls, inputCls, labelCls } from "./ui";

interface CategoryNode {
  id: number;
  name: string;
  nameEn: string | null;
  slug: string;
  parentId: number | null;
  description: string | null;
  descriptionEn: string | null;
  sortOrder: number;
  children: CategoryNode[];
}

interface CategoryManagerProps {
  tree: CategoryNode[];
  parentOptions: { id: number; name: string; nameEn: string | null }[];
}

function CategoryForm({
  editing,
  parentOptions,
  onSaved,
}: {
  editing: CategoryNode | null;
  parentOptions: { id: number; name: string; nameEn: string | null }[];
  onSaved: () => void;
}) {
  const action = editing ? updateCategoryAction : createCategoryAction;
  const [state, formAction, pending] = useActionState<CategoryState, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state?.ok) onSaved();
  }, [state, onSaved]);

  return (
    <form action={formAction} className="space-y-3">
      {editing?.id ? <input type="hidden" name="id" value={editing.id} /> : null}
      <FormError message={state?.error} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>名称（中文）</label>
          <input
            name="name"
            required
            defaultValue={editing?.name}
            className={inputCls}
            placeholder="分类名称"
          />
        </div>
        <div>
          <label className={labelCls}>名称（英文）</label>
          <input
            name="nameEn"
            defaultValue={editing?.nameEn ?? ""}
            className={inputCls}
            placeholder="Category Name"
          />
        </div>
        <div>
          <label className={labelCls}>URL 别名（留空自动生成）</label>
          <input
            name="slug"
            defaultValue={editing?.slug}
            className={inputCls}
            placeholder="category-slug"
          />
        </div>
        <div>
          <label className={labelCls}>父分类</label>
          <select name="parentId" defaultValue={editing?.parentId ?? ""} className={inputCls}>
            <option value="">无（顶级分类）</option>
            {parentOptions
              .filter((o) => o.id !== editing?.id)
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                  {o.nameEn ? ` / ${o.nameEn}` : ""}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>排序（数字越小越靠前）</label>
          <input
            name="sortOrder"
            type="number"
            defaultValue={editing?.sortOrder ?? 0}
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>描述（中文）</label>
        <input
          name="description"
          defaultValue={editing?.description ?? ""}
          className={inputCls}
          placeholder="可选"
        />
      </div>
      <div>
        <label className={labelCls}>描述（英文）</label>
        <input
          name="descriptionEn"
          defaultValue={editing?.descriptionEn ?? ""}
          className={inputCls}
          placeholder="Optional"
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="submit" disabled={pending} className={btnPrimaryCls}>
          {pending ? "保存中..." : editing ? "保存修改" : "添加分类"}
        </button>
      </div>
    </form>
  );
}

/** 树 → 带缩进的扁平行 */
function flatten(tree: CategoryNode[], depth = 0): (CategoryNode & { depth: number })[] {
  const rows: (CategoryNode & { depth: number })[] = [];
  for (const node of tree) {
    rows.push({ ...node, depth });
    if (node.children.length) {
      rows.push(...flatten(node.children, depth + 1));
    }
  }
  return rows;
}

export default function CategoryManager({
  tree,
  parentOptions,
}: CategoryManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<CategoryNode | null>(null);
  const [open, setOpen] = useState(false);
  const rows = flatten(tree);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row: CategoryNode) {
    setEditing(row);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditing(null);
  }

  function handleSaved() {
    close();
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="分类管理"
        description={`共 ${rows.length} 个分类`}
        action={
          <button
            type="button"
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm font-medium"
          >
            + 添加分类
          </button>
        }
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            暂无分类，点击右上角添加
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="px-4 py-2.5">名称</th>
                <th className="px-4 py-2.5 w-40">英文名</th>
                <th className="px-4 py-2.5 w-40">别名</th>
                <th className="px-4 py-2.5 w-20">排序</th>
                <th className="px-4 py-2.5 w-28">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-4 py-2.5">
                    <span style={{ paddingLeft: row.depth * 16 }}>
                      {row.depth > 0 ? "└ " : ""}
                      {row.name}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{row.nameEn ?? "-"}</td>
                  <td className="px-4 py-2.5 text-gray-500">{row.slug}</td>
                  <td className="px-4 py-2.5 text-gray-500">{row.sortOrder}</td>
                  <td className="px-4 py-2.5 flex gap-2">
                    <button
                      onClick={() => openEdit(row)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      编辑
                    </button>
                    <form
                      action={deleteCategoryAction}
                      onSubmit={(e) => {
                        if (
                          !window.confirm(
                            `确定删除分类「${row.name}」吗？文章将变为无分类。`,
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="id" value={row.id} />
                      <button className="text-red-600 hover:underline text-xs">
                        删除
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? `编辑分类：${editing.name}` : "添加分类"}
        onClose={close}
        width="lg"
      >
        <CategoryForm
          editing={editing}
          parentOptions={parentOptions}
          onSaved={handleSaved}
        />
      </Modal>
    </div>
  );
}
