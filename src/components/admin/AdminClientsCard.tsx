"use client";

import { useRef, useState } from "react";
import { addClient, deleteClient, type Client } from "@/lib/firestore/clients";
import { uploadFile } from "@/lib/storage";

export default function AdminClientsCard({ clients }: { clients: Client[] }) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const logoUrl = logo ? await uploadFile("clients", logo) : undefined;
      const site = website.trim();
      await addClient(name.trim(), logoUrl, /^https?:\/\//i.test(site) ? site : undefined);
      setName("");
      setWebsite("");
      setLogo(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add the client.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card !p-6" id="manage-clients">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ink">Clients</h3>
        <span className="text-xs text-muted">{clients.length} total</span>
      </div>

      <form onSubmit={handleAdd} className="mt-4 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Client name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-line bg-bg px-3 py-2 text-xs text-ink placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <button type="submit" disabled={saving} className="btn-primary shrink-0 !px-4 !py-2 !text-xs disabled:opacity-60">
            {saving ? "Adding…" : "Add"}
          </button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            placeholder="Website (optional) https://…"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full rounded-md border border-line bg-bg px-3 py-2 text-xs text-ink placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
            aria-label="Client logo (optional)"
            className="w-full text-xs text-muted file:mr-3 file:rounded-md file:border file:border-line file:bg-bg file:px-3 file:py-1.5 file:text-xs file:text-ink"
          />
        </div>
        <p className="text-[11px] text-muted">A logo is optional — clients without one appear as text on the portfolio logo wall. Transparent PNG/SVG looks best.</p>
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </form>

      {clients.length === 0 ? (
        <p className="mt-6 text-center text-xs text-muted">No clients added yet.</p>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {clients.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-2 rounded-md border border-line px-3 py-2 text-xs text-ink"
            >
              <span className="flex min-w-0 items-center gap-2">
                {c.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.logoUrl} alt="" className="h-6 w-8 shrink-0 object-contain" />
                )}
                <span className="truncate">{c.name}</span>
              </span>
              <button aria-label={`Delete ${c.name}`} onClick={() => deleteClient(c.id)} className="shrink-0 text-muted hover:text-rose-400">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
