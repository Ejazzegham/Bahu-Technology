// Shared by the booking UI (browser) and /api/bookings (server) so both sides
// agree on exactly which time slots exist. Edit the numbers below to change
// when calls can be booked — nothing else needs touching.
//
// Slots are defined in the team's own time zone (Pakistan, UTC+5, no DST) and
// handed to the browser as UTC ISO strings. The browser then shows each one
// in the visitor's local time, so a client in London or Dubai sees their own
// clock times and never has to do the maths.

export const BOOKING_CONFIG = {
  /** Team time zone offset from UTC, in minutes. Pakistan = +5h, no daylight saving. */
  tzOffsetMinutes: 5 * 60,
  tzLabel: "PKT (UTC+5)",
  /** 0 = Sunday … 6 = Saturday, in the team's time zone. */
  workDays: [1, 2, 3, 4, 5, 6],
  /** First slot starts at this hour, last slot must END by endHour (team time, 24h). */
  startHour: 11,
  endHour: 19,
  slotMinutes: 30,
  /** How many days ahead people can book. */
  daysAhead: 14,
  /** Can't book a slot that starts sooner than this many hours from now. */
  minLeadHours: 4,
};

export type BookingTopic = "New project" | "Existing project" | "Pricing & quote" | "Partnership" | "Something else";
export const BOOKING_TOPICS: BookingTopic[] = [
  "New project",
  "Pricing & quote",
  "Existing project",
  "Partnership",
  "Something else",
];

/** All bookable slot start times in the booking window, as UTC ISO strings (e.g. 2026-12-01T06:00:00.000Z). */
export function generateSlots(now: Date = new Date()): string[] {
  const c = BOOKING_CONFIG;
  const offsetMs = c.tzOffsetMinutes * 60_000;
  const earliest = now.getTime() + c.minLeadHours * 3_600_000;

  // "Today" as calendar date in the team's time zone.
  const teamNow = new Date(now.getTime() + offsetMs);
  const y = teamNow.getUTCFullYear();
  const m = teamNow.getUTCMonth();
  const d = teamNow.getUTCDate();

  const out: string[] = [];
  for (let day = 0; day <= c.daysAhead; day++) {
    const weekday = new Date(Date.UTC(y, m, d + day)).getUTCDay();
    if (!c.workDays.includes(weekday)) continue;
    for (let mins = c.startHour * 60; mins + c.slotMinutes <= c.endHour * 60; mins += c.slotMinutes) {
      const utcMs = Date.UTC(y, m, d + day, 0, mins) - offsetMs;
      if (utcMs >= earliest) out.push(new Date(utcMs).toISOString());
    }
  }
  return out;
}

export function isValidSlot(iso: string, now: Date = new Date()): boolean {
  return generateSlots(now).includes(iso);
}

/** Firestore document id for a slot — one doc per slot is what prevents double-booking. */
export function slotDocId(iso: string): string {
  return iso.replace(/[:.]/g, "-");
}
