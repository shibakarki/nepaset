import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, type OrderStatus } from "@/types/admin";
import { SignOutButton } from "@/components/account/SignOutButton";
import { OrderSuccessToast } from "@/components/account/OrderSuccessToast";

async function getAccountData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id, 
      status, 
      total_amount, 
      created_at, 
      custom_request,
      order_items (
        id,
        quantity,
        unit_price,
        products (
          name,
          slug,
          images
        ),
        product_variants (
          size,
          color
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: adminRow } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .single();

  return {
    user,
    profile,
    orders: (orders ?? []) as any[],
    isAdmin: !!adminRow,
  };
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const data = await getAccountData();
  if (!data) redirect("/auth/login");

  const { user, profile, orders, isAdmin } = data;
  const params = await searchParams;
  const showOrderSuccess = params.order === 'success';

  const displayName = profile?.full_name ?? user.email ?? "Account";
  const memberSince = new Date(user.created_at).toLocaleDateString("en-NP", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Order success toast */}
      {showOrderSuccess && <OrderSuccessToast />}

      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted mb-1">
            My Account
          </p>
          <h1 className="font-space text-3xl font-medium text-foreground tracking-tight">
            {displayName}
          </h1>
          <p className="text-sm text-muted mt-1">
            Member since {memberSince}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 border border-border rounded-lg text-muted hover:text-foreground hover:border-foreground transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Admin panel
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>

      {/* Profile card */}
      <section className="border border-border rounded-xl p-6 mb-8 bg-surface">
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted mb-5">
          Profile
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Name</span>
            <span className="text-foreground font-medium">
              {profile?.full_name ?? "—"}
            </span>
          </div>
          <div className="border-t border-border" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Email</span>
            <span className="text-foreground">{user.email}</span>
          </div>
        </div>
      </section>

      {/* Orders */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted">
            Order history
          </h2>
          <span className="text-xs text-muted">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-12 text-center">
            <p className="text-sm text-muted mb-4">No orders yet.</p>
            <Link
              href="/shop"
              className="text-xs font-medium px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-colors"
            >
              Browse shop
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-border rounded-xl p-5 bg-surface transition-all duration-150"
              >
                {/* Order Top Bar Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-medium text-foreground">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={[
                          "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                          ORDER_STATUS_COLORS[order.status as OrderStatus],
                        ].join(" ")}
                      >
                        {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      {new Date(order.created_at).toLocaleDateString("en-NP", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs text-muted mb-0.5">Total Amount</p>
                    <p className="text-sm font-semibold text-foreground">
                      Rs. {Number(order.total_amount || 0).toLocaleString("en-NP")}
                    </p>
                  </div>
                </div>

                {/* Ordered Products Sub-List */}
                <div className="space-y-4">
                  {order.order_items?.map((item: any) => {
                    const product = item.products;
                    const variant = item.product_variants;
                    const imageUrl = product?.images?.[0];

                    return (
                      <div key={item.id} className="flex gap-3 items-center">
                        {/* Product Image preview */}
                        <div className="w-12 h-12 rounded-lg bg-surface-2 overflow-hidden flex-shrink-0 relative border border-border">
                          {imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imageUrl}
                              alt={product?.name || "Product preview"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm">📦</div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-space text-xs font-medium text-foreground truncate">
                            {product?.name || "Unknown Product"}
                          </p>
                          {variant && (variant.size || variant.color) && (
                            <p className="font-inter text-[11px] text-muted mt-0.5">
                              {[variant.size, variant.color].filter(Boolean).join(" · ")}
                            </p>
                          )}
                          <p className="font-inter text-[11px] text-muted mt-0.5">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        {/* Item Total Price */}
                        <div className="text-right shrink-0">
                          <p className="font-space text-xs font-medium text-foreground">
                            Rs. {Number(item.unit_price * item.quantity).toLocaleString("en-NP")}
                          </p>
                          {item.quantity > 1 && (
                            <p className="font-inter text-[10px] text-muted mt-0.5">
                              (Rs. {Number(item.unit_price).toLocaleString("en-NP")} each)
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Optional Custom Request field */}
                {order.custom_request && (
                  <div className="mt-4 pt-3 border-t border-dashed border-border">
                    <p className="text-[11px] text-muted">
                      <span className="font-medium text-foreground">Notes/Customization:</span> {order.custom_request}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}