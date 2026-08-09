"use server";

import { PERMISSIONS } from "@/lib/permissions";
import { requirePermission } from "@/services/auth.service";
import { setSetting } from "@/services/setting.service";

export type SettingsState = { ok?: boolean } | null;

const THEMES = ["light", "dark", "blue"];

export async function saveSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requirePermission(PERMISSIONS.SETTING_MANAGE);

  // 基础信息（双语）
  setSetting("site_name", String(formData.get("site_name") ?? ""));
  setSetting("site_name_en", String(formData.get("site_name_en") ?? ""));
  setSetting("site_description", String(formData.get("site_description") ?? ""));
  setSetting("site_description_en", String(formData.get("site_description_en") ?? ""));
  setSetting("site_logo", String(formData.get("site_logo") ?? ""));

  // 前台主题
  const theme = String(formData.get("front_theme") ?? "light");
  setSetting("front_theme", THEMES.includes(theme) ? theme : "light");

  // 联系方式（海外买家可见）
  setSetting("contact_email", String(formData.get("contact_email") ?? ""));
  setSetting("whatsapp_number", String(formData.get("whatsapp_number") ?? ""));
  setSetting("contact_phone", String(formData.get("contact_phone") ?? ""));
  setSetting("contact_address", String(formData.get("contact_address") ?? ""));
  setSetting("contact_address_en", String(formData.get("contact_address_en") ?? ""));

  // 邮件通知（SMTP）
  setSetting("smtp_host", String(formData.get("smtp_host") ?? ""));
  setSetting("smtp_port", String(formData.get("smtp_port") ?? ""));
  setSetting("smtp_user", String(formData.get("smtp_user") ?? ""));
  setSetting("smtp_password", String(formData.get("smtp_password") ?? ""));

  setSetting("allow_register", formData.get("allow_register") === "on");
  return { ok: true };
}
