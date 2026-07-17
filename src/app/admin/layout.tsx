import { requireAdminOrPermissioned } from "@/shared/services/auth/server";
import AdminShell from "./AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdminOrPermissioned();

  return (
    <AdminShell
      role={profile.role}
      permissions={profile.permissions ?? []}
    >
      {children}
    </AdminShell>
  );
}
