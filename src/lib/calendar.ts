import { wedding } from "@/config/site";

/** Format a Date as the UTC basic format used by calendar links: YYYYMMDDTHHMMSSZ */
function toICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function eventWindow() {
  const start = new Date(wedding.weddingDateISO);
  const end = new Date(start.getTime() + wedding.durationHours * 60 * 60 * 1000);
  return { start, end };
}

export function eventTitle() {
  return `${wedding.partnerA} & ${wedding.partnerB} — Wedding`;
}

export function googleCalendarUrl(): string {
  const { start, end } = eventWindow();
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle(),
    dates: `${toICSDate(start)}/${toICSDate(end)}`,
    details: wedding.message,
    location: `${wedding.venueName}, ${wedding.venueAddress}`,
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

/** Builds an .ics file body and returns a data URL for download. */
export function icsDataUrl(): string {
  const { start, end } = eventWindow();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//savethedate//EN",
    "BEGIN:VEVENT",
    `UID:${start.getTime()}@savethedate`,
    `DTSTAMP:${toICSDate(start)}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${eventTitle()}`,
    `DESCRIPTION:${wedding.message.replace(/\n/g, "\\n")}`,
    `LOCATION:${wedding.venueName}, ${wedding.venueAddress}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `data:text/calendar;charset=utf8,${encodeURIComponent(lines.join("\r\n"))}`;
}
