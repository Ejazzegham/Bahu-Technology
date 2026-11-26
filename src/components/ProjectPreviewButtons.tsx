"use client";

import { useState } from "react";
import type { Project } from "@/lib/projects";
import ProjectPreviewModal, { safeUrl, type PreviewTab } from "@/components/ProjectPreviewModal";

/** "Watch video" / "Live demo" buttons for the project detail page. */
export default function ProjectPreviewButtons({ project }: { project: Project }) {
  const [tab, setTab] = useState<PreviewTab | null>(null);
  const video = safeUrl(project.videoUrl);
  const demo = safeUrl(project.demoUrl) ?? safeUrl(project.link);
  if (!video && !demo) return null;

  return (
    <>
      {video && (
        <button type="button" onClick={() => setTab("video")} className="btn-outline mt-5">
          <span aria-hidden>▶</span> Watch video
        </button>
      )}
      {demo && (
        <button type="button" onClick={() => setTab("demo")} className="btn-outline mt-5">
          <span aria-hidden>◉</span> Live demo
        </button>
      )}
      {tab && <ProjectPreviewModal project={project} initialTab={tab} onClose={() => setTab(null)} />}
    </>
  );
}
