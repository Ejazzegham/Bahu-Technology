import nodemailer from "nodemailer";

// Best-effort email to the business inbox. Uses the same EMAIL_USER /
// EMAIL_APP_PASSWORD / CONTACT_TO_EMAIL variables as /api/contact. It never
// throws — the booking / brief is already saved in Firestore by the time this
// runs, so a mail problem must not turn a successful submission into an error.

export const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "bahutechnology@gmail.com";

export async function notifyOwner(opts: {
  subject: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: string; contentType?: string }[];
}): Promise<boolean> {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn("notifyOwner skipped: EMAIL_USER / EMAIL_APP_PASSWORD not set.");
    return false;
  }
  try {
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
    await transporter.sendMail({
      from: `"Bahu Technology Website" <${user}>`,
      to: TO_EMAIL,
      replyTo: opts.replyTo,
      subject: opts.subject,
      text: opts.text,
      attachments: opts.attachments,
    });
    return true;
  } catch (err) {
    console.error("notifyOwner failed:", err);
    return false;
  }
}
