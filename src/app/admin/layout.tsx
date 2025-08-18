import AdminSidenav from "@/components/admin/admin-sidenav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidenav />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
