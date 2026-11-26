import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABELS, type Project } from "@/lib/projects";

/**
 * Spotlight row at the top of the portfolio. Shows projects the admin has
 * marked as featured; if none are marked, falls back to the latest work.
 */
export default function PortfolioFeatured({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.featured);
  const list = (featured.length > 0 ? featured : projects).slice(0, 3);
  if (list.length === 0) return null;

  const [lead, ...rest] = list;

  return (
    <section className="section pb-0" aria-labelledby="portfolio-featured-title">
      <div className="text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          {featured.length > 0 ? "FEATURED WORK" : "LATEST WORK"}
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="portfolio-featured-title" className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          In the <span className="text-gold">spotlight</span>
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SpotlightCard project={lead} large />
        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {rest.map((p) => (
              <SpotlightCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SpotlightCard({ project, large = false }: { project: Project; large?: boolean }) {
  const techs = (project.technologies ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <Link
      href={`/portfolio/${project.id}`}
      className={`rgb-box group relative block overflow-hidden rounded-xl ${large ? "lg:col-span-2" : ""}`}
    >
      <div className={`relative overflow-hidden ${large ? "aspect-[16/10]" : "aspect-[16/9]"}`}>
        {project.images && project.images.length > 0 ? (
          <Image
            src={project.images[0]}
            alt={`${project.title} — ${CATEGORY_LABELS[project.category]} project by Bahu Technology`}
            fill
            sizes={large ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 1024px) 100vw, 33vw"}
            quality={75}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${project.color}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className="rounded-md bg-gradient-to-r from-sky-500 to-violet-500 px-3 py-1 text-[10px] font-bold tracking-wider text-white">
            {CATEGORY_LABELS[project.category].toUpperCase()}
          </span>
          <h3 className={`mt-3 font-display font-semibold text-white ${large ? "text-2xl" : "text-lg"}`}>{project.title}</h3>
          {project.client && <p className="mt-1 text-xs text-white/70">for {project.client}</p>}
          {techs.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {techs.map((t) => (
                <li key={t} className="rounded-md border border-white/30 bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Link>
  );
}
