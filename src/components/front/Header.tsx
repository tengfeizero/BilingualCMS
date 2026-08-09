import Link from "next/link";
import type { SiteSettings } from "@/services/setting.service";

interface HeaderProps {
  settings: SiteSettings;
  categories: { id: number; name: string; slug: string }[];
}

export default function Header({ settings, categories }: HeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="font-bold text-lg text-gray-900">
          {settings.site_name || "My CMS"}
        </Link>

        <nav className="hidden md:flex gap-4 text-sm text-gray-600">
          {categories.slice(0, 6).map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="hover:text-gray-900">
              {c.name}
            </Link>
          ))}
        </nav>

        <form action="/search" method="get" className="flex gap-2">
          <input
            name="q"
            placeholder="搜索文章..."
            className="border border-gray-200 rounded px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-gray-900 hover:bg-gray-700 text-white rounded px-3 py-1.5 text-sm"
          >
            搜索
          </button>
        </form>
      </div>
    </header>
  );
}
