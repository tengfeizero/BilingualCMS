import Link from "next/link";
import type { SiteSettings } from "@/services/setting.service";

export default function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-4xl mx-auto px-4 py-6 text-sm text-gray-500 flex items-center justify-between">
        <span>© {new Date().getFullYear()} {settings.site_name || "My CMS"}</span>
        <Link href="/admin" className="hover:text-gray-800">
          管理后台
        </Link>
      </div>
    </footer>
  );
}
