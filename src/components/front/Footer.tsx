import Link from "next/link";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/services/setting.service";

export default function Footer({
  settings,
  lang,
}: {
  settings: SiteSettings;
  lang: Locale;
}) {
  const dict = getDict(lang);
  const name = lang === "en"
    ? settings.site_name_en || settings.site_name || "My Factory"
    : settings.site_name || "My Factory";

  return (
    <footer className="border-t border-(--t-border) bg-(--t-surface)">
      <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-(--t-muted2)">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <span>
            © {new Date().getFullYear()} {name}. {dict.footer.rights}
          </span>
          <nav className="flex items-center gap-5">
            <Link href={`/${lang}`} className="hover:text-(--t-text)">
              {dict.nav.home}
            </Link>
            <Link href={`/${lang}/products`} className="hover:text-(--t-text)">
              {dict.nav.products}
            </Link>
            <Link href={`/${lang}/about`} className="hover:text-(--t-text)">
              {dict.nav.about}
            </Link>
            <Link href={`/${lang}/contact`} className="hover:text-(--t-text)">
              {dict.nav.contact}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
