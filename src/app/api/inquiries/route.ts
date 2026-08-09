import { NextResponse, type NextRequest } from "next/server";
import { createInquiry } from "@/services/inquiry.service";
import { sendInquiryNotification } from "@/services/mail.service";
import { getProductById } from "@/services/product.service";
import { getSetting } from "@/services/setting.service";

/** 公开提交询盘（海外买家） */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const whatsapp = String(body.whatsapp ?? "").trim();
  const country = String(body.country ?? "").trim();
  const company = String(body.company ?? "").trim();
  const message = String(body.message ?? "").trim();
  const productIdRaw = body.productId;

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "name, email, message are required" },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  const productId =
    typeof productIdRaw === "number" && Number.isInteger(productIdRaw)
      ? productIdRaw
      : null;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;

  try {
    const id = createInquiry({
      name,
      email,
      whatsapp: whatsapp || null,
      country: country || null,
      company: company || null,
      productId,
      message: message || null,
      ip,
    });

    // 邮件通知管理员（SMTP 未配置时静默跳过）
    const product = productId ? getProductById(productId) : null;
    const siteName = getSetting("site_name");
    const productName = product?.name ?? "通用咨询";
    await sendInquiryNotification({
      subject: `【新询盘】${productName} - ${name}`,
      html: `
        <h3>收到新的询盘</h3>
        <p><b>产品：</b>${productName}</p>
        <p><b>姓名：</b>${escapeHtml(name)}</p>
        <p><b>邮箱：</b>${escapeHtml(email)}</p>
        ${whatsapp ? `<p><b>WhatsApp：</b>${escapeHtml(whatsapp)}</p>` : ""}
        ${country ? `<p><b>国家/地区：</b>${escapeHtml(country)}</p>` : ""}
        ${company ? `<p><b>公司：</b>${escapeHtml(company)}</p>` : ""}
        <p><b>询盘内容：</b></p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
        <p style="color:#888">来自 ${siteName || "独立站"}</p>
      `,
    });

    return NextResponse.json({ id, ok: true }, { status: 201 });
  } catch (err) {
    console.error("提交询盘失败:", err);
    return NextResponse.json({ error: "submit failed" }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
