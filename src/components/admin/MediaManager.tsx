"use client";

import { useActionState, useRef, useState } from "react";
import {
  deleteMediaAction,
  uploadMediaAction,
  type MediaState,
} from "@/app/admin/(dashboard)/media/actions";
import { PageHeader, FormError, btnPrimaryCls } from "./ui";
import { formatDate } from "@/lib/utils";

interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  category: string;
  createdAt: string;
}

interface MediaManagerProps {
  items: MediaItem[];
  total: number;
  canDelete: boolean;
}

export default function MediaManager({
  items,
  total,
  canDelete,
}: MediaManagerProps) {
  const [state, formAction, pending] = useActionState(uploadMediaAction, null);
  const [copied, setCopied] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const copyUrl = async (id: number, url: string) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${url}`,
      );
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      window.prompt("复制链接", `${window.location.origin}${url}`);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div>
      <PageHeader title="媒体库" description={`共 ${total} 个文件`} />

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form
          ref={formRef}
          action={formAction}
          className="flex flex-wrap items-center gap-3"
        >
          <FormError message={state?.error} />
          <input
            type="file"
            name="file"
            required
            className="text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className={btnPrimaryCls}
          >
            {pending ? "上传中..." : "上传文件"}
          </button>
        </form>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-10 text-center text-sm text-gray-400">
          暂无媒体文件
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
                {item.category === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.originalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-400 uppercase">
                    {item.category === "video" ? "视频" : "文件"}
                  </span>
                )}
              </div>
              <div className="p-3">
                <div
                  className="text-xs font-medium truncate"
                  title={item.originalName}
                >
                  {item.originalName}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatSize(item.size)}
                  {item.width ? ` · ${item.width}×${item.height}` : ""}
                  {" · "}
                  {formatDate(item.createdAt, false)}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => copyUrl(item.id, item.url)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {copied === item.id ? "已复制 ✓" : "复制链接"}
                  </button>
                  {canDelete && (
                    <form
                      action={deleteMediaAction}
                      onSubmit={(e) => {
                        if (!window.confirm("确定删除该文件吗？")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="id" value={item.id} />
                      <button className="text-xs text-red-600 hover:underline">
                        删除
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
