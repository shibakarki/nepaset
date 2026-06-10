import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type CustomRequest = {
  id: string;
  user_id: string;
  status: string;
  total: number;
  custom_request: string | null;
  created_at: string;
  shipping_address: { name: string; phone: string };
  profiles?: { full_name: string | null; email: string | null }[];
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-amber-50 text-amber-800 border-amber-200",
  reviewing: "bg-blue-50 text-blue-800 border-blue-200",
  quoted: "bg-purple-50 text-purple-800 border-purple-200",
  accepted: "bg-green-50 text-green-800 border-green-200",
  rejected: "bg-red-50 text-red-800 border-red-200",
};

async function getCustomRequests(): Promise<CustomRequest[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select("id, user_id, status, total, custom_request, created_at, shipping_address, profiles(full_name, email)")
    .not("custom_request", "is", null)
    .order("created_at", { ascending: false });

  return (data ?? []) as CustomRequest[];
}

export default async function CustomRequestsPage() {
  const requests = await getCustomRequests();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-space text-2xl font-medium text-[#0a0a0a] tracking-tight">
          Custom Requests
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          {requests.length} {requests.length === 1 ? "request" : "requests"} received
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="border border-dashed border-neutral-200 rounded-xl p-16 text-center">
          <p className="text-sm text-neutral-400">No custom requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Link
              key={req.id}
              href={`/admin/custom-requests/${req.id}`}
              className="block border border-neutral-150 rounded-xl p-5 hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-medium text-[#0a0a0a]">
                      #{req.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={[
                        "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                        STATUS_COLORS[req.status] ?? "bg-neutral-50 text-neutral-500 border-neutral-150",
                      ].join(" ")}
                    >
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#0a0a0a] mb-1">
                    {req.profiles?.[0]?.full_name ?? req.shipping_address?.name ?? "Unknown"}
                  </p>
                  {req.profiles?.[0]?.email && (
                    <p className="text-xs text-neutral-400 mb-2">{req.profiles[0].email}</p>
                  )}
                  {req.custom_request && (
                    <p className="text-xs text-neutral-500 line-clamp-2 max-w-lg">
                      {req.custom_request}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-neutral-400">
                    {new Date(req.created_at).toLocaleDateString("en-NP", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">View →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
