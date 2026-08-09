"use client";

import { useRef } from "react";

/**
 * 客户端表单组件：提交前弹出 confirm 确认框。
 * 用于 Server Component 中的删除/恢复等危险操作，避免在
 * Server Component 中直接传递 onSubmit 事件处理器。
 */
export default function ConfirmForm({
  action,
  confirmMessage,
  children,
  hidden,
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  children: React.ReactNode;
  hidden?: { name: string; value: string | number }[];
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {hidden?.map((h) => (
        <input key={h.name} type="hidden" name={h.name} value={h.value} />
      ))}
      {children}
    </form>
  );
}
