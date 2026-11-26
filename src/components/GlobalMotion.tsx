"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Site-wide "live" motion layer. Mounted once in the root layout so every
 * public page gets it automatically:
 *  - a thin scroll-progress bar at the top of the screen
 *  - scroll-reveal (fade / rise / zoom, staggered) for headings, cards and
 *    boxes as they enter the viewport — including cards that load later
 *    from Firestore
 *  - a mouse-follow spotlight on every .card
 * Elements already on screen at load are never hidden (no flash), and
 * everything is skipped when the visitor prefers reduced motion.
 */

const TARGETS = [
  "main .card",
  "main .rgb-box",
  "main .glow-card",
  "main .portfolio-card",
  "main .step-item",
  "main .reveal-item",
  "main h2",
  "main details",
  "main section > div > p",
  "main form",
  "main figure",
  "main .grid > a",
  "main .grid > li",
  "footer .grid > div",
].join(",");

const SKIP_PATHS = ["/admin", "/login"];

export default function GlobalMotion() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const skip = SKIP_PATHS.some((p) => pathname?.startsWith(p));

  // Scroll progress bar
  useEffect(() => {
    if (skip) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      // Hero artwork drifts slower than the page for a sense of depth.
      if (window.scrollY < window.innerHeight * 1.2) {
        document.documentElement.style.setProperty(
          "--hero-py",
          String(Math.round(window.scrollY * 0.18))
        );
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname, skip]);

  // Card spotlight (follows the cursor)
  useEffect(() => {
    if (skip) return;
    if (window.matchMedia("(hover: none)").matches) return;
    const onMove = (e: MouseEvent) => {
      const card = (e.target as HTMLElement | null)?.closest?.(".card") as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("mousemove", onMove, { passive: true });
    return () => document.removeEventListener("mousemove", onMove);
  }, [skip]);

  // Cursor glow (eased follow) + magnetic buttons
  useEffect(() => {
    if (skip) return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const glow = glowRef.current;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;
    let raf = 0;

    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      if (glow) glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const MAGNETIC = ".btn-primary, .nav-cta";
    let magnet: HTMLElement | null = null;

    const reset = (el: HTMLElement) => {
      el.style.translate = "";
    };

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      glow?.classList.add("is-on");

      const el = (e.target as HTMLElement | null)?.closest?.(MAGNETIC) as HTMLElement | null;
      if (magnet && magnet !== el) {
        reset(magnet);
        magnet = null;
      }
      if (!el) return;
      magnet = el;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.translate = `${(dx * 8).toFixed(1)}px ${(dy * 6).toFixed(1)}px`;
    };
    const onLeave = () => {
      glow?.classList.remove("is-on");
      if (magnet) {
        reset(magnet);
        magnet = null;
      }
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      if (magnet) reset(magnet);
    };
  }, [skip]);

  // Scroll reveal
  useEffect(() => {
    if (skip) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timers: number[] = [];

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          el.setAttribute("data-reveal", "in");
          // Hand the element back to its normal hover styles afterwards.
          timers.push(
            window.setTimeout(() => {
              el.removeAttribute("data-reveal");
              el.style.removeProperty("--rd");
            }, 1500)
          );
        }
      },
      { threshold: 0, rootMargin: "0px 0px -6% 0px" }
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
        if (el.hasAttribute("data-motion-seen")) return;
        el.setAttribute("data-motion-seen", "");

        // Skip page heroes (they have their own entrance) and nested targets.
        if (el.closest("main > :first-child")) return;
        if (el.closest("[data-no-reveal]")) return;
        if (el.parentElement?.closest(TARGETS)) return;

        const rect = el.getBoundingClientRect();
        // Already on screen, or already scrolled past: never hide it.
        if (rect.top < window.innerHeight * 0.92) return;

        const siblings = el.parentElement
          ? Array.from(el.parentElement.children).filter((c) => c.matches(TARGETS))
          : [];
        const idx = Math.max(0, siblings.indexOf(el));
        el.style.setProperty("--rd", `${Math.min(idx, 6) * 90}ms`);
        el.setAttribute(
          "data-reveal",
          el.matches(".card, .rgb-box, .glow-card, .portfolio-card") ? "zoom" : "up"
        );
        io.observe(el);
      });
    };

    scan();
    let raf = 0;
    const mo = new MutationObserver(() => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Safety net: anything still hidden after a few seconds while it is on
    // screen (or above it) is shown, so a section can never stay blank.
    const failsafe = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (el.getAttribute("data-reveal") === "in") return;
        if (el.getBoundingClientRect().top < window.innerHeight) {
          io.unobserve(el);
          el.setAttribute("data-reveal", "in");
        }
      });
    }, 3000);
    timers.push(failsafe);

    return () => {
      io.disconnect();
      mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
      // Reset every element this run touched. Without this, React's dev
      // double-run of effects (and route changes) left sections marked as
      // "seen" but no longer observed, so they stayed invisible forever.
      document.querySelectorAll<HTMLElement>("[data-motion-seen]").forEach((el) => {
        el.removeAttribute("data-motion-seen");
        el.removeAttribute("data-reveal");
        el.style.removeProperty("--rd");
      });
    };
  }, [pathname, skip]);

  if (skip) return null;

  return (
    <>
      <div ref={glowRef} aria-hidden className="cursor-glow" />
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px]">
        <div
          ref={barRef}
          className="h-full origin-left bg-gradient-to-r from-[#5b9dff] via-[#1477f5] to-[#c14dff]"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </>
  );
}
