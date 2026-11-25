import Image from "next/image";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/firestore/blog";

export default async function LatestPosts() {
  const posts = (await getPublishedPosts()).slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section id="latest-posts" className="section">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
            <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
            FROM THE BLOG
            <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Latest Insights
          </h2>
        </div>
        <Link href="/blog" className="btn-outline">
          READ THE BLOG <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="rgb-box group block overflow-hidden rounded-xl bg-bg-card">
            <div className="relative aspect-[16/10] overflow-hidden bg-bg-soft">
              {post.coverImageUrl && (
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <div className="p-5">
              {post.tags[0] && (
                <span className="text-[10px] font-semibold tracking-[0.2em] text-gold">
                  {post.tags[0].toUpperCase()}
                </span>
              )}
              <h3 className="mt-2 font-display text-base font-semibold text-ink group-hover:text-gold">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
              )}
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gold">
                READ MORE <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
