"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

// Sign-in only, on purpose — there is no "create account" option here.
// This admin panel is meant for a single owner account. If you ever need a
// second admin, add their email to ADMIN_EMAILS in firestore.rules /
// storage.rules and create their Firebase Auth user from the Firebase
// console (Authentication → Users → Add user), not from this page.
export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isFirebaseConfigured) {
      setError("Firebase isn't configured. Add your keys to .env.local first.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
        setError("Incorrect email or password.");
      } else if (code.includes("too-many-requests")) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (code.includes("operation-not-allowed")) {
        setError(
          "Email/Password sign-in isn't enabled for this Firebase project yet. Go to Firebase console → Authentication → Sign-in method → enable Email/Password."
        );
      } else if (code.includes("invalid-email")) {
        setError("That doesn't look like a valid email address.");
      } else {
        setError(`Something went wrong${code ? ` (${code})` : ""}. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-white to-bg-soft px-6">
      {/* Soft brand glow behind the card — subtle, keeps the page light */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl"
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-[0_8px_40px_-12px_rgba(13,13,16,0.15)] sm:p-10">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo/bahu_logo_1024x1024.png"
            alt="Bahu Technology"
            width={112}
            height={112}
            priority
            className="h-24 w-24 object-contain sm:h-28 sm:w-28"
          />
          <h1 className="mt-5 font-display text-xl font-bold text-ink">Admin Sign In</h1>
          <p className="mt-1 text-xs text-muted">Sign in to manage your website.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-xs font-semibold text-ink">
              Email address
            </label>
            <input
              id="admin-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-ink focus:outline-none focus:ring-4 focus:ring-ink/5"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold text-ink">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-line bg-white px-4 py-2.5 pr-11 text-sm text-ink placeholder:text-muted/60 focus:border-ink focus:outline-none focus:ring-4 focus:ring-ink/5"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/60 transition hover:text-ink"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border-2 border-ink bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Please wait…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
