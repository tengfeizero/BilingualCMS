"use client";

import { useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";

export default function InquiryForm({
  lang,
  productId,
  productName,
}: {
  lang: Locale;
  productId?: number;
  productName?: string;
}) {
  const dict = getDict(lang);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      whatsapp: data.get("whatsapp"),
      country: data.get("country"),
      company: data.get("company"),
      message: data.get("message"),
      productId: productId ?? null,
    };
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("submit failed");
      setSubmitted(true);
      form.reset();
    } catch {
      setError(lang === "en" ? "Submit failed, please try again." : "提交失败，请重试。");
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-green-800 text-sm">
        {dict.product.inqSuccess}
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-(--t-border2) bg-(--t-surface) px-3.5 py-2.5 text-sm text-(--t-text) placeholder:text-(--t-faint) outline-none focus:border-(--t-muted2)";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {productName && (
        <div className="text-sm text-(--t-muted)">
          {lang === "en" ? "Product: " : "产品："}
          <span className="font-medium text-(--t-text)">{productName}</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-(--t-muted) mb-1.5">
            {dict.product.inqName} *
          </label>
          <input name="name" required className={inputCls} />
        </div>
        <div>
          <label className="block text-sm text-(--t-muted) mb-1.5">
            {dict.product.inqEmail} *
          </label>
          <input name="email" type="email" required className={inputCls} />
        </div>
        <div>
          <label className="block text-sm text-(--t-muted) mb-1.5">
            {dict.product.inqWhatsapp}
          </label>
          <input name="whatsapp" placeholder="+86 138..." className={inputCls} />
        </div>
        <div>
          <label className="block text-sm text-(--t-muted) mb-1.5">
            {dict.product.inqCountry}
          </label>
          <input name="country" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-(--t-muted) mb-1.5">
            {dict.product.inqCompany}
          </label>
          <input name="company" className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-sm text-(--t-muted) mb-1.5">
          {dict.product.inqMessage} *
        </label>
        <textarea
          name="message"
          rows={4}
          required
          className={`${inputCls} resize-none`}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-lg bg-(--t-ink) hover:bg-(--t-ink-hover) text-(--t-on-ink) py-3 text-sm font-medium transition-colors"
      >
        {dict.product.inqSubmit}
      </button>
    </form>
  );
}
