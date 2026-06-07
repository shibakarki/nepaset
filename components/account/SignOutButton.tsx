"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs font-medium px-4 py-2 border border-neutral-150 rounded-lg text-neutral-500 hover:border-neutral-300 hover:text-[#0a0a0a] transition-colors"
    >
      Sign out
    </button>
  );
}