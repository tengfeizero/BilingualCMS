"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 语言切换器：切换 /zh 与 /en 前缀，并保留当前页面路径。
 */
export default function LangSwitch({
  label,
  lang,
}: {
  label: string;
  lang: string;
}) {
  const pathname = usePathname();
  const other = lang === "en" ? "zh" : "en";
  const target =
    pathname.replace(/^\/(zh|en)(?=\/|$)/, `/${other}`) || `/${other}`;

  return (
    <Link
      href={target}
      className="text-sm text-(--t-muted2) hover:text-(--t-text) whitespace-nowrap"
    >
      {label}
    </Link>
  );
}
