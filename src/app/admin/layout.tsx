import { getAdminSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      {session && <AdminSidebar adminName={session.name} />}
      <div className={`flex-1 w-full ${session ? "lg:pl-64" : ""}`}>
        {children}
      </div>
    </div>
  );
}
