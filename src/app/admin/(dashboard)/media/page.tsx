import MediaManager from "@/components/admin/MediaManager";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { requireLogin } from "@/services/auth.service";
import { listMedia } from "@/services/media.service";

export const dynamic = "force-dynamic";

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const user = await requireLogin();
  const canDelete = hasPermission(user.role, PERMISSIONS.MEDIA_DELETE);

  const { items, total } = listMedia({ page, pageSize: 24 });

  return <MediaManager items={items} total={total} canDelete={canDelete} />;
}
