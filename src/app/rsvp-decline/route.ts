import { buildRsvpConfirmation } from "@/emails/rsvpConfirmation";

export const runtime = "nodejs";

/** Preview the "declining" confirmation email exactly as guests receive it. */
export function GET() {
  const { html } = buildRsvpConfirmation({
    firstName: "Alex",
    attending: false,
    partySize: 0,
    variant: "v1",
  });
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
