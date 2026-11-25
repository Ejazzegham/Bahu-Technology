import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";

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
//
// "Online now" = visitors whose last ping was within the last 2 minutes.

const ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;
const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|monitor|uptime/i;
const ONLINE_WINDOW_MS = 2 * 60 * 1000;
const MIN_PING_INTERVAL_MS = 10 * 1000;
const STATS_CACHE_MS = 10 * 1000;
const TIME_ZONE = "Asia/Karachi";

type Stats = { online: number; today: number; total: number; pageViews: number };

let cache: { at: number; stats: Stats } | null = null;
const lastSeenByVisitor = new Map<string, number>();

function dayKey(d = new Date()): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(d);
}

async function readStats(): Promise<Stats> {
  const now = Date.now();
  if (cache && now - cache.at < STATS_CACHE_MS) return cache.stats;

  const db = getAdminDb();
  const [summarySnap, todaySnap, onlineSnap] = await Promise.all([
    db.collection("visitorStats").doc("summary").get(),
    db.collection("visitorStats").doc(`day-${dayKey()}`).get(),
    db.collection("visitors").where("lastSeen", ">", now - ONLINE_WINDOW_MS).count().get(),
  ]);

  const summary = summarySnap.data() ?? {};
  const stats: Stats = {
    online: Math.max(1, onlineSnap.data().count), // the person reading this is online
    today: Number(todaySnap.data()?.uniqueVisitors ?? 0),
    total: Number(summary.uniqueVisitors ?? 0),
    pageViews: Number(summary.pageViews ?? 0),
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
            if (isNewToday) {
              tx.set(dayRef, { date: today, uniqueVisitors: FieldValue.increment(1) }, { merge: true });
            }
          });
          cache = null; // show the new visit immediately
        } else {
          await visitorRef.set({ lastSeen: now }, { merge: true });
        }
      }
    }

    return NextResponse.json(await readStats(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    // Most likely Firebase Admin isn't configured. The home-page section
    // hides itself on any non-200, so the site never shows a broken widget.
    console.error("POST /api/visitors failed:", err);
    return NextResponse.json({ error: "Visitor stats unavailable." }, { status: 503 });
  }
}
