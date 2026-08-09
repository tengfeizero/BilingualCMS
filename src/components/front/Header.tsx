import Link from "next/link";
import { getDict, siteName } from "@/lib/i18n";
import type { SiteSettings } from "@/services/setting.service";
import type { Locale } from "@/lib/i18n";
import LangSwitch from "./LangSwitch";

interface HeaderProps {
  settings: SiteSettings;
  categories: { id: number; name: string; nameEn: string | null; slug: string }[];
  lang: Locale;
}

export default function Header({ settings, categories, lang }: HeaderProps) {
  const dict = getDict(lang);

  return (
    <header className="sticky top-0 z-20 bg-(--t-surface)/80 backdrop-blur-md border-b border-(--t-border)">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link href={`/${lang}`} className="font-semibold text-lg tracking-tight text-(--t-text) whitespace-nowrap">
          {siteName(lang, settings)}
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-[15px] text-(--t-muted)">
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

        <div className="flex items-center gap-4">
          <form action={`/${lang}/search`} method="get" className="hidden sm:block">
            <input
              name="q"
              placeholder={dict.nav.search}
              className="w-36 rounded-full border border-(--t-border2) bg-(--t-surface2) px-3.5 py-1.5 text-sm text-(--t-text) placeholder:text-(--t-faint) outline-none focus:border-(--t-muted2) focus:bg-(--t-surface)"
            />
          </form>
          <LangSwitch label={dict.langSwitch} lang={lang} />
        </div>
      </div>
    </header>
  );
}
