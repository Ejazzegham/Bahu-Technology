"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/projects";

export const isDirectVideo = (url?: string) => !!url && /\.(mp4|webm|ogv|mov)(\?.*)?$/i.test(url);

/** Only ever embed/open http(s) URLs — never javascript: or data: from admin-entered fields. */
export function safeUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** YouTube / Vimeo page links → embeddable player URL. Direct files and unknown hosts return null. */
function embedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}?autoplay=1&rel=0`;
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v") ?? (u.pathname.startsWith("/embed/") ? u.pathname.split("/")[2] : null);
      return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}?autoplay=1` : null;
    }
  } catch {
    /* fall through */
  }
  return null;
}

export type PreviewTab = "video" | "demo";

export default function ProjectPreviewModal({
  project,
  initialTab,
  onClose,
}: {
  project: Project;
  initialTab: PreviewTab;
  onClose: () => void;
}) {
  const video = safeUrl(project.videoUrl);
  const demo = safeUrl(project.demoUrl) ?? safeUrl(project.link);
  const [tab, setTab] = useState<PreviewTab>(initialTab === "video" && video ? "video" : demo ? "demo" : "video");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [onClose]);

  const embed = video ? embedUrl(video) : null;
  const tabs = [video && { id: "video" as const, label: "Video preview" }, demo && { id: "demo" as const, label: "Live demo" }].filter(
    Boolean
  ) as { id: PreviewTab; label: string }[];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} preview`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-semibold text-ink">{project.title}</p>
            {project.client && <p className="truncate text-[11px] text-muted">for {project.client}</p>}
          </div>
          {tabs.length > 1 && (
            <div role="tablist" className="inline-flex overflow-hidden rounded-md border border-line">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                    tab === t.id ? "bg-gold/10 text-gold" : "text-muted hover:text-gold"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close preview"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-gold hover:text-gold"
          >
            ✕
          </button>
        </div>

        <div className="relative min-h-0 flex-1 bg-black">
          {tab === "video" && video && (
            <div className="aspect-video w-full">
              {embed ? (
                <iframe
                  src={embed}
                  title={`${project.title} video`}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              ) : isDirectVideo(video) ? (
                <video src={video} controls autoPlay playsInline className="h-full w-full" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-white/80">
                  <p className="text-sm">This video can&apos;t be embedded here.</p>
                  <a href={video} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    Watch video <span aria-hidden>↗</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {tab === "demo" && demo && (
            <div className="flex h-[70vh] flex-col bg-white">
              {/* Sandboxed: the demo site can run its own scripts but can't navigate this page or read our storage. */}
              <iframe
                src={demo}
                title={`${project.title} live demo`}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                referrerPolicy="no-referrer"
                className="min-h-0 w-full flex-1 border-0"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-bg-soft px-4 py-2 text-[11px] text-muted">
                <span>Blank? Some websites don&apos;t allow being shown inside other pages.</span>
                <a href={demo} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold hover:underline">
                  Open in a new tab ↗
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
