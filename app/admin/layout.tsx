import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/admin");

  // Check admin table
  const { data: adminRecord } = await supabase
    .from("admins")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!adminRecord) redirect("/");

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
