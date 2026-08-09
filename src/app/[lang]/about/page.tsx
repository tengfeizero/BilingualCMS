import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { getSettings } from "@/services/setting.service";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();
  const lang: Locale = langParam;
  const dict = getDict(lang);
  const settings = getSettings();

  const en = lang === "en";

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <h1 className="text-4xl font-semibold tracking-tight text-(--t-text)">
        {dict.nav.about}
      </h1>

      <section className="mt-12">
        <h2 className="text-2xl font-medium text-(--t-text)">
          {en ? "Who We Are" : "我们是谁"}
        </h2>
        <p className="mt-4 text-(--t-muted) leading-relaxed">
          {en
            ? settings.site_description_en || "We are a professional factory dedicated to manufacturing high-quality products for global customers."
            : settings.site_description || "我们是一家专业工厂，致力于为全球客户制造高品质产品。"}
        </p>
      </section>

      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: en ? "Advanced Equipment" : "先进设备",
            desc: en
              ? "Modern production lines with precise machinery to ensure consistent quality."
              : "现代化生产线与精密设备，确保产品质量稳定。",
          },
          {
            title: en ? "Experienced Team" : "经验团队",
            desc: en
              ? "Skilled engineers and workers with years of manufacturing expertise."
              : "经验丰富的工程师与技术人员，深耕制造行业多年。",
          },
          {
            title: en ? "OEM / ODM Service" : "OEM/ODM 服务",
            desc: en
              ? "We support custom design and private-label manufacturing per your requirements."
              : "支持按需定制设计，提供 OEM/ODM 代工服务。",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-(--t-border) p-7">
            <h3 className="text-lg font-medium text-(--t-text)">{item.title}</h3>
            <p className="mt-2.5 text-sm text-(--t-muted2) leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-medium text-(--t-text)">
          {en ? "Why Choose Us" : "为什么选择我们"}
        </h2>
        <ul className="mt-5 space-y-3 text-(--t-muted)">
          {(
            en
              ? [
                  "Factory-direct pricing with no middlemen",
                  "Strict quality control on every batch",
                  "Fast response and professional export service",
                  "Flexible customization to meet your market needs",
                ]
              : [
                  "工厂直供，无中间商赚差价",
                  "每批产品严格质检",
                  "快速响应，专业出口服务",
                  "灵活定制，满足市场需求",
                ]
          ).map((text) => (
            <li key={text} className="flex items-start gap-3">
              <span className="mt-0.5 text-green-600">✓</span>
              {text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
