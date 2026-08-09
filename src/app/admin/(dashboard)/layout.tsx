import AdminNav from "@/components/admin/AdminNav";
import { requireLogin } from "@/services/auth.service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireLogin();

  return (
    <div className="flex min-h-screen">
      <AdminNav user={user} />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
