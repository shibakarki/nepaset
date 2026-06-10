import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderStatus,
} from "@/types/admin";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

async function getOrders(status: string): Promise<any[]> {
  const supabase = await createClient();

  // Step 1: Fetch orders without direct SQL join to avoid PostgREST relationship errors
  let query = supabase
    .from("orders")
    .select("id, status, total_amount, created_at, shipping_address, user_id")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: orders, error: ordersError } = await query;
  if (ordersError || !orders) {
    console.error("Error fetching orders:", {
      message: ordersError?.message,
      details: ordersError?.details,
      hint: ordersError?.hint,
      code: ordersError?.code,
    });
    return [];
  }

  // Step 2: Grab all non-null user IDs
  const userIds = orders.map((o) => o.user_id).filter(Boolean);
  if (userIds.length === 0) {
    return orders.map((o) => ({ ...o, profiles: [] }));
  }

  // Step 3: Fetch profiles for these users
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);

  if (profilesError) {
    console.error("Error fetching profiles:", {
      message: profilesError?.message,
      details: profilesError?.details,
      hint: profilesError?.hint,
      code: profilesError?.code,
    });
    return orders.map((o) => ({ ...o, profiles: [] }));
  }

  // Step 4: Stitch profiles
  return orders.map((order) => {
    const matchedProfile = profiles?.find((p) => p.id === order.user_id);
    return {
      ...order,
      profiles: matchedProfile ? [matchedProfile] : [],
    };
  });
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;
  const orders = await getOrders(status);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-space text-2xl font-medium text-[#0a0a0a] tracking-tight">
          Orders
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
          {status !== "all" ? ` — ${ORDER_STATUS_LABELS[status as OrderStatus]}` : ""}
        </p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/admin/orders" : `/admin/orders?status=${f.value}`}
            className={[
              "text-[12px] font-medium px-3.5 py-1.5 rounded-full border transition-all duration-150",
              status === f.value || (f.value === "all" && !status)
                ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                : "bg-white text-neutral-500 border-neutral-150 hover:border-neutral-300 hover:text-[#0a0a0a]",
            ].join(" ")}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      {orders.length === 0 ? (
        <div className="border border-dashed border-neutral-200 rounded-xl p-16 text-center">
          <p className="text-sm text-neutral-400">No orders found.</p>
        </div>
      ) : (
        <div className="border border-neutral-150 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-150">
                <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                  Order ID
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                  Total
                </th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <tr
                  key={order.id}
                  className={[
                    "hover:bg-neutral-50 transition-colors",
                    i !== orders.length - 1 ? "border-b border-neutral-150" : "",
                  ].join(" ")}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono font-medium text-[#0a0a0a]">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[#0a0a0a]">
                      {order.profiles?.[0]?.full_name ??
                        order.shipping_address?.name ??
                        "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(order.created_at).toLocaleDateString("en-NP", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "text-[11px] font-medium px-2 py-0.5 rounded-full border",
                        ORDER_STATUS_COLORS[order.status as OrderStatus],
                      ].join(" ")}
                    >
                      {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#0a0a0a]">
                    Rs. {Number(order.total_amount || 0).toLocaleString("en-NP")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-[11px] font-medium text-[#0a0a0a] hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}