import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, R2_BUCKET, publicUrlFor } from "@/lib/r2";
import { BRIEF_ALLOWED, BRIEF_MAX_FILE_BYTES, extOf } from "@/lib/brief";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// PUBLIC upload endpoint for the project brief form. Unlike /api/uploads/presign
// (admin-only), visitors can call this without signing in — so it is locked down:
//   • only whitelisted file types, max size per file
//   • the signed URL is bound to the exact Content-Type and Content-Length
//   • keys are namespaced under briefs/ with a random id (not guessable)
//   • per-IP rate limit
export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`brief-presign:${clientIp(req.headers)}`, 20, 60 * 60_000)) {
      return NextResponse.json({ error: "Too many uploads. Please try again later." }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const fileName = String(body.fileName ?? "").trim();
    const contentType = String(body.contentType ?? "").trim().toLowerCase();
    const size = Number(body.size);

    const ext = extOf(fileName);
    const allowedTypes = BRIEF_ALLOWED[ext];
    if (!fileName || !allowedTypes) {
      return NextResponse.json({ error: "That file type isn't supported." }, { status: 400 });
    }
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json({ error: "File type doesn't match its extension." }, { status: 400 });
    }
    if (!Number.isFinite(size) || size <= 0 || size > BRIEF_MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `Files must be under ${Math.round(BRIEF_MAX_FILE_BYTES / 1024 / 1024)} MB.` },
        { status: 400 }
      );
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    const key = `briefs/${new Date().toISOString().slice(0, 7)}/${randomUUID()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
      ContentLength: size,
    });
    const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 300 });

    return NextResponse.json({ uploadUrl, publicUrl: publicUrlFor(key) });
  } catch (err) {
    console.error("POST /api/brief/presign failed:", err);
    return NextResponse.json({ error: "Could not start the upload." }, { status: 500 });
  }
}
