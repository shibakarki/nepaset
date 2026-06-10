import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type CustomRequest = {
  id: string;
  user_id: string;
  status: string;
  total: number;
  custom_request: string | null;
  created_at: string;
  shipping_address: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  profiles?: { full_name: string | null; email: string | null }[];
};

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "quoted", label: "Quoted" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-amber-50 text-amber-800 border-amber-200",
  reviewing: "bg-blue-50 text-blue-800 border-blue-200",
  quoted: "bg-purple-50 text-purple-800 border-purple-200",
  accepted: "bg-green-50 text-green-800 border-green-200",
  rejected: "bg-red-50 text-red-800 border-red-200",
};

async function getRequest(id: string): Promise<CustomRequest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, profiles(full_name, email)")
    .eq("id", id)
    .not("custom_request", "is", null)
    .single();

  if (error || !data) return null;
  return data as CustomRequest;
}

export default async function CustomRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getRequest(id);

  if (!request) notFound();

  async function updateStatus(formData: FormData) {
    "use server";
    const newStatus = formData.get("status") as string;
    const { createClient: createServerClient } = await import("@/lib/supabase/server");
    const supabase = await createServerClient();
    await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    revalidatePath(`/admin/custom-requests/${id}`);
    revalidatePath("/admin/custom-requests");
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Back */}
      <Link
        href="/admin/custom-requests"
        className="text-xs text-neutral-400 hover:text-[#0a0a0a] transition-colors flex items-center gap-1.5 mb-6"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Custom Requests
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-space text-2xl font-medium text-[#0a0a0a] tracking-tight">
            #{request.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {new Date(request.created_at).toLocaleDateString("en-NP", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span
          className={[
            "text-xs font-medium px-3 py-1 rounded-full border",
            STATUS_COLORS[request.status] ?? "bg-neutral-50 text-neutral-500 border-neutral-150",
          ].join(" ")}
        >
          {request.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-5">
        {/* Customer info */}
        <section className="border border-neutral-150 rounded-xl p-5">
          <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-4">
            Customer
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Name</span>
              <span className="text-[#0a0a0a] font-medium">
                {request.profiles?.[0]?.full_name ?? request.shipping_address?.name ?? "—"}
              </span>
            </div>
            {request.profiles?.[0]?.email && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Email</span>
                <span className="text-[#0a0a0a]">{request.profiles[0].email}</span>
              </div>
            )}
            {request.shipping_address?.phone && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Phone</span>
                <span className="text-[#0a0a0a]">{request.shipping_address.phone}</span>
              </div>
            )}
            {request.shipping_address?.address && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Address</span>
                <span className="text-[#0a0a0a] text-right max-w-xs">
                  {request.shipping_address.address}
                  {request.shipping_address.city
                    ? `, ${request.shipping_address.city}`
                    : ""}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Request details */}
        <section className="border border-neutral-150 rounded-xl p-5">
          <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-3">
            Request details
          </h2>
          <p className="text-sm text-[#0a0a0a] whitespace-pre-wrap leading-relaxed">
            {request.custom_request ?? "No details provided."}
          </p>
        </section>

        {/* Update status */}
        <section className="border border-neutral-150 rounded-xl p-5">
          <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-4">
            Update status
          </h2>
          <form action={updateStatus} className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.filter((s) => s.value !== request.status).map((s) => (
              <button
                key={s.value}
                type="submit"
                name="status"
                value={s.value}
                className={[
                  "text-xs font-medium px-4 py-2 border rounded-lg transition-colors",
                  s.value === "rejected"
                    ? "border-red-100 text-red-500 hover:bg-red-50"
                    : s.value === "accepted"
                    ? "border-green-200 text-green-700 hover:bg-green-50"
                    : "border-neutral-150 text-[#0a0a0a] hover:border-neutral-300 hover:bg-neutral-50",
                ].join(" ")}
              >
                Mark as {s.label}
              </button>
            ))}
          </form>
        </section>
      </div>
    </div>
  );
}
