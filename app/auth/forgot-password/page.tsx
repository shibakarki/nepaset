"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
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

        {sent ? (
          // Success state
          <div>
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h1 className="font-space text-2xl font-medium text-[#0a0a0a] tracking-tight mb-2">
              Check your email
            </h1>
            <p className="text-sm text-neutral-400 mb-8">
              We sent a password reset link to{" "}
              <span className="text-[#0a0a0a]">{email}</span>. Click the link
              in the email to reset your password.
            </p>
            <Link
              href="/auth/login"
              className="text-xs text-neutral-400 hover:text-[#0a0a0a] transition-colors"
            >
              ← Back to login
            </Link>
          </div>
        ) : (
          // Form state
          <>
            <h1 className="font-space text-2xl font-medium text-[#0a0a0a] tracking-tight mb-2">
              Forgot password?
            </h1>
            <p className="text-sm text-neutral-400 mb-8">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
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
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="mt-6 text-xs text-neutral-400">
              Remember it?{" "}
              <Link
                href="/auth/login"
                className="text-[#0a0a0a] font-medium hover:underline"
              >
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}