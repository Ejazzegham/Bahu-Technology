import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { R2_PUBLIC_URL } from "@/lib/r2";
import { BRIEF_MAX_FILES } from "@/lib/brief";
import { notifyOwner } from "@/lib/notify";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const list = (v: unknown, maxItems: number, maxLen: number): string[] =>
  Array.isArray(v) ? v.slice(0, maxItems).map((x) => str(x, maxLen)).filter(Boolean) : [];

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`brief:${clientIp(req.headers)}`, 5, 60 * 60_000)) {
      return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
    }

    const b = await req.json().catch(() => ({}));
    if (b.website) return NextResponse.json({ ok: true }); // honeypot

    const name = str(b.name, 120);
    const email = str(b.email, 200);
    const phone = str(b.phone, 40);
    const company = str(b.company, 120);
    const services = list(b.services, 5, 60);
    const goals = list(b.goals, 8, 80);
    const budget = str(b.budget, 40);
    const timeline = str(b.timeline, 40);
    const references = str(b.references, 1000);
    const details = str(b.details, 4000);
    const estimate = str(b.estimate, 300);

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter your name and a valid email." }, { status: 400 });
    }
    if (services.length === 0 || !details) {
      return NextResponse.json({ error: "Please pick a service and describe your project." }, { status: 400 });
    }

    // Only accept file links that point at OUR bucket's briefs/ folder — stops
    // someone submitting arbitrary URLs that then show up in the admin inbox.
    const files = (Array.isArray(b.files) ? b.files : [])
      .slice(0, BRIEF_MAX_FILES)
      .map((f: { name?: unknown; url?: unknown; size?: unknown }) => ({
        name: str(f?.name, 120),
        url: str(f?.url, 500),
        size: Number(f?.size) || 0,
      }))
      .filter((f: { url: string }) => R2_PUBLIC_URL && f.url.startsWith(`${R2_PUBLIC_URL}/briefs/`));

    const lines = [
      `Services: ${services.join(", ")}`,
      goals.length ? `Goals: ${goals.join(", ")}` : "",
      budget ? `Budget: ${budget}` : "",
      timeline ? `Timeline: ${timeline}` : "",
      estimate ? `Estimator result: ${estimate}` : "",
      company ? `Company: ${company}` : "",
      phone ? `Phone / WhatsApp: ${phone}` : "",
      references ? `References: ${references}` : "",
      "",
      "Project details:",
      details,
      files.length ? `\nAttachments (${files.length}):\n${files.map((f: { name: string; url: string }) => `• ${f.name} — ${f.url}`).join("\n")}` : "",
    ].filter((l) => l !== "");

    const db = getAdminDb();
    await db.collection("briefs").add({
      name, email, phone, company, services, goals, budget, timeline, references, details, estimate, files,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Mirror into the existing Messages inbox so it's visible in /admin immediately.
    await db
      .collection("messages")
      .add({
        name,
        email,
        phone,
        subject: `📋 Project brief — ${company || name}`,
        message: lines.join("\n"),
        service: services.join(", "),
        budget,
        timeline,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      })
      .catch((e) => console.error("brief → messages write failed:", e));

    await notifyOwner({
      subject: `New project brief: ${company || name}`,
      text: `Name: ${name}\nEmail: ${email}\n${lines.join("\n")}`,
      replyTo: email,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/brief failed:", err);
    return NextResponse.json({ error: "Couldn't send your brief right now. Please try again." }, { status: 500 });
  }
}
