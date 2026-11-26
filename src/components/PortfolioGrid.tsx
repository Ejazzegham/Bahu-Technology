"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project, ProjectCategory } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";
import ProjectPreviewModal, { type PreviewTab } from "@/components/ProjectPreviewModal";
import Dropdown from "@/components/ui/Dropdown";

type SortKey = "newest" | "oldest" | "liked" | "az";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "liked", label: "Most liked" },
  { value: "az", label: "A to Z" },
];

const splitTechs = (p: Project) =>
  (p.technologies ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

const FILTERS: { label: string; value: ProjectCategory | "all" }[] = [
  { label: "ALL", value: "all" },
  { label: "GRAPHIC DESIGN", value: "graphic" },
  { label: "WEB DESIGN & DEVELOPMENT", value: "web" },
  { label: "MOBILE APP DESIGN & DEVELOPMENT", value: "mobile" },
  { label: "DESKTOP SOFTWARE", value: "desktop" },
];

// Projects shown per page. Page count is derived automatically from this,
// so any newly added project (however many the admin uploads) is picked up
// on the next render without touching this component.
const PAGE_SIZE = 9;

export default function PortfolioGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [tech, setTech] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [preview, setPreview] = useState<{ project: Project; tab: PreviewTab } | null>(null);

  // Project count per category, shown on the filter chips.
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    for (const p of projects) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [projects]);

  // Most-used technologies across all projects (as written by the admin).
  const topTechs = useMemo(() => {
    const tally = new Map<string, { label: string; n: number }>();
    for (const p of projects) {
      for (const t of splitTechs(p)) {
        const k = t.toLowerCase();
        const cur = tally.get(k);
        tally.set(k, { label: cur?.label ?? t, n: (cur?.n ?? 0) + 1 });
      }
    }
    return [...tally.values()].sort((a, b) => b.n - a.n).slice(0, 8).map((x) => x.label);
  }, [projects]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = filter === "all" ? projects : projects.filter((p) => p.category === filter);
    if (tech) list = list.filter((p) => splitTechs(p).some((t) => t.toLowerCase() === tech.toLowerCase()));
    if (q) {
      list = list.filter((p) =>
        [p.title, p.client, p.technologies, p.description].some((f) => f?.toLowerCase().includes(q))
      );
    }
    const sorted = [...list];
    if (sort === "oldest") sorted.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
    else if (sort === "liked") sorted.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
    else if (sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else sorted.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return sorted;
  }, [projects, filter, tech, search, sort]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));

  // Reset to page 1 whenever the filter changes, or clamp down if the
  // current page no longer exists (e.g. projects were removed).
  useEffect(() => {
    setPage(1);
  }, [filter, search, sort, tech]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return visible.slice(start, start + PAGE_SIZE);
  }, [visible, page]);

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    document.getElementById("portfolio-grid-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Compact page-number list: always show first, last, current, and its
  // immediate neighbors; collapse the rest into "…".
  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "ellipsis") {
        pages.push("ellipsis");
      }
    }
    return pages;
  }, [totalPages, page]);

  return (
    <div id="portfolio-grid-top" className="section">
      <div className="flex flex-wrap justify-center gap-3">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-md border px-4 py-2 text-xs font-semibold tracking-wide transition-colors ${
              filter === f.value
                ? "border-gold bg-gold/10 text-gold"
                : "border-line text-muted hover:border-gold/50 hover:text-gold"
            }`}
          >
            {f.label}
            <span className="ml-2 rounded-md bg-gold/10 px-1.5 py-0.5 text-[10px] text-gold">{counts[f.value] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-3xl flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search projects</span>
          <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project, client or technology"
            className="w-full rounded-md border border-line bg-white py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted/70 focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
          />
        </label>
        <div className="w-full sm:w-48">
          <Dropdown
            ariaLabel="Sort projects"
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={SORT_OPTIONS}
            className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink transition-colors hover:border-gold/60 focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
          />
        </div>
      </div>

      {topTechs.length > 0 && (
        <div className="mx-auto mt-4 flex max-w-4xl flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold text-muted">Technology:</span>
          {topTechs.map((t) => {
            const on = tech?.toLowerCase() === t.toLowerCase();
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => setTech(on ? null : t)}
                className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                  on ? "border-transparent bg-gradient-to-r from-sky-500 to-violet-500 text-white" : "border-line text-muted hover:border-gold/50 hover:text-gold"
                }`}
              >
                {t}
              </button>
            );
          })}
          {(tech || search) && (
            <button
              type="button"
              onClick={() => {
                setTech(null);
                setSearch("");
              }}
              className="text-xs font-semibold text-gold underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-4">
        <p className="text-xs text-muted" aria-live="polite">
          Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
        </p>
        <div className="inline-flex overflow-hidden rounded-md border border-line" role="group" aria-label="Layout">
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                view === v ? "bg-gold/10 text-gold" : "text-muted hover:text-gold"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className={`mt-6 grid gap-8 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"}`}>
        {paged.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            view={view}
            onPreview={(p, tab) => setPreview({ project: p, tab })}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-16 text-center text-sm text-muted">
          No projects match your filters. Try a different search or clear the filters.
        </p>
      )}

      {visible.length > 0 && totalPages > 1 && (
        <nav
          aria-label="Portfolio pagination"
          className="mt-14 flex flex-wrap items-center justify-center gap-2"
        >
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
            className="flex h-9 min-w-9 items-center justify-center rounded-md border border-line px-3 text-xs font-semibold text-muted transition-colors hover:border-gold/50 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:text-muted"
          >
            ←
          </button>

          {pageNumbers.map((p, i) =>
            p === "ellipsis" ? (
              <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => goToPage(p)}
                aria-current={p === page ? "page" : undefined}
                className={`flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-xs font-semibold transition-colors ${
                  p === page
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-line text-muted hover:border-gold/50 hover:text-gold"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
            className="flex h-9 min-w-9 items-center justify-center rounded-md border border-line px-3 text-xs font-semibold text-muted transition-colors hover:border-gold/50 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:text-muted"
          >
            →
          </button>
        </nav>
      )}
      {preview && (
        <ProjectPreviewModal project={preview.project} initialTab={preview.tab} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}
