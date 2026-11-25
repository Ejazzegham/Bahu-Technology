"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_SETTINGS, subscribeSettings } from "@/lib/firestore/settings";
import { usePopoverPosition } from "@/lib/use-popover-position";

type Props = {
  label?: string;
  variant?: "primary" | "outline";
  triggerClassName?: string;
  wrapperClassName?: string;
  align?: "left" | "right";
  onNavigate?: () => void;
};

const MENU_WIDTH = 272;

export default function LetsTalkButton({
  label = "LET'S TALK",
  variant = "primary",
  triggerClassName,
  wrapperClassName = "",
  align = "right",
  onNavigate,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Popover renders through a portal into document.body and is positioned
  // with `position: fixed` computed from the trigger's real screen
  // coordinates — this is what lets it escape a rounded CTA card's
  // `overflow: hidden`, or the mobile nav drawer's own stacking, instead of
  // getting clipped like a normal `position: absolute` child would.
  const style = usePopoverPosition(triggerRef, open, { align, width: MENU_WIDTH, estimatedHeight: 150 });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const unsub = subscribeSettings(setSettings);
    return () => unsub?.();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const baseTriggerClass = variant === "primary" ? "btn-primary" : "btn-outline";

  function close() {
    setOpen(false);
    onNavigate?.();
  }

  return (
    <div className={`relative inline-block ${wrapperClassName}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={triggerClassName ?? `${baseTriggerClass} shrink-0`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {label} <span aria-hidden>→</span>
      </button>

      {open && mounted &&
        createPortal(
          <div ref={menuRef} style={style} className="dd-panel dd-menu z-[70]" role="menu">
            <Link href="/contact" role="menuitem" onClick={close} className="dd-link">
              <span className="dd-tile">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold leading-tight">Send a Message</span>
                <span className="mt-0.5 block text-[11px] leading-tight text-muted">Use our contact form</span>
              </span>
              <svg aria-hidden className="dd-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <div className="dd-divider" aria-hidden />
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={close}
              className="dd-link dd-link--wa"
            >
              <span className="dd-tile">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold leading-tight">Chat on WhatsApp</span>
                <span className="mt-0.5 block text-[11px] leading-tight text-muted">{settings.contactPhone}</span>
              </span>
              <svg aria-hidden className="dd-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>,
          document.body
        )}
    </div>
  );
}
