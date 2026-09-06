import { wedding, shippingAddressLines } from "@/config/site";

/**
 * "Still giving this?" reminder — the single nudge sent about two days after a
 * guest marks a gift as theirs but never clicks the verification link. It is
 * the warning that makes the automatic release fair: the gift goes back on the
 * registry the next day unless they confirm.
 *
 * The load-bearing line is the one telling a guest who has *already bought* the
 * gift to confirm anyway — that's the case where a silent release would end in
 * the couple receiving two of something. Styled to match registryClaim.ts.
 */

type EmailContent = { subject: string; html: string; text: string };

type RegistryClaimReminderInput = {
  name: string;
  itemTitle: string;
  confirmUrl: string;
  releaseUrl: string;
};

const palette = {
  ink: "#1e2a3a",
  accent: "#55718f",
  gold: "#c8a23a",
  tint: "#eef2f7",
  paper: "#f4eede",
};

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildRegistryClaimReminder(
  input: RegistryClaimReminderInput
): EmailContent {
  const { confirmUrl, releaseUrl } = input;
  const p = palette;
  const name = escapeHtml(input.name || "there");
  const item = escapeHtml(input.itemTitle);
  const couple = `${wedding.partnerA} & ${wedding.partnerB}`;
  const divider = "rgba(0,0,0,0.07)";
  const shipTo = shippingAddressLines();

  const subject = `Still giving ${input.itemTitle}?`;
  const preheader = `One tap to keep "${input.itemTitle}" reserved — otherwise it goes back on the registry tomorrow.`;

  const btn = (href: string, label: string, fill: boolean) => {
    const skin = fill
      ? `background:${p.accent};color:#ffffff;border:1px solid ${p.accent};font-weight:700;`
      : `background:#ffffff;color:${p.ink};border:1px solid rgba(0,0,0,0.16);font-weight:600;`;
    return `<a href="${href}" target="_blank" style="display:inline-block;box-sizing:border-box;width:280px;max-width:80%;text-align:center;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.4px;padding:15px 0;border-radius:11px;${skin}">${label}</a>`;
  };

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
          <tr><td style="height:5px;background:${p.gold};font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="background:${p.ink};padding:46px 40px 40px;text-align:center;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#ffffff;opacity:0.6;">Registry &amp; Gifts</div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:38px;line-height:1.1;color:#ffffff;margin-top:16px;">${escapeHtml(couple)}</div>
              <div style="width:46px;height:1px;background:rgba(255,255,255,0.35);margin:20px auto 18px;font-size:0;line-height:0;">&nbsp;</div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.78);">${escapeHtml(wedding.weddingDateLabel)} &nbsp;·&nbsp; ${escapeHtml(wedding.city)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:42px 44px 8px;font-family:Arial,Helvetica,sans-serif;color:${p.ink};">
              <p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${p.ink};">Hi ${name},</p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.65;color:${p.ink};opacity:0.82;">
                A couple of days ago you kindly marked a gift as yours, but we never heard back — so we wanted to check before doing anything.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${p.tint};border-radius:14px;">
                <tr><td style="padding:20px 26px;">
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${p.ink};opacity:0.5;">Your gift</div>
                  <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:${p.ink};margin-top:8px;">${item}</div>
                </td></tr>
              </table>
              <p style="margin:26px 0 0;font-size:15px;line-height:1.65;color:${p.ink};opacity:0.82;">
                <strong>If you&rsquo;ve already bought it, just tap below</strong> — that keeps it reserved so nobody else gives the same thing. Otherwise it goes back on the registry tomorrow, and that&rsquo;s completely fine.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px;">
                <tr><td align="center" style="padding-bottom:12px;">${btn(confirmUrl, "Yes — it's still mine", true)}</td></tr>
              </table>
              ${
                shipTo
                  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;background:${p.tint};border-radius:14px;">
                <tr><td style="padding:20px 26px;">
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${p.ink};opacity:0.5;">Where to ship it</div>
                  <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.55;color:${p.ink};margin-top:8px;">${shipTo.map((l) => escapeHtml(l)).join("<br>")}</div>
                </td></tr>
              </table>`
                  : ""
              }
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px;">
                <tr><td style="border-top:1px solid ${divider};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>
                <tr><td align="center" style="padding-top:26px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${p.ink};opacity:0.7;">
                  Changed your mind? No need to do anything &mdash;<br>or release it now so someone else can give it.
                </td></tr>
                <tr><td align="center" style="padding-top:16px;">${btn(releaseUrl, "Release this gift", false)}</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 44px 44px;text-align:center;">
              <div style="width:40px;height:1px;background:${p.gold};opacity:0.8;margin:0 auto 22px;font-size:0;line-height:0;">&nbsp;</div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:18px;color:${p.ink};opacity:0.75;">With love and gratitude,</div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:26px;color:${p.accent};margin-top:4px;">${escapeHtml(couple)}</div>
            </td>
          </tr>
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
    `${couple} — Registry & Gifts`,
    "",
    `Hi ${input.name || "there"},`,
    "",
    "A couple of days ago you kindly marked a gift as yours, but we never heard back — so we wanted to check before doing anything.",
    "",
    `Gift: ${input.itemTitle}`,
    "",
    "If you've already bought it, just confirm below — that keeps it reserved so nobody else gives the same thing. Otherwise it goes back on the registry tomorrow, and that's completely fine.",
    "",
    `Yes — it's still mine: ${confirmUrl}`,
    "",
    ...(shipTo ? ["Where to ship it:", ...shipTo, ""] : []),
    `Changed your mind? Release it so someone else can give it: ${releaseUrl}`,
    "",
    `With love and gratitude, ${couple}`,
    `${wedding.venueName} · ${wedding.weddingDateLabel}`,
  ].join("\n");

  return { subject, html, text };
}
