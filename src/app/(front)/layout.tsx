import Footer from "@/components/front/Footer";
import Header from "@/components/front/Header";
import { listCategories } from "@/services/category.service";
import { getSettings } from "@/services/setting.service";

export const dynamic = "force-dynamic";

export default function FrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = getSettings();
  const categories = listCategories();

  return (
    <div className="flex flex-col min-h-screen">
      <Header settings={settings} categories={categories} />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
      <Footer settings={settings} />
    </div>
  );
}
