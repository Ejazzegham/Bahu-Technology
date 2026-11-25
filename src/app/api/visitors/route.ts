import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { COUNTRY_CENTROIDS } from "@/lib/geo-data";

export const runtime = "nodejs";

// Real visitor tracking for the home-page "Visitor Insights" section.
//
// The browser never touches Firestore for this feature — it POSTs here, and
// this route uses Firebase Admin (which bypasses security rules), so
// firestore.rules does NOT need to change. The collections used
// (`visitors`, `visitorStats`) stay closed to direct client access by the
// catch-all "deny" rule.
//
// Collections:
//   visitors/{visitorId}        one doc per browser: firstSeen, lastSeen, lastDay, visits
//   visitorStats/summary        { uniqueVisitors, pageViews }
//   visitorStats/day-YYYY-MM-DD { date, uniqueVisitors }  (unique visitors per day)
//   visitorStats/geo            { countries: { PK: 12, US: 4, ... } }  (unique visitors per country)
//
// Location: only a country code, an optional city name and coordinates rounded
// to ~11 km are kept (taken from the hosting platform's geo headers — Vercel
// or Cloudflare). The visitor's IP address is never stored.
//
// "Online now" = visitors whose last ping was within the last 2 minutes.

const ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;
const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|monitor|uptime/i;
const ONLINE_WINDOW_MS = 2 * 60 * 1000;
const MIN_PING_INTERVAL_MS = 10 * 1000;
const STATS_CACHE_MS = 10 * 1000;
const TIME_ZONE = "Asia/Karachi";

type GeoPoint = { cc: string; lat: number; lng: number; city?: string };
type Stats = {
  online: number;
  today: number;
  total: number;
  pageViews: number;
  /** Where people who are online right now are (max 60). */
  livePoints: GeoPoint[];
  /** Where the person making this request is (omitted when the host gives no geo headers). */
  you?: GeoPoint | null;
  /** Countries visitors have come from, biggest first (max 40). */
  countries: { cc: string; name: string; lat: number; lng: number; count: number }[];
};

let cache: { at: number; stats: Stats } | null = null;
let warnedNotConfigured = false;
const lastSeenByVisitor = new Map<string, number>();

function dayKey(d = new Date()): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(d);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Best-effort location of the request, from platform geo headers. No IP is read or stored. */
function geoFromRequest(req: NextRequest): GeoPoint | null {
  const h = req.headers;
  const cc = (h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? h.get("x-country-code") ?? "")
    .toUpperCase()
    .trim();
  if (!/^[A-Z]{2}$/.test(cc) || cc === "XX" || cc === "T1") return null;

  let city: string | undefined;
  const rawCity = h.get("x-vercel-ip-city");
  if (rawCity) {
    try {
      city = decodeURIComponent(rawCity).slice(0, 60);
    } catch {
      city = undefined;
    }
  }

  const lat = parseFloat(h.get("x-vercel-ip-latitude") ?? "");
  const lng = parseFloat(h.get("x-vercel-ip-longitude") ?? "");
  if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    return { cc, lat: round1(lat), lng: round1(lng), ...(city ? { city } : {}) };
  }

  // No coordinates from the host (e.g. Cloudflare sends only the country):
  // fall back to the middle of the country.
  const c = COUNTRY_CENTROIDS[cc];
  if (!c) return null;
  return { cc, lat: c[1], lng: c[2], ...(city ? { city } : {}) };
}

async function readStats(): Promise<Stats> {
  const now = Date.now();
  if (cache && now - cache.at < STATS_CACHE_MS) return cache.stats;

  const db = getAdminDb();
  const onlineQuery = db.collection("visitors").where("lastSeen", ">", now - ONLINE_WINDOW_MS);
  const [summarySnap, todaySnap, geoSnap, onlineSnap, liveSnap] = await Promise.all([
    db.collection("visitorStats").doc("summary").get(),
    db.collection("visitorStats").doc(`day-${dayKey()}`).get(),
    db.collection("visitorStats").doc("geo").get(),
    onlineQuery.count().get(),
    onlineQuery.select("geo").limit(60).get(),
  ]);

  const summary = summarySnap.data() ?? {};

  const livePoints: GeoPoint[] = [];
  liveSnap.forEach((d) => {
    const g = d.get("geo");
    if (g && typeof g.lat === "number" && typeof g.lng === "number" && typeof g.cc === "string") {
      livePoints.push({ cc: g.cc, lat: g.lat, lng: g.lng, ...(g.city ? { city: String(g.city) } : {}) });
    }
  });

  const rawCountries = (geoSnap.data()?.countries ?? {}) as Record<string, number>;
  const countries = Object.entries(rawCountries)
    .map(([cc, count]) => {
      const c = COUNTRY_CENTROIDS[cc];
      return c ? { cc, name: c[0], lat: c[1], lng: c[2], count: Number(count) || 0 } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x && x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 40);

  const stats: Stats = {
    online: Math.max(1, onlineSnap.data().count), // the person reading this is online
    today: Number(todaySnap.data()?.uniqueVisitors ?? 0),
    total: Number(summary.uniqueVisitors ?? 0),
    pageViews: Number(summary.pageViews ?? 0),
    livePoints,
    countries,
  };
  cache = { at: now, stats };
  return stats;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const visitorId = String(body.visitorId ?? "");
    const type = body.type === "visit" ? "visit" : "ping";

    if (!ID_RE.test(visitorId)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const ua = req.headers.get("user-agent") ?? "";
    const isBot = BOT_RE.test(ua);
    const now = Date.now();
    const geo = isBot ? null : geoFromRequest(req);

    // Bots are never counted; they just get the current numbers.
    if (!isBot) {
      const last = lastSeenByVisitor.get(visitorId) ?? 0;
      const tooSoon = type === "ping" && now - last < MIN_PING_INTERVAL_MS;

      if (!tooSoon) {
        lastSeenByVisitor.set(visitorId, now);
        if (lastSeenByVisitor.size > 5000) lastSeenByVisitor.clear();

        const db = getAdminDb();
        const visitorRef = db.collection("visitors").doc(visitorId);

        if (type === "visit") {
          const today = dayKey();
          const summaryRef = db.collection("visitorStats").doc("summary");
          const dayRef = db.collection("visitorStats").doc(`day-${today}`);
          const geoRef = db.collection("visitorStats").doc("geo");

          await db.runTransaction(async (tx) => {
            const snap = await tx.get(visitorRef);
            const isNewVisitor = !snap.exists;
            const isNewToday = snap.data()?.lastDay !== today;

            tx.set(
              visitorRef,
              {
                ...(isNewVisitor ? { firstSeen: now } : {}),
                lastSeen: now,
                lastDay: today,
                visits: FieldValue.increment(1),
                ...(geo ? { geo } : {}),
              },
              { merge: true }
            );
            tx.set(
              summaryRef,
              {
                pageViews: FieldValue.increment(1),
                ...(isNewVisitor ? { uniqueVisitors: FieldValue.increment(1) } : {}),
              },
              { merge: true }
            );
            if (isNewVisitor && geo) {
              tx.set(geoRef, { countries: { [geo.cc]: FieldValue.increment(1) } }, { merge: true });
            }
            if (isNewToday) {
              tx.set(dayRef, { date: today, uniqueVisitors: FieldValue.increment(1) }, { merge: true });
            }
          });
          cache = null; // show the new visit immediately
        } else {
          await visitorRef.set({ lastSeen: now, ...(geo ? { geo } : {}) }, { merge: true });
        }
      }
    }

    return NextResponse.json({ ...(await readStats()), you: geo }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    // Most likely Firebase Admin isn't configured. The home-page section
    // hides itself on any non-200, so the site never shows a broken widget.
    const notConfigured = err instanceof Error && err.message.startsWith("Firebase Admin is not configured");
    if (notConfigured) {
      if (!warnedNotConfigured) {
        warnedNotConfigured = true;
        console.warn("[visitors] Firebase Admin env vars are missing on this deployment; visitor stats are disabled.");
      }
    } else {
      console.error("POST /api/visitors failed:", err);
    }
    return NextResponse.json({ error: "Visitor stats unavailable." }, { status: 503 });
  }
}
