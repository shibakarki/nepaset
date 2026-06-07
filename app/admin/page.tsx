import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/admin/StatsCard";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, type Order } from "@/types/admin";

async function getStats() {
  const supabase = await createClient();

  const [
    { count: totalOrders },
    { count: totalProducts },
    { count: pendingOrders },
    { count: newCustomRequests },
    { data: revenueData },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("custom_request", "new"),
    supabase.from("orders").select("total").neq("status", "cancelled"),
    supabase
      .from("orders")
      .select("id, status, total, created_at, shipping_address, profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalRevenue = (revenueData ?? []).reduce(
    (sum: number, o: { total: number }) => sum + (o.total ?? 0),
    0
  );

  return {
    totalOrders: totalOrders ?? 0,
    totalProducts: totalProducts ?? 0,
    pendingOrders: pendingOrders ?? 0,
    newCustomRequests: newCustomRequests ?? 0,
    totalRevenue,
    recentOrders: (recentOrders ?? []) as Order[],
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-space text-2xl font-medium text-[#0a0a0a] tracking-tight">
          Overview
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Welcome back. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatsCard
          label="Total Revenue"
          value={`Rs. ${stats.totalRevenue.toLocaleString("en-NP")}`}
          sub="All time"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatsCard
          label="Total Orders"
          value={stats.totalOrders}
          sub={`${stats.pendingOrders} pending`}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          }
        />
        <StatsCard
          label="Products"
          value={stats.totalProducts}
          sub="In catalog"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.12 0L3.1 8.84A2 2 0 0 0 2 10.76V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8.24a2 2 0 0 0-1.09-1.92Z" />
              <path d="M12 22v-9" />
            </svg>
          }
        />
        <StatsCard
          label="Custom Requests"
          value={stats.newCustomRequests}
          sub="Need review"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          }
        />
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-3 mb-10">
        <Link
          href="/admin/products/new"
          className="text-xs font-medium px-4 py-2 bg-[#0a0a0a] text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          + Add product
        </Link>
        <Link
          href="/admin/orders"
          className="text-xs font-medium px-4 py-2 border border-neutral-150 rounded-lg text-neutral-600 hover:border-neutral-300 hover:text-[#0a0a0a] transition-colors"
        >
          View all orders
        </Link>
        <Link
          href="/admin/custom-requests"
          className="text-xs font-medium px-4 py-2 border border-neutral-150 rounded-lg text-neutral-600 hover:border-neutral-300 hover:text-[#0a0a0a] transition-colors"
        >
          Custom requests
        </Link>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-space text-sm font-medium text-[#0a0a0a]">
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs text-neutral-400 hover:text-[#0a0a0a] transition-colors"
          >
            View all →
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="border border-neutral-150 rounded-xl p-10 text-center">
            <p className="text-sm text-neutral-400">No orders yet.</p>
          </div>
        ) : (
          <div className="border border-neutral-150 rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-neutral-150 bg-neutral-50">
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                    Order
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order, i) => (
                  <tr
                    key={order.id}
                    className={[
                      "hover:bg-neutral-50 transition-colors",
                      i !== stats.recentOrders.length - 1
                        ? "border-b border-neutral-150"
                        : "",
                    ].join(" ")}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-[#0a0a0a] hover:underline"
                      >
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("en-NP")}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {order.profiles?.full_name ?? order.shipping_address?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "text-[11px] font-medium px-2 py-0.5 rounded-full border",
                          ORDER_STATUS_COLORS[order.status],
                        ].join(" ")}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#0a0a0a]">
                      Rs. {order.total.toLocaleString("en-NP")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
