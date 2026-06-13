import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getInquiries(status: string): Promise<any[]> {
  const supabase = await createClient();

  let query = supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching inquiries:", error);
    return [];
  }
  return data ?? [];
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "unread" } = await searchParams;
  const inquiries = await getInquiries(status);

  // ── Server Action: Quick Status Toggles ──
  async function updateStatus(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const newStatus = formData.get("status") as string;

    const { createClient: createServerClient } = await import("@/lib/supabase/server");
    const supabase = await createServerClient();
    
    await supabase
      .from("contact_messages")
      .update({ status: newStatus })
      .eq("id", id);

    revalidatePath("/admin/inquiries");
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-space text-2xl font-medium text-[#0a0a0a] tracking-tight">
          Inquiries & Messages
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Manage general support inquiries and guest contact form submissions.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { label: "Unread", value: "unread" },
          { label: "Read", value: "read" },
          { label: "Archived", value: "archived" },
          { label: "All Messages", value: "all" },
        ].map((tab) => (
          <a
            key={tab.value}
            href={tab.value === "unread" ? "/admin/inquiries" : `/admin/inquiries?status=${tab.value}`}
            className={[
              "text-[12px] font-medium px-4 py-1.5 rounded-full border transition-colors",
              status === tab.value
                ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300 hover:text-[#0a0a0a]",
            ].join(" ")}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Inbox List */}
      {inquiries.length === 0 ? (
        <div className="border border-dashed border-neutral-200 rounded-xl p-16 text-center">
          <p className="text-sm text-neutral-400">No messages found in this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className={[
                "border rounded-xl p-5 bg-white transition-all",
                inquiry.status === "unread" ? "border-neutral-400 shadow-sm" : "border-neutral-150",
              ].join(" ")}
            >
              {/* Header Grid */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-150 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-[#0a0a0a]">
                      {inquiry.name}
                    </span>
                    {inquiry.status === "unread" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">
                    <a href={`mailto:${inquiry.email}`} className="hover:underline">
                      {inquiry.email}
                    </a>
                    {inquiry.phone && <span className="text-neutral-300"> · </span>}
                    {inquiry.phone && <span>{inquiry.phone}</span>}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-neutral-400">
                    {new Date(inquiry.created_at).toLocaleDateString("en-NP", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Subject & Message Body */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#0a0a0a]">
                  Subject: <span className="font-normal text-neutral-600">{inquiry.subject || "No Subject"}</span>
                </p>
                <div className="bg-neutral-50 border border-neutral-150 rounded-lg p-4">
                  <p className="text-xs text-neutral-700 whitespace-pre-wrap leading-relaxed">
                    {inquiry.message}
                  </p>
                </div>
              </div>

              {/* Action Buttons using native forms calling Server Action */}
              <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-neutral-100">
                {inquiry.status === "unread" && (
                  <form action={updateStatus}>
                    <input type="hidden" name="id" value={inquiry.id} />
                    <input type="hidden" name="status" value="read" />
                    <button
                      type="submit"
                      className="text-[11px] font-semibold px-3 py-1.5 border border-neutral-200 hover:border-neutral-800 text-[#0a0a0a] rounded-lg transition-colors"
                    >
                      Mark as Read
                    </button>
                  </form>
                )}

                {inquiry.status === "read" && (
                  <form action={updateStatus}>
                    <input type="hidden" name="id" value={inquiry.id} />
                    <input type="hidden" name="status" value="unread" />
                    <button
                      type="submit"
                      className="text-[11px] font-semibold px-3 py-1.5 border border-neutral-200 hover:border-neutral-800 text-neutral-500 hover:text-[#0a0a0a] rounded-lg transition-colors"
                    >
                      Mark as Unread
                    </button>
                  </form>
                )}

                {inquiry.status !== "archived" ? (
                  <form action={updateStatus}>
                    <input type="hidden" name="id" value={inquiry.id} />
                    <input type="hidden" name="status" value="archived" />
                    <button
                      type="submit"
                      className="text-[11px] font-semibold px-3 py-1.5 border border-neutral-200 hover:border-red-300 text-neutral-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                      Archive Message
                    </button>
                  </form>
                ) : (
                  <form action={updateStatus}>
                    <input type="hidden" name="id" value={inquiry.id} />
                    <input type="hidden" name="status" value="unread" />
                    <button
                      type="submit"
                      className="text-[11px] font-semibold px-3 py-1.5 border border-neutral-200 hover:border-neutral-800 text-neutral-400 hover:text-[#0a0a0a] rounded-lg transition-colors"
                    >
                      Unarchive (Send to Unread)
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}