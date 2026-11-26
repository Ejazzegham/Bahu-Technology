"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABELS, type Project } from "@/lib/projects";
import ProjectReactions from "@/components/ProjectReactions";
import { isDirectVideo, safeUrl, type PreviewTab } from "@/components/ProjectPreviewModal";

/**
 * One portfolio card. The "Video" / "Live demo" buttons sit in an overlay that is a
 * SIBLING of the card link (not inside it) so we never nest a button inside an <a>.
 * A direct video file (.mp4/.webm) also autoplays muted while the card is hovered.
 */
export default function ProjectCard({
  project,
  view,
  onPreview,
}: {
  project: Project;
  view: "grid" | "list";
  onPreview: (p: Project, tab: PreviewTab) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const video = safeUrl(project.videoUrl);
  const demo = safeUrl(project.demoUrl) ?? safeUrl(project.link);
  const hoverVideo = isDirectVideo(video ?? undefined) ? video : null;

  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  };
  const stop = () => videoRef.current?.pause();

  return (
    <div
      className="portfolio-card group relative"
      onMouseEnter={hoverVideo ? play : undefined}
      onMouseLeave={hoverVideo ? stop : undefined}
      onFocus={hoverVideo ? play : undefined}
      onBlur={hoverVideo ? stop : undefined}
    >
      <Link href={`/portfolio/${project.id}`} className="block">
        <div className="portfolio-card-inner border border-line">
          <div className="relative aspect-[4/3] overflow-hidden">
            {project.images && project.images.length > 0 ? (
              <Image
                src={project.images[0]}
                alt={`${project.title} — ${CATEGORY_LABELS[project.category]} project by Bahu Technology`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={70}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${project.color}`}>
                <span className="font-display text-sm font-medium tracking-wide text-white/25">
                  {CATEGORY_LABELS[project.category]}
                </span>
              </div>
            )}

            {hoverVideo && (
              <video
                ref={videoRef}
                src={hoverVideo}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
              />
            )}

            {project.featured && (
              <span className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white">
                FEATURED
              </span>
            )}
            {project.caseStudy && (
              <span className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white">
                CASE STUDY
              </span>
            )}
            {project.images && project.images.length > 1 && !(video || demo) && (
              <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
                {project.images.length} photos
              </span>
            )}
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h3 className="font-display text-sm font-semibold text-gold">{project.title}</h3>
              <p className="text-xs text-muted">
                {CATEGORY_LABELS[project.category]}
                {project.status === "In Progress" && <span className="ml-2 font-semibold text-amber-600">· In progress</span>}
              </p>
              {view === "list" && project.description && (
                <p className="mt-2 line-clamp-2 text-xs text-muted">{project.description}</p>
              )}
            </div>
            <span aria-hidden className="text-gold transition-transform group-hover:translate-x-1">
              →
            </span>
          </div>
          <div className="px-5 pb-4">
            <ProjectReactions
              projectId={project.id}
              initialLikes={project.likeCount}
              initialFavorites={project.favoriteCount}
              size="sm"
            />
          </div>
        </div>
      </Link>

      {(video || demo) && (
        <div className="pointer-events-none absolute inset-x-[4px] top-[4px] z-10 aspect-[4/3]">
          <div className="pointer-events-auto absolute bottom-2 left-2 flex gap-1.5">
            {video && (
              <button
                type="button"
                onClick={() => onPreview(project, "video")}
                className="inline-flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur transition-colors hover:bg-gold"
              >
                <span aria-hidden>▶</span> Video
              </button>
            )}
            {demo && (
              <button
                type="button"
                onClick={() => onPreview(project, "demo")}
                className="inline-flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur transition-colors hover:bg-gold"
              >
                <span aria-hidden>◉</span> Live demo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
