import InquiryForm from "@/components/front/InquiryForm";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { getSettings } from "@/services/setting.service";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ContactPage({
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
  const whatsapp = settings.whatsapp_number
    ? settings.whatsapp_number.replace(/[^\d]/g, "")
    : "";
  const email = settings.contact_email || "";
  const phone = settings.contact_phone || "";
  const address = en
    ? settings.contact_address_en || settings.contact_address || ""
    : settings.contact_address || "";

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <h1 className="text-4xl font-semibold tracking-tight text-(--t-text)">
        {dict.contact.title}
      </h1>
      <p className="mt-3 text-(--t-muted2)">{dict.contact.subtitle}</p>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 联系信息 */}
        <div className="space-y-6">
          {email && (
            <a href={`mailto:${email}`} className="block rounded-2xl border border-(--t-border) p-6 hover:border-(--t-border3) transition-colors">
              <div className="text-sm text-(--t-muted2)">{dict.contact.email}</div>
              <div className="mt-1.5 text-lg font-medium text-(--t-text)">{email}</div>
            </a>
          )}
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-(--t-border) p-6 hover:border-(--t-border3) transition-colors"
            >
              <div className="text-sm text-(--t-muted2)">{dict.contact.whatsapp}</div>
              <div className="mt-1.5 text-lg font-medium text-(--t-text)">
                +{whatsapp}
              </div>
            </a>
          )}
          {phone && (
            <div className="rounded-2xl border border-(--t-border) p-6">
              <div className="text-sm text-(--t-muted2)">{dict.contact.phone}</div>
              <div className="mt-1.5 text-lg font-medium text-(--t-text)">{phone}</div>
            </div>
          )}
          {address && (
            <div className="rounded-2xl border border-(--t-border) p-6">
              <div className="text-sm text-(--t-muted2)">{dict.contact.address}</div>
              <div className="mt-1.5 text-lg font-medium text-(--t-text)">{address}</div>
            </div>
          )}
        </div>

        {/* 询盘表单 */}
        <div className="rounded-2xl border border-(--t-border) bg-(--t-surface2) p-8">
          <h2 className="text-xl font-medium text-(--t-text) mb-6">
            {dict.contact.formTitle}
          </h2>
          <InquiryForm lang={lang} />
        </div>
      </div>
    </div>
  );
}
