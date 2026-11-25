"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type DropdownOption<T extends string | number> = {
  value: T;
  label: string;
  /** Optional small second line under the label. */
  hint?: string;
  /** Optional leading element (icon, dot, flag...). */
  icon?: ReactNode;
};

type Props<T extends string | number> = {
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  /** Classes for the trigger button (use your existing input classes). */
  className?: string;
  id?: string;
  ariaLabel?: string;
  placeholder?: string;
  /** Which edge of the trigger the panel lines up with. */
  align?: "left" | "right";
  /** Panel never gets narrower than this (px). Default: trigger width. */
  minPanelWidth?: number;
  /** Panel max height in px before it scrolls (scrollbar stays hidden). */
  maxHeight?: number;
  disabled?: boolean;
};

const GAP = 6;
const EDGE = 8;
const ROW_HEIGHT = 40;
const FADE = 18;

/**
 * Premium replacement for the native <select>.
 *
 * - The list scrolls with wheel / touch / keyboard but never shows a
 *   scrollbar (soft fade at the edges hints that there is more).
 * - Rendered through a portal with fixed positioning, so it is never
 *   clipped by a card's overflow and flips upward near the screen bottom.
 * - Full keyboard support: arrows, Home/End, Enter/Space, Esc, type-ahead.
 */
export default function Dropdown<T extends string | number>({
  value,
  onChange,
  options,
  className = "",
  id,
  ariaLabel,
  placeholder = "Select…",
  align = "left",
  minPanelWidth,
  maxHeight = 280,
  disabled = false,
}: Props<T>) {
  const autoId = useId();
  const listId = `${id ?? autoId}-list`;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pos, setPos] = useState<{
    left: number;
    width: number;
    top?: number;
    bottom?: number;
    listMax: number;
    side: "down" | "up";
  } | null>(null);
  const [fade, setFade] = useState({ top: false, bottom: false });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const typeahead = useRef({ text: "", timer: 0 as unknown as ReturnType<typeof setTimeout> });

  const selectedIndex = useMemo(
    () => options.findIndex((o) => o.value === value),
    [options, value]
  );
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => setMounted(true), []);

  /* ---------- positioning ---------- */
  const reposition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.max(rect.width, minPanelWidth ?? 0);
    const natural = Math.min(options.length * ROW_HEIGHT + 12, maxHeight);
    const spaceBelow = window.innerHeight - rect.bottom - EDGE - GAP;
    const spaceAbove = rect.top - EDGE - GAP;
    const up = spaceBelow < natural && spaceAbove > spaceBelow;
    const listMax = Math.max(120, Math.min(maxHeight, up ? spaceAbove : spaceBelow));

    let left = align === "right" ? rect.right - width : rect.left;
    left = Math.min(Math.max(left, EDGE), Math.max(EDGE, window.innerWidth - width - EDGE));

    setPos({
      left,
      width,
      top: up ? undefined : rect.bottom + GAP,
      bottom: up ? window.innerHeight - rect.top + GAP : undefined,
      listMax,
      side: up ? "up" : "down",
    });
  }, [align, maxHeight, minPanelWidth, options.length]);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
    const onScroll = (e: Event) => {
      // Scrolling the list itself must not re-run positioning.
      if (panelRef.current && e.target instanceof Node && panelRef.current.contains(e.target)) return;
      reposition();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, reposition]);

  /* ---------- scroll fade + keep active row visible ---------- */
  const updateFade = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setFade({
      top: el.scrollTop > 2,
      bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 2,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open || !pos) return;
    const el = listRef.current;
    if (!el) return;
    const row = el.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    if (row) {
      const top = row.offsetTop;
      const bottom = top + row.offsetHeight;
      if (top < el.scrollTop + FADE) el.scrollTop = Math.max(0, top - FADE);
      else if (bottom > el.scrollTop + el.clientHeight - FADE)
        el.scrollTop = bottom - el.clientHeight + FADE;
    }
    updateFade();
  }, [open, pos, activeIndex, updateFade]);

  /* ---------- outside click / escape ---------- */
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent | TouchEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  /* ---------- actions ---------- */
  function openMenu() {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function choose(index: number) {
    const opt = options[index];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    const last = options.length - 1;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case "Tab":
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(last, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(last);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(activeIndex);
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          clearTimeout(typeahead.current.timer);
          typeahead.current.text += e.key.toLowerCase();
          typeahead.current.timer = setTimeout(() => (typeahead.current.text = ""), 600);
          const hit = options.findIndex((o) =>
            o.label.toLowerCase().startsWith(typeahead.current.text)
          );
          if (hit >= 0) setActiveIndex(hit);
        }
    }
  }

  const panelStyle: CSSProperties | undefined = pos
    ? {
        position: "fixed",
        left: pos.left,
        width: pos.width,
        top: pos.top,
        bottom: pos.bottom,
      }
    : { position: "fixed", visibility: "hidden", top: 0, left: 0 };

  const listStyle = {
    maxHeight: pos?.listMax ?? maxHeight,
    ["--dd-fade-top" as string]: fade.top ? `${FADE}px` : "0px",
    ["--dd-fade-bottom" as string]: fade.bottom ? `${FADE}px` : "0px",
  } as CSSProperties;

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        aria-activedescendant={open ? `${listId}-opt-${activeIndex}` : undefined}
        className={`flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        <span className={`flex min-w-0 items-center gap-2 ${selected ? "" : "text-muted/70"}`}>
          {selected?.icon}
          <span className="truncate">{selected ? selected.label : placeholder}</span>
        </span>
        <svg
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 opacity-70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            ref={panelRef}
            style={panelStyle}
            data-side={pos?.side ?? "down"}
            className="dd-panel z-[90]"
          >
            <div
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label={ariaLabel}
              onScroll={updateFade}
              style={listStyle}
              className="dd-list no-scrollbar overflow-y-auto overscroll-contain p-1.5"
            >
              {options.map((o, i) => {
                const isSelected = i === selectedIndex;
                return (
                  <div
                    key={String(o.value)}
                    id={`${listId}-opt-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    data-index={i}
                    data-active={i === activeIndex}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => choose(i)}
                    className="dd-item"
                  >
                    {o.icon && <span className="dd-item-icon">{o.icon}</span>}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{o.label}</span>
                      {o.hint && <span className="mt-0.5 block truncate text-[11px] font-normal text-muted">{o.hint}</span>}
                    </span>
                    {isSelected && (
                      <svg
                        aria-hidden
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0"
                      >
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
