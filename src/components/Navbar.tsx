"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import LetsTalkButton from "./LetsTalkButton";
import { DEFAULT_SETTINGS, subscribeSettings } from "@/lib/firestore/settings";
import { useCustomerAuth } from "@/lib/use-customer-auth";

const HOME_LINK = {
  label: "Home",
  href: "/",
  icon: <path d="M3 11.5L12 4l9 7.5M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" />,
};

const NAV_LINKS = [
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: <path d="M3 7h18v13H3zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />,
  },
  {
    label: "Pricing",
    href: "/pricing",
    icon: <path d="M20.6 12.3L12.7 20.2a2 2 0 01-2.8 0L3 13.3V4h9.3l8.3 8.3a2 2 0 010 2.8zM7 8h.01" />,
  },
  {
    label: "About",
    href: "/about",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 16v-4.5M12 8h.01" strokeLinecap="round" />
      </>
    ),
  },
  {
    label: "Blog",
    href: "/blog",
    icon: <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" />,
  },
  {
    label: "Contact",
    href: "/contact",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </>
    ),
  },
];

const SERVICES = [
  {
    label: "Graphic Design",
    desc: "Logos, branding & visuals",
    href: "/graphic-design",
    icon: (
      <>
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <path d="M4 20c0-3.3 2.7-6 6-6M20 20c0-3.3-2.7-6-6-6" />
      </>
    ),
  },
  {
    label: "Web Design",
    desc: "Websites that convert",
    href: "/web-development",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M3 9h18M8 20h8" />
      </>
    ),
  },
  {
    label: "Mobile App Design",
    desc: "iOS & Android apps",
    href: "/mobile-app-development",
    icon: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2" />
        <path d="M11 18.5h2" strokeLinecap="round" />
      </>
    ),
  },
  {
    label: "Desktop App Design",
    desc: "Windows & Mac software",
    href: "/desktop-software",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="1.5" />
        <path d="M8 20h8M12 16v4" />
      </>
    ),
  },
];

function NavLinkIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}


/** Desktop order: Home, Services (mega menu), then the remaining links. */
const DESKTOP_ITEMS: { label: string; href?: string }[] = [
  { label: HOME_LINK.label, href: HOME_LINK.href },
  { label: "Services" },
  ...NAV_LINKS.map((l) => ({ label: l.label, href: l.href })),
];

export default function Navbar({ active = "Home" }: { active?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const { user } = useCustomerAuth();
  const accountHref = user ? "/account" : "/login";
  const isServicesActive = active === "Services";

  // Scroll-aware header: glass + compact once scrolled, tucks away when
  // scrolling down and returns the moment the visitor scrolls up.
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // Services mega menu (hover-intent on desktop, click / keyboard friendly).
  const [servicesOpen, setServicesOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const openServices = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setServicesOpen(true);
  }, []);
  const closeServices = useCallback((delay = 140) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setServicesOpen(false), delay);
  }, []);

  // Sliding highlight that glides between links.
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [hovered, setHovered] = useState<string | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number; show: boolean }>({
    left: 0,
    width: 0,
    show: false,
  });
  const target = hovered ?? (DESKTOP_ITEMS.some((i) => i.label === active) ? active : null);

  const measure = useCallback(() => {
    const el = target ? itemRefs.current[target] : null;
    if (!el) {
      setPill((p) => (p.show ? { ...p, show: false } : p));
      return;
    }
    setPill({ left: el.offsetLeft, width: el.offsetWidth, show: true });
  }, [target]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    // Fonts swapping in can change link widths after first paint.
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const unsub = subscribeSettings(setSettings);
    return () => unsub?.();
  }, []);

  useEffect(() => {
    lastY.current = window.scrollY;
    setScrolled(window.scrollY > 12);
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        setScrolled(y > 12);
        if (y > 260 && y > lastY.current + 6) setHidden(true);
        else if (y < lastY.current - 6 || y <= 260) setHidden(false);
        lastY.current = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Never leave the header hidden while a menu is open.
  useEffect(() => {
    if (servicesOpen || open) setHidden(false);
  }, [servicesOpen, open]);

  useEffect(() => {
    if (!servicesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setServicesOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      const el = itemRefs.current["Services"];
      if (el && !el.contains(e.target as Node)) setServicesOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [servicesOpen]);

  // Lock page scroll behind the drawer while it's open, and let Escape
  // close it — small touches that make it feel like a real app menu.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const linkClass = (label: string) =>
    `nav-link ${label === active ? "is-active" : ""}`;

  return (
    <header
      className={`site-header sticky top-0 z-50 ${scrolled ? "is-scrolled" : ""} ${
        hidden ? "is-hidden" : ""
      }`}
    >
      <div className="site-header-inner mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/" className="nav-logo group flex items-center gap-2.5" aria-label="Bahu Technology — home">
          <span className="nav-logo-mark">
            <Image
              src={settings.appearance.logoUrl}
              alt="Bahu Technology"
              width={40}
              height={40}
              className="nav-logo-img object-contain"
              priority
            />
          </span>
          <span className="font-display text-sm font-semibold leading-tight tracking-wide text-ink">
            BAHU
            <span className="block text-[10px] font-medium tracking-[0.3em] text-muted transition-colors duration-300 group-hover:text-gold">
              TECHNOLOGY
            </span>
          </span>
        </Link>

        <nav
          ref={navRef}
          className="nav-rail relative hidden items-center lg:flex"
          onMouseLeave={() => setHovered(null)}
          aria-label="Primary"
        >
          {/* gliding highlight */}
          <span
            aria-hidden
            className="nav-pill"
            style={{
              width: pill.width,
              transform: `translateX(${pill.left}px)`,
              opacity: pill.show ? 1 : 0,
            }}
          />

          {DESKTOP_ITEMS.map((item) =>
            item.label === "Services" ? (
              <div
                key="Services"
                ref={(el) => {
                  itemRefs.current["Services"] = el;
                }}
                className="relative"
                onMouseEnter={() => {
                  setHovered("Services");
                  openServices();
                }}
                onMouseLeave={() => closeServices()}
                onFocus={() => {
                  setHovered("Services");
                  openServices();
                }}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) closeServices(60);
                }}
              >
                <button
                  type="button"
                  onClick={() => setServicesOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={servicesOpen}
                  className={`${linkClass("Services")} ${isServicesActive ? "is-active" : ""}`}
                >
                  Services
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-300 ${servicesOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {servicesOpen && (
                  <div className="nav-mega-wrap" role="presentation">
                    <div className="nav-mega" role="menu" aria-label="Services">
                      <p className="nav-mega-eyebrow">What we build</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {SERVICES.map((service, i) => (
                          <Link
                            key={service.label}
                            href={service.href}
                            role="menuitem"
                            onClick={() => setServicesOpen(false)}
                            className="nav-mega-item"
                            style={{ animationDelay: `${0.04 + i * 0.05}s` }}
                          >
                            <span className="nav-mega-tile">
                              <NavLinkIcon>{service.icon}</NavLinkIcon>
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[13px] font-semibold leading-tight text-ink">
                                {service.label}
                              </span>
                              <span className="mt-1 block text-[11px] leading-snug text-muted">
                                {service.desc}
                              </span>
                            </span>
                          </Link>
                        ))}
                      </div>
                      <Link
                        href="/contact"
                        onClick={() => setServicesOpen(false)}
                        className="nav-mega-foot"
                      >
                        <span>Need something custom? Tell us about it</span>
                        <span aria-hidden className="nav-mega-foot-arrow">→</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                key={item.label}
                ref={(el) => {
                  itemRefs.current[item.label] = el;
                }}
                onMouseEnter={() => {
                  setHovered(item.label);
                  closeServices(0);
                }}
                onFocus={() => setHovered(item.label)}
                onBlur={() => setHovered(null)}
              >
                <Link
                  href={item.href!}
                  className={linkClass(item.label)}
                  aria-current={item.label === active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </div>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href={accountHref} aria-label="My Account" className="nav-account">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
            </svg>
          </Link>
          <LetsTalkButton triggerClassName="nav-cta" />
        </div>

        <button
          className="nav-burger lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <span aria-hidden className="nav-burger-lines">
            <i />
            <i />
            <i />
          </span>
        </button>
      </div>

      {/* hairline accent that fades in once the page is scrolled */}
      <span aria-hidden className="site-header-line" />

      {/* Mobile drawer — rendered through a portal straight into
          document.body, so it's always the true top-most layer covering
          the whole screen, regardless of where Navbar sits in the page. */}
      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="mobile-nav-overlay absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="mobile-nav-panel absolute inset-y-0 right-0 flex w-[82%] max-w-sm flex-col border-l border-gold/15 bg-bg-soft shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <Image
                  src={settings.appearance.logoUrl}
                  alt="Bahu Technology"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                <span className="font-display text-sm font-semibold text-ink">
                  BAHU
                  <span className="block text-[9px] font-medium tracking-[0.3em] text-muted">
                    TECHNOLOGY
                  </span>
                </span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted hover:border-gold/50 hover:text-gold"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-4 py-6">
              <Link
                href={HOME_LINK.href}
                onClick={() => setOpen(false)}
                style={{ animationDelay: "0.05s" }}
                className={`mobile-nav-item flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  HOME_LINK.label === active
                    ? "bg-gold/10 text-gold"
                    : "text-muted hover:bg-black/5 hover:text-ink"
                }`}
              >
                <NavLinkIcon>{HOME_LINK.icon}</NavLinkIcon>
                <span className="flex-1">{HOME_LINK.label}</span>
                {HOME_LINK.label === active && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />}
              </Link>

              <div className="mobile-nav-item" style={{ animationDelay: "0.1s" }}>
                <button
                  type="button"
                  onClick={() => setMobileServicesOpen((v) => !v)}
                  aria-expanded={mobileServicesOpen}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                    isServicesActive
                      ? "bg-gold/10 text-gold"
                      : "text-muted hover:bg-black/5 hover:text-ink"
                  }`}
                >
                  <NavLinkIcon>
                    <circle cx="8" cy="8" r="3" />
                    <circle cx="16" cy="8" r="3" />
                    <path d="M4 20c0-3.3 2.7-6 6-6M20 20c0-3.3-2.7-6-6-6" />
                  </NavLinkIcon>
                  <span className="flex-1 text-left">Services</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 transition-transform duration-200 ${mobileServicesOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    mobileServicesOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                  aria-hidden={!mobileServicesOpen}
                >
                  <div className="overflow-hidden">
                    <div className="mb-1 ml-7 mt-1 space-y-1 border-l-[1.5px] border-gold/25 pl-3">
                      {SERVICES.map((service) => (
                        <Link
                          key={service.label}
                          href={service.href}
                          tabIndex={mobileServicesOpen ? 0 : -1}
                          onClick={() => setOpen(false)}
                          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-gold/[0.07]"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#f2f7ff] to-[#e3eeff] text-gold shadow-[inset_0_0_0_1px_rgba(20,119,245,0.18)] transition-colors group-hover:bg-gold-gradient group-hover:text-white">
                            <NavLinkIcon>{service.icon}</NavLinkIcon>
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[13px] font-semibold leading-tight text-ink">{service.label}</span>
                            <span className="mt-0.5 block text-[11px] leading-tight text-muted">{service.desc}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {NAV_LINKS.map((link, i) => {
                const isActive = link.label === active;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    style={{ animationDelay: `${0.15 + i * 0.05}s` }}
                    className={`mobile-nav-item flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-gold/10 text-gold"
                        : "text-muted hover:bg-black/5 hover:text-ink"
                    }`}
                  >
                    <NavLinkIcon>{link.icon}</NavLinkIcon>
                    <span className="flex-1">{link.label}</span>
                    {isActive && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />}
                  </Link>
                );
              })}

              <div
                className="mobile-nav-item my-3 h-px bg-line"
                style={{ animationDelay: `${0.2 + NAV_LINKS.length * 0.05}s` }}
                aria-hidden
              />

              <Link
                href={accountHref}
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${0.25 + NAV_LINKS.length * 0.05}s` }}
                className={`mobile-nav-item flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                  active === "Account" ? "bg-gold/10 text-gold" : "text-muted hover:bg-black/5 hover:text-ink"
                }`}
              >
                <NavLinkIcon>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                </NavLinkIcon>
                <span className="flex-1">My Account</span>
              </Link>
            </nav>

            <div
              className="mobile-nav-item border-t border-line px-4 py-5"
              style={{ animationDelay: `${0.3 + NAV_LINKS.length * 0.05}s` }}
            >
              <LetsTalkButton
                variant="primary"
                wrapperClassName="w-full"
                triggerClassName="btn-primary w-full justify-center"
                align="left"
                onNavigate={() => setOpen(false)}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
