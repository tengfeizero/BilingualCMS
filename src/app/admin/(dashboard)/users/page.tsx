import UsersManager from "@/components/admin/UsersManager";
import { PERMISSIONS } from "@/lib/permissions";
import { requireLogin, requirePermission } from "@/services/auth.service";
import { listUsers } from "@/services/user.service";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requirePermission(PERMISSIONS.USER_MANAGE);
  const currentUser = await requireLogin();
  const users = listUsers();

  return <UsersManager users={users} currentUserId={currentUser.id} />;
}
