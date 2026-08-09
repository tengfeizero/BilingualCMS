import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import InquiryForm from "@/components/front/InquiryForm";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { getPublishedProductBySlug } from "@/services/product.service";
import { getSettings } from "@/services/setting.service";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: langParam, slug } = await params;
  if (!isLocale(langParam)) notFound();
  const lang: Locale = langParam;
  const dict = getDict(lang);
  const settings = getSettings();

  const product = getPublishedProductBySlug(decodeURIComponent(slug));
  if (!product) notFound();

  const name = lang === "en" ? product.nameEn || product.name : product.name;
  const summary =
    lang === "en" ? product.summaryEn || product.summary : product.summary;
  const description =
    lang === "en" ? product.descriptionEn || product.description : product.description;

  let spec: { label: string; value: string }[] = [];
  try {
    const specRaw = lang === "en" ? product.specEn || product.spec : product.spec;
    const parsed = JSON.parse(specRaw ?? "[]");
    if (Array.isArray(parsed)) spec = parsed;
  } catch {
    spec = [];
  }

  const images = (() => {
    try {
      const arr = JSON.parse(product.images ?? "[]");
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  })();

  const whatsapp = settings.whatsapp_number
    ? settings.whatsapp_number.replace(/[^\d]/g, "")
    : "";
  const contactEmail = settings.contact_email || "";

  const gallery = [product.coverImage, ...images].filter(Boolean) as string[];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 图片画廊 */}
        <div>
          {gallery.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {gallery.slice(0, 1).map((src, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] bg-(--t-surface3) rounded-2xl overflow-hidden relative"
                >
                  <Image src={src} alt={name} fill className="object-cover" />
                </div>
              ))}
              {gallery.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {gallery.slice(1, 4).map((src, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-(--t-surface3) rounded-xl overflow-hidden relative"
                    >
                      <Image src={src} alt={`${name} ${i + 2}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[4/3] bg-(--t-surface3) rounded-2xl flex items-center justify-center text-(--t-faint)">
              {name}
            </div>
          )}
        </div>

        {/* 产品信息 */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-(--t-text)">
            {name}
          </h1>
          {summary && (
            <p className="mt-4 text-lg text-(--t-muted) leading-relaxed">{summary}</p>
          )}

          {/* 联系按钮 */}
          <div className="mt-8 flex flex-wrap gap-3">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                  lang === "en" ? `Hi, I'm interested in ${name}.` : `您好，我对 ${name} 感兴趣。`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 text-sm font-medium transition-colors"
              >
                WhatsApp
              </a>
            )}
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}?subject=${encodeURIComponent(name)}`}
                className="inline-flex items-center gap-2 rounded-full bg-(--t-ink) hover:bg-(--t-ink-hover) text-(--t-on-ink) px-6 py-2.5 text-sm font-medium transition-colors"
              >
                {lang === "en" ? "Email Us" : "邮件咨询"}
              </a>
            )}
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center gap-2 rounded-full border border-(--t-border3) hover:border-(--t-muted2) text-(--t-muted) px-6 py-2.5 text-sm font-medium transition-colors"
            >
              {dict.contact.title}
            </Link>
          </div>

          {/* 询盘表单 */}
          <div className="mt-10 rounded-2xl border border-(--t-border) bg-(--t-surface2) p-6">
            <h2 className="text-lg font-medium text-(--t-text) mb-5">
              {dict.product.inqTitle}
            </h2>
            <InquiryForm lang={lang} productId={product.id} productName={name} />
          </div>
        </div>
      </div>

      {/* 详情 */}
      {description && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-(--t-text)">
            {dict.product.detail}
          </h2>
          <div
            className="mt-6 prose-cms text-(--t-muted)"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </section>
      )}

      {/* 规格参数 */}
      {spec.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-(--t-text)">
            {dict.product.spec}
          </h2>
          <div className="mt-6 rounded-xl border border-(--t-border) overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {spec.map((row, i) => (
                  <tr key={i} className={i % 2 ? "bg-(--t-surface2)" : "bg-(--t-surface)"}>
                    <td className="px-5 py-3 text-(--t-muted2) w-48 font-medium">
                      {row.label}
                    </td>
                    <td className="px-5 py-3 text-(--t-text)">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
