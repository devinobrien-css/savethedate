import { wedding, versions } from "@/config/site";
import { googleCalendarUrl } from "@/lib/calendar";

export type Variant = "v1" | "v2" | "v3";

function siteUrl(): string {
  return (process.env.SITE_URL || "https://devinandrebecca.com").replace(/\/+$/, "");
}

type EmailContent = { subject: string; html: string; text: string };

type RsvpConfirmationInput = {
  firstName: string;
  attending: boolean;
  partySize: number;
  variant?: Variant;
};

/**
 * Powder Blue palette — soft · romantic · refined. Shared across all three
 * designs (deep navy + powder blue + gold over ivory), matching the site.
 */
const powderBlue = {
  ink: "#1e2a3a",
  accent: "#55718f",
  gold: "#c8a23a",
  tint: "#eef2f7",
  paper: "#f4eede",
};
const palettes: Record<Variant, typeof powderBlue> = {
  v1: powderBlue,
  v2: powderBlue,
  v3: powderBlue,
};

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildRsvpConfirmation(input: RsvpConfirmationInput): EmailContent {
  const { firstName, attending, partySize } = input;
  const p = palettes[input.variant ?? "v1"];
  const name = escapeHtml(firstName || "there");
  const couple = `${wedding.partnerA} & ${wedding.partnerB}`;
  const divider = "rgba(0,0,0,0.07)";

  const subject = attending
    ? `We've got your RSVP, ${firstName} — see you there!`
    : `Thank you for letting us know, ${firstName}`;

  const intro = attending
    ? "We're so happy you'll be joining us — your response is confirmed!"
    : "Thank you for letting us know. We'll truly miss you, but we're so grateful you replied. Here's what we have on file:";

  const responseLabel = attending ? "Joyfully accepts" : "Regretfully declines";
  const guestCount = `${partySize} ${partySize === 1 ? "guest" : "guests"}`;

  // Hidden preheader text (inbox preview line).
  const preheader = `Your response to ${couple}'s wedding has been received.`;

  // ── Links ─────────────────────────────────────────────────────────────
  const base = siteUrl();
  const slug = versions[input.variant ?? "v1"].slug;
  const changeUrl = `${base}/${slug}#rsvp`;
  const googleUrl = googleCalendarUrl();
  const appleUrl = `${base}/api/calendar`;

  // ── Small builders ────────────────────────────────────────────────────
  const eyebrow = (text: string, color: string, opacity: number) =>
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:${color};opacity:${opacity};">${text}</div>`;

  const btn = (href: string, label: string, fill: boolean) => {
    const skin = fill
      ? `background:${p.accent};color:#ffffff;border:1px solid ${p.accent};font-weight:700;`
      : `background:#ffffff;color:${p.ink};border:1px solid rgba(0,0,0,0.16);font-weight:600;`;
    return `<a href="${href}" target="_blank" style="display:inline-block;box-sizing:border-box;width:280px;max-width:80%;text-align:center;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.4px;padding:15px 0;border-radius:11px;${skin}">${label}</a>`;
  };

  const detailRow = (label: string, value: string, opts: { accent?: boolean; last?: boolean } = {}) => {
    const border = opts.last ? "" : `border-bottom:1px solid ${divider};`;
    const valColor = opts.accent ? p.accent : p.ink;
    return `
                    <tr>
                      <td style="padding:13px 0;${border}font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${p.ink};opacity:0.5;vertical-align:middle;">${label}</td>
                      <td style="padding:13px 0;${border}font-family:Arial,Helvetica,sans-serif;font-size:14px;text-align:right;color:${valColor};font-weight:${opts.accent ? 700 : 600};vertical-align:middle;">${value}</td>
                    </tr>`;
  };

  // ── Summary card rows ─────────────────────────────────────────────────
  const rows =
    detailRow("Response", responseLabel, { accent: true }) +
    (attending ? detailRow("Guests", guestCount) : "") +
    detailRow("When", escapeHtml(wedding.weddingDateLabel)) +
    detailRow("Where", escapeHtml(wedding.venueName), { last: true });

  // ── Calendar buttons (attending only) ─────────────────────────────────
  const calendarBlock = attending
    ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:38px;">
                <tr><td align="center" style="padding-bottom:18px;">${eyebrow("Add it to your calendar", p.ink, 0.5)}</td></tr>
                <tr><td align="center" style="padding-bottom:12px;">${btn(googleUrl, "Add to Google Calendar", true)}</td></tr>
                <tr><td align="center">${btn(appleUrl, "Add to Apple Calendar", false)}</td></tr>
              </table>`
    : "";

  // ── Change-response block ─────────────────────────────────────────────
  const changeBlock = `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:38px;">
                <tr><td style="border-top:1px solid ${divider};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>
                <tr><td align="center" style="padding-top:28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${p.ink};opacity:0.7;">
                  Change of plans? Update your reply anytime —<br>it'll simply replace this one.
                </td></tr>
                <tr><td align="center" style="padding-top:18px;">${btn(changeUrl, "Update your response", false)}</td></tr>
              </table>`;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${p.paper};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${p.paper};font-size:1px;line-height:1px;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${p.paper};padding:36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 6px 28px rgba(0,0,0,0.07);">
          <!-- accent strip -->
          <tr><td style="height:5px;background:${p.gold};font-size:0;line-height:0;">&nbsp;</td></tr>
          <!-- header -->
          <tr>
            <td style="background:${p.ink};padding:46px 40px 40px;text-align:center;">
              ${eyebrow("Save the Date", "#ffffff", 0.6)}
              <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:38px;line-height:1.1;color:#ffffff;margin-top:16px;">${escapeHtml(couple)}</div>
              <div style="width:46px;height:1px;background:rgba(255,255,255,0.35);margin:20px auto 18px;font-size:0;line-height:0;">&nbsp;</div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.78);">${escapeHtml(wedding.weddingDateLabel)} &nbsp;·&nbsp; ${escapeHtml(wedding.city)}</div>
            </td>
          </tr>
          <!-- body -->
          <tr>
            <td style="padding:42px 44px 8px;font-family:Arial,Helvetica,sans-serif;color:${p.ink};">
              <p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${p.ink};">Hi ${name},</p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.65;color:${p.ink};opacity:0.82;">${intro}</p>
              <!-- summary card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${p.tint};border-radius:14px;">
                <tr><td style="padding:8px 26px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
                  </table>
                </td></tr>
              </table>
              <p style="margin:30px 0 0;font-size:14px;line-height:1.65;color:${p.ink};opacity:0.78;">
                The finer details — ceremony time and the schedule that follows — are still coming together, and a formal invitation will follow.${attending ? " We can't wait to celebrate with you." : ""}
              </p>${calendarBlock}${changeBlock}
            </td>
          </tr>
          <!-- signoff -->
          <tr>
            <td style="padding:34px 44px 44px;text-align:center;">
              <div style="width:40px;height:1px;background:${p.gold};opacity:0.8;margin:0 auto 22px;font-size:0;line-height:0;">&nbsp;</div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:18px;color:${p.ink};opacity:0.75;">With love,</div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:26px;color:${p.accent};margin-top:4px;">${escapeHtml(couple)}</div>
            </td>
          </tr>
          <!-- footer -->
          <tr>
            <td style="background:${p.tint};padding:24px 40px;text-align:center;font-family:Arial,Helvetica,sans-serif;">
              <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${p.ink};opacity:0.45;">${escapeHtml(wedding.venueName)} &nbsp;·&nbsp; ${escapeHtml(wedding.weddingDateLabel)}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `${couple} — Save the Date`,
    `${wedding.weddingDateLabel} · ${wedding.city}`,
    "",
    `Hi ${firstName || "there"},`,
    "",
    intro.replaceAll("—", "-"),
    "",
    `Response: ${responseLabel}`,
    attending ? `Guests: ${guestCount}` : "",
    `When: ${wedding.weddingDateLabel}`,
    `Where: ${wedding.venueName}`,
    "",
    "The finer details and a formal invitation will follow.",
    "",
    attending ? `Add to Google Calendar: ${googleUrl}` : "",
    attending ? `Add to Apple Calendar: ${appleUrl}` : "",
    `Change of plans? Update your response anytime: ${changeUrl}`,
    "",
    `With love, ${couple}`,
    `${wedding.venueName} · ${wedding.weddingDateLabel}`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { subject, html, text };
}
