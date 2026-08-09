import Footer from "@/components/front/Footer";
import Header from "@/components/front/Header";
import { isLocale } from "@/lib/i18n";
import { listProductCategories } from "@/services/product.service";
import { getSettings } from "@/services/setting.service";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const THEMES = ["light", "dark", "blue"];

export default async function FrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const settings = getSettings();
  const categories = listProductCategories();
  const theme = THEMES.includes(settings.front_theme)
    ? settings.front_theme
    : "light";

  return (
    <div
      data-theme={theme}
      className="flex flex-col min-h-screen bg-(--t-bg)"
    >
      <Header settings={settings} categories={categories} lang={lang} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} lang={lang} />
    </div>
  );
}
