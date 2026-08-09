"use client";

import { useRef } from "react";
import { setInquiryStatusAction } from "@/app/admin/(dashboard)/inquiries/actions";

/**
 * 客户端状态选择组件：选择变化后自动提交 Server Action。
 * 避免在 Server Component 中传递 onChange 事件处理器。
 */
const STATUS_OPTIONS = [
  { value: "new", label: "待处理" },
  { value: "processing", label: "处理中" },
  { value: "done", label: "已处理" },
];

export default function InquiryStatusSelect({
  id,
  status,
}: {
  id: number;
  status: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={setInquiryStatusAction} className="inline-block">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className="border border-gray-200 rounded px-1.5 py-1 text-xs"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </form>
  );
}
