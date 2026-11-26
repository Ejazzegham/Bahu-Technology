import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { BOOKING_CONFIG, isValidSlot, slotDocId } from "@/lib/booking";
import { notifyOwner } from "@/lib/notify";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Call booking. The browser never touches the `bookings` collection directly
// (Firestore rules keep it closed) — it goes through this route, which uses
// Firebase Admin. Each slot is ONE document whose id is derived from the slot
// time, and it's written with create(), so two people clicking the same slot
// at the same moment cannot both succeed: the second one gets a 409.

/** GET → { taken: string[] } — slot times (UTC ISO) that are already booked. No personal data is returned. */
export async function GET() {
  try {
    const nowIso = new Date().toISOString();
    const snap = await getAdminDb().collection("bookings").where("slot", ">=", nowIso).get();
    const taken = snap.docs.map((d) => d.get("slot") as string).filter(Boolean);
    return NextResponse.json({ taken }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("GET /api/bookings failed:", err);
    // Fail "open" for the UI: it still shows slots, and POST is the real guard.
    return NextResponse.json({ taken: [], degraded: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`book:${clientIp(req.headers)}`, 5, 60 * 60_000)) {
      return NextResponse.json({ error: "Too many booking attempts. Please try again later." }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    if (body.website) return NextResponse.json({ ok: true }); // honeypot

    const name = String(body.name ?? "").trim().slice(0, 120);
    const email = String(body.email ?? "").trim().slice(0, 200);
    const phone = String(body.phone ?? "").trim().slice(0, 40);
    const topic = String(body.topic ?? "").trim().slice(0, 60);
    const notes = String(body.notes ?? "").trim().slice(0, 1000);
    const slot = String(body.slot ?? "");
    const timezone = String(body.timezone ?? "").trim().slice(0, 60);

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter your name and a valid email." }, { status: 400 });
    }
    if (!isValidSlot(slot)) {
      return NextResponse.json({ error: "That time is no longer available. Please pick another." }, { status: 400 });
    }

    const db = getAdminDb();
    try {
      await db.collection("bookings").doc(slotDocId(slot)).create({
        slot,
        name,
        email,
        phone,
        topic,
        notes,
        timezone,
        status: "confirmed",
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (err) {
      const code = (err as { code?: number | string }).code;
      if (code === 6 || code === "already-exists") {
        return NextResponse.json({ error: "Someone just booked that time. Please pick another slot." }, { status: 409 });
      }
      throw err;
    }

    const when = new Date(slot);
    const teamTime = when.toLocaleString("en-GB", {
      timeZone: "Asia/Karachi",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const visitorTime = timezone
      ? (() => {
          try {
            return when.toLocaleString("en-GB", { timeZone: timezone, dateStyle: "full", timeStyle: "short" });
          } catch {
            return "";
          }
        })()
      : "";

    const summary = [
      `Call booked for ${teamTime} ${BOOKING_CONFIG.tzLabel}`,
      visitorTime ? `Visitor's local time (${timezone}): ${visitorTime}` : "",
      `Length: ${BOOKING_CONFIG.slotMinutes} minutes`,
      `Topic: ${topic || "(not specified)"}`,
      phone ? `Phone / WhatsApp: ${phone}` : "",
      notes ? `Notes: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    // Also drop it into the existing Messages inbox so it shows up in /admin
    // with no new admin screen needed.
    await db
      .collection("messages")
      .add({
        name,
        email,
        phone,
        subject: `📞 Call booking — ${teamTime}`,
        message: summary,
        service: topic,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      })
      .catch((e) => console.error("booking → messages write failed:", e));

    const end = new Date(when.getTime() + BOOKING_CONFIG.slotMinutes * 60_000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Bahu Technology//Booking//EN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${slotDocId(slot)}@bahutechnology`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(when)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:Call with ${name.replace(/[,;\n]/g, " ")}`,
      `DESCRIPTION:${summary.replace(/\n/g, "\\n").replace(/,/g, "\\,")}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    await notifyOwner({
      subject: `New call booking: ${name} — ${teamTime}`,
      text: `${summary}\n\nName: ${name}\nEmail: ${email}`,
      replyTo: email,
      attachments: [{ filename: "call.ics", content: ics, contentType: "text/calendar" }],
    });

    return NextResponse.json({ ok: true, slot });
  } catch (err) {
    console.error("POST /api/bookings failed:", err);
    return NextResponse.json({ error: "Couldn't book that slot right now. Please try again." }, { status: 500 });
  }
}
