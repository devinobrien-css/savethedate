import { icsBody, eventTitle } from "@/lib/calendar";

export const runtime = "nodejs";

/**
 * Serves the wedding as a downloadable .ics file. Used by the confirmation
 * email's "Add to Apple / Outlook Calendar" link (email clients can't open
 * the data: URL used on the website itself).
 */
export function GET() {
  const fileName = eventTitle().replace(/[^\w]+/g, "-").toLowerCase();
  return new Response(icsBody(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}.ics"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
