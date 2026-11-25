"use client";

import { useEffect, useState } from "react";
import { subscribeClients, type Client } from "@/lib/firestore/clients";

/** "Trusted by" strip — fed by Admin → Clients. Hidden until you add some. */
export default function ClientsStrip() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const unsub = subscribeClients(setClients);
    return () => unsub?.();
  }, []);

  if (clients.length === 0) return null;
  const list = clients.length < 6 ? [...clients, ...clients, ...clients] : clients;
  const loop = [...list, ...list];

  return (
    <section aria-label="Our clients" className="section py-14">
      <p className="mb-8 text-center text-[11px] font-semibold tracking-[0.3em] text-muted">
        TRUSTED BY {clients.length}+ CLIENTS &amp; BRANDS
      </p>
      <div className="marquee marquee-mask overflow-hidden">
        <div className="marquee-track" style={{ animationDuration: "35s" }}>
          {loop.map((c, i) => (
            <span
              key={`${c.id}-${i}`}
              aria-hidden={i >= list.length}
              className="mr-10 shrink-0 font-display text-xl font-semibold tracking-tight text-ink/30 transition-colors hover:text-gold"
            >
              {c.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
