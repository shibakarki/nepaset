"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/account");
    }, 2000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <Link href="/" className="block mb-10">
          <span className="font-space text-lg font-medium text-[#0a0a0a] tracking-tight">
            NEPASET<span className="text-neutral-300">•</span>
          </span>
        </Link>

        {done ? (
          <div>
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="font-space text-2xl font-medium text-[#0a0a0a] tracking-tight mb-2">
              Password updated
            </h1>
            <p className="text-sm text-neutral-400">
              Redirecting you to your account…
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-space text-2xl font-medium text-[#0a0a0a] tracking-tight mb-2">
              Reset password
            </h1>
            <p className="text-sm text-neutral-400 mb-8">
              Enter your new password below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1.5">
                  New password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 6 characters"
                  className="w-full border border-neutral-150 rounded-lg px-3 py-2.5 text-sm text-[#0a0a0a] focus:outline-none focus:border-neutral-300"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-500 mb-1.5">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Repeat your password"
                  className="w-full border border-neutral-150 rounded-lg px-3 py-2.5 text-sm text-[#0a0a0a] focus:outline-none focus:border-neutral-300"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}