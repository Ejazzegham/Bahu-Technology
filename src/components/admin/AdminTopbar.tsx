"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export default function AdminTopbar({
  title = "Dashboard",
  email,
  unreadCount = 0,
  onOpenMobile,
}: {
  title?: string;
  email?: string | null;
  unreadCount?: number;
  onOpenMobile?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/60 bg-white/70 px-6 py-3.5 shadow-[0_8px_24px_-18px_rgba(30,41,110,0.35)] backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobile}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow lg:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
        <div>
          <h1 className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 bg-clip-text font-display text-lg font-bold text-transparent">{title}</h1>
          <p className="text-[11px] text-muted">
            Home <span className="mx-1">›</span> {title}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/messages")}
          aria-label="Go to messages"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-500 transition hover:bg-amber-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 01-3.4 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-orange-400 text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-violet-500 to-blue-500 text-xs font-bold text-white ring-2 ring-white shadow">
              {(email ?? "A").charAt(0).toUpperCase()}
            </span>
            <div className="hidden text-left sm:block">
              <p className="max-w-[160px] truncate text-xs font-semibold text-ink">{email ?? "Admin"}</p>
              <p className="text-[10px] font-semibold text-violet-500">Administrator</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 w-40 rounded-lg border border-line bg-white py-1 shadow-xl">
              <button
                onClick={() => signOut(getFirebaseAuth())}
                className="block w-full px-4 py-2 text-left text-xs text-muted hover:bg-rose-50 hover:text-rose-500"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
