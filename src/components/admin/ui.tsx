import Link from "next/link";

export function AdminCard({
  title,
  actions,
  children,
}: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow">
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 py-3 border-b">
          {title && <h2 className="font-medium">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="text-sm text-gray-500 hover:text-gray-800">
      ← 返回
    </Link>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-4 text-sm text-red-600 bg-red-50 rounded p-2.5">
      {message}
    </div>
  );
}

export const inputCls =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
export const labelCls = "block text-sm font-medium mb-1";
export const btnPrimaryCls =
  "bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded px-4 py-2 text-sm font-medium";
export const btnSecondaryCls =
  "border border-gray-300 hover:bg-gray-50 rounded px-4 py-2 text-sm font-medium";
export const btnDangerCls =
  "text-red-600 hover:bg-red-50 rounded px-3 py-1.5 text-sm";
