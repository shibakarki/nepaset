import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderItem,
  type OrderStatus,
} from "@/types/admin";

async function getOrder(id: string) {
  const supabase = await createClient();

  // Step 1: Fetch order
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !order) return null;

  // Step 2: Fetch profile manually (Removed email field)
  let profiles: any[] = [];
  if (order.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", order.user_id)
      .single();
    if (profile) {
      profiles = [profile];
    }
  }

  // Step 3: Fetch items normally
  const { data: items } = await supabase
    .from("order_items")
    .select("*, products(name, slug, images)")
    .eq("order_id", id);

  return {
    order: { ...order, profiles } as any,
    items: (items ?? []) as OrderItem[],
  };
}

const STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrder(id);

  if (!result) notFound();

  const { order, items } = result;

  async function updateStatus(formData: FormData) {
    "use server";
    const newStatus = formData.get("status") as OrderStatus;
    const { createClient: createServerClient } = await import("@/lib/supabase/server");
    const supabase = await createServerClient();
    await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Back */}
      <Link
        href="/admin/orders"
        className="text-xs text-neutral-400 hover:text-[#0a0a0a] transition-colors flex items-center gap-1.5 mb-6"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-space text-2xl font-medium text-[#0a0a0a] tracking-tight">
            #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {new Date(order.created_at).toLocaleDateString("en-NP", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span
          className={[
            "text-xs font-medium px-3 py-1 rounded-full border",
            ORDER_STATUS_COLORS[order.status],
          ].join(" ")}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="space-y-6">
        {/* Customer */}
        <section className="border border-neutral-150 rounded-xl p-5">
          <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-4">
            Customer
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Name</span>
              <span className="text-[#0a0a0a] font-medium">
                {order.profiles?.[0]?.full_name ?? order.shipping_address?.name ?? "—"}
              </span>
            </div>
            {order.shipping_address?.phone && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Phone</span>
                <span className="text-[#0a0a0a]">{order.shipping_address.phone}</span>
              </div>
            )}
            {order.shipping_address?.address && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Address</span>
                <span className="text-[#0a0a0a] text-right max-w-xs">
                  {order.shipping_address.address}
                  {order.shipping_address.city
                    ? `, ${order.shipping_address.city}`
                    : ""}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Order items */}
        <section className="border border-neutral-150 rounded-xl p-5">
          <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-4">
            Items
          </h2>
          {items.length === 0 ? (
            <p className="text-sm text-neutral-400">No items recorded.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-150 flex items-center justify-center text-lg flex-shrink-0">
                      {item.products?.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.products.images[0]}
                          alt={item.products.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        "📦"
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0a0a0a]">
                        {item.products?.name ?? "Unknown product"}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Qty: {item.quantity}
                        {item.custom_design ? " · Has custom design" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-neutral-150 mt-4 pt-4 flex justify-between">
            <span className="text-sm font-medium text-[#0a0a0a]">Total</span>
            <span className="text-sm font-medium text-[#0a0a0a]">
              Rs. {Number(order.total_amount || 0).toLocaleString("en-NP")}
            </span>
          </div>
        </section>

        {/* Custom request note */}
        {order.custom_request && (
          <section className="border border-neutral-150 rounded-xl p-5">
            <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-3">
              Custom request note
            </h2>
            <p className="text-sm text-[#0a0a0a] whitespace-pre-wrap">
              {order.custom_request}
            </p>
          </section>
        )}

        {/* Update status */}
        {order.status !== "delivered" && order.status !== "cancelled" && (
          <section className="border border-neutral-150 rounded-xl p-5">
            <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-4">
              Update status
            </h2>

            {/* Progress bar */}
            <div className="flex items-center gap-1 mb-6">
              {STATUS_FLOW.map((s, i) => {
                const currentIndex = STATUS_FLOW.indexOf(order.status);
                const isPast = i < currentIndex;
                const isCurrent = i === currentIndex;
                return (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div
                      className={[
                        "flex-1 h-1 rounded-full transition-colors",
                        isPast || isCurrent ? "bg-[#0a0a0a]" : "bg-neutral-150",
                      ].join(" ")}
                    />
                    {i === STATUS_FLOW.length - 1 && (
                      <div
                        className={[
                          "w-2 h-2 rounded-full flex-shrink-0",
                          isCurrent || isPast ? "bg-[#0a0a0a]" : "bg-neutral-150",
                        ].join(" ")}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <form action={updateStatus} className="flex flex-wrap gap-2">
              {STATUS_FLOW.filter(
                (s) => s !== order.status
              ).map((s) => (
                <button
                  key={s}
                  type="submit"
                  name="status"
                  value={s}
                  className="text-xs font-medium px-4 py-2 border border-neutral-150 rounded-lg text-[#0a0a0a] hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Mark as {ORDER_STATUS_LABELS[s]}
                </button>
              ))}
              <button
                type="submit"
                name="status"
                value="cancelled"
                className="text-xs font-medium px-4 py-2 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors ml-auto"
              >
                Cancel order
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}