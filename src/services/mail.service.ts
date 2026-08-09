import nodemailer from "nodemailer";
import { getSetting } from "./setting.service";

/**
 * 通过站点 SMTP 配置发送邮件（管理员通知询盘）。
 * SMTP 未配置时静默跳过，不阻塞业务。
 */
export async function sendInquiryNotification(input: {
  subject: string;
  html: string;
}): Promise<void> {
  const host = getSetting("smtp_host");
  const port = getSetting("smtp_port");
  const user = getSetting("smtp_user");
  const password = getSetting("smtp_password");
  const to = getSetting("contact_email");

  if (!host || !user || !to) return;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port || 587),
      secure: Number(port || 587) === 465,
      auth: { user, pass: password },
    });
    await transporter.sendMail({
      from: `"${user}" <${user}>`,
      to,
      subject: input.subject,
      html: input.html,
    });
  } catch (err) {
    console.error("邮件发送失败:", err);
  }
}
