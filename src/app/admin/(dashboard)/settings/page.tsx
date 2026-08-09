import SettingsForm from "@/components/admin/SettingsForm";
import { PERMISSIONS } from "@/lib/permissions";
import { requirePermission } from "@/services/auth.service";
import { getSettings } from "@/services/setting.service";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requirePermission(PERMISSIONS.SETTING_MANAGE);
  const settings = getSettings();

  return <SettingsForm settings={settings} />;
}
