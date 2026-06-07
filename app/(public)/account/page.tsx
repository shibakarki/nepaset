import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/types/admin";
import type { Order } from "@/types/admin";
import { SignOutButton } from "@/components/account/SignOutButton";

async function getAccountData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, created_at")
    .eq("id", user.id)
    .single();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total, created_at, custom_request")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return {
    user,
    profile,
    orders: (orders ?? []) as Order[],
  };
}

export default async function AccountPage() {
  const data = await getAccountData();

  if (!data) redirect("/auth/login");

  const { user, profile, orders } = data;

  const displayName = profile?.full_name ?? user.email ?? "Account";
  const memberSince = new Date(user.created_at).toLocaleDateString("en-NP", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400 mb-1">
            My Account
          </p>
          <h1 className="font-space text-3xl font-medium text-[#0a0a0a] tracking-tight">
            {displayName}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Member since {memberSince}
          </p>
        </div>
        <SignOutButton />
      </div>

      {/* Profile card */}
      <section className="border border-neutral-150 rounded-xl p-6 mb-6">
        <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-5">
          Profile
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Name</span>
            <span className="text-[#0a0a0a] font-medium">
              {profile?.full_name ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Email</span>
            <span className="text-[#0a0a0a]">{user.email}</span>
          </div>
        </div>
      </section>

      {/* Orders */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400">
            Order history
          </h2>
          <span className="text-xs text-neutral-400">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="border border-dashed border-neutral-200 rounded-xl p-12 text-center">
            <p className="text-sm text-neutral-400 mb-4">No orders yet.</p>
            <Link
              href="/shop"
              className="text-xs font-medium px-4 py-2 bg-[#0a0a0a] text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Browse shop
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-neutral-150 rounded-xl p-5 hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-medium text-[#0a0a0a]">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={[
                          "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                          ORDER_STATUS_COLORS[order.status],
                        ].join(" ")}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      {new Date(order.created_at).toLocaleDateString("en-NP", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    {order.custom_request && (
                      <p className="text-xs text-neutral-400 mt-1">
                        Includes custom request
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#0a0a0a]">
                      Rs. {order.total.toLocaleString("en-NP")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}