import { AdminAuthProvider } from "@/lib/auth/AdminAuthProvider";
import AdminSidenav from "@/components/admin/admin-sidenav";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminAuthGuard>
        <div className="flex h-screen bg-gray-100">
          <AdminSidenav />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </AdminAuthGuard>
    </AdminAuthProvider>
  );
}
