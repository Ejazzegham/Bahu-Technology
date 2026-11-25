"use client";

import { useEffect, useState } from "react";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { DEFAULT_SETTINGS, subscribeSettings } from "@/lib/firestore/settings";

// Standard schedule, evaluated in Pakistan time regardless of visitor location.
const HOURS: Record<string, [number, number] | null> = {
  Mon: [9, 18], Tue: [9, 18], Wed: [9, 18], Thu: [9, 18], Fri: [9, 18],
  Sat: [10, 14], Sun: null,
};

function useOpenNow() {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    const check = () => {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Karachi", weekday: "short", hour: "numeric", hour12: false,
      }).formatToParts(new Date());
      const day = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
      const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
      const range = HOURS[day];
      setOpen(!!range && hour >= range[0] && hour < range[1]);
    };
    check();
    const t = setInterval(check, 60_000);
    return () => clearInterval(t);
  }, []);
  return open;
}

export default function ContactQuickActions() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [copied, setCopied] = useState(false);
  const open = useOpenNow();

  useEffect(() => {
    const unsub = subscribeSettings(setSettings);
    return () => unsub?.();
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(settings.contactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const wa = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessage)}`;
  const card = "rgb-box flex flex-col rounded-xl p-6";
  const fill = { ["--box-fill" as string]: "#ffffff" };

  return (
    <section className="section pb-0" aria-label="Quick ways to reach us">
      <div className="mb-6 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-xs font-semibold text-ink" aria-live="polite">
          <span className={`h-2 w-2 rounded-full ${open === null ? "bg-muted/40" : open ? "bg-emerald-500" : "bg-amber-500"}`} />
          {open === null ? "Checking availability…" : open ? "We're online now — replies within the hour" : "We're offline — we'll reply next working day"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className={card} style={fill}>
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white"><Phone size={20} strokeWidth={1.8} /></span>
          <h3 className="font-display text-base font-semibold text-ink">Call us</h3>
          <p className="mt-1 text-sm text-muted">{settings.contactPhone}</p>
          <a href={`tel:${settings.contactPhone.replace(/\s/g, "")}`} className="btn-outline mt-5 justify-center">CALL NOW</a>
        </div>
        <div className={card} style={fill}>
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white"><Mail size={20} strokeWidth={1.8} /></span>
          <h3 className="font-display text-base font-semibold text-ink">Email us</h3>
          <p className="mt-1 break-all text-sm text-muted">{settings.contactEmail}</p>
          <div className="mt-5 flex gap-3">
            <a href={`mailto:${settings.contactEmail}`} className="btn-outline flex-1 justify-center">EMAIL</a>
            <button type="button" onClick={copyEmail} className="btn-outline flex-1 justify-center">
              {copied ? "COPIED ✓" : "COPY"}
            </button>
          </div>
        </div>
        <div className={card} style={fill}>
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white"><MessageCircle size={20} strokeWidth={1.8} /></span>
          <h3 className="font-display text-base font-semibold text-ink">WhatsApp</h3>
          <p className="mt-1 text-sm text-muted">Fastest way to share files and ideas.</p>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 justify-center">CHAT NOW</a>
        </div>
      </div>
    </section>
  );
}
