"use server";

import { PERMISSIONS } from "@/lib/permissions";
import { requirePermission } from "@/services/auth.service";
import { setSetting } from "@/services/setting.service";

export type SettingsState = { ok?: boolean } | null;

export async function saveSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requirePermission(PERMISSIONS.SETTING_MANAGE);
  setSetting("site_name", String(formData.get("site_name") ?? ""));
  setSetting("site_description", String(formData.get("site_description") ?? ""));
  setSetting("site_logo", String(formData.get("site_logo") ?? ""));
  setSetting("allow_register", formData.get("allow_register") === "on");
  return { ok: true };
}
