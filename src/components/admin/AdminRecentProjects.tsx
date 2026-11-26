"use client";

import type { Project } from "@/lib/projects";
import { CATEGORY_LABELS } from "@/lib/projects";

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminRecentProjects({
  projects,
  onEdit,
  onDelete,
}: {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  const rows = projects.slice(0, 5);

  return (
    <div className="admin-card admin-card-accent p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-ink">Recent Projects</h3>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold text-violet-600">{projects.length} total</span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-center text-xs text-muted">
          No projects yet — add one from Manage Portfolio below.
        </p>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {rows.map((p, i) => (
            <li key={p.id} className="rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-3.5 text-xs transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white" style={{ background: ["#1477f5","#7c4dff","#f59e0b","#ff4d6d","#10b981"][i % 5] }}>{i + 1}</span>
                  <p className="truncate font-medium text-ink">{p.title}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    p.status === "Completed"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {p.status ?? "Completed"}
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted">
                <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-600">{CATEGORY_LABELS[p.category]}</span>
                <span className="truncate">{p.client || "—"}</span>
                <span>{formatDate(p.createdAt ?? Date.now())}</span>
              </div>

              <div className="mt-2.5 flex items-center gap-3 border-t border-line/60 pt-2.5 text-muted">
                {p.link && (
                  <a href={p.link} target="_blank" rel="noreferrer" aria-label="View" className="hover:text-blue-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </a>
                )}
                <button aria-label="Edit" onClick={() => onEdit(p)} className="hover:text-blue-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
                <button aria-label="Delete" onClick={() => onDelete(p)} className="hover:text-rose-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
