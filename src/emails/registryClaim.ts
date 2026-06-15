import { wedding } from "@/config/site";

/**
 * "Confirm your gift" verification email — sent when a guest marks a registry
 * item as purchased on /registry. They click to confirm (which locks the item
 * in for everyone) or to release it if they change their mind. Styled to match
 * the RSVP confirmation (see emails/rsvpConfirmation.ts): deep navy + gold over
 * ivory, table-based for broad mail-client support.
 */

type EmailContent = { subject: string; html: string; text: string };

type RegistryClaimInput = {
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

export function buildRegistryClaim(input: RegistryClaimInput): EmailContent {
  const { confirmUrl, releaseUrl } = input;
  const p = palette;
  const name = escapeHtml(input.name || "there");
  const item = escapeHtml(input.itemTitle);
  const couple = `${wedding.partnerA} & ${wedding.partnerB}`;
  const divider = "rgba(0,0,0,0.07)";

  const subject = `Confirm your gift — ${input.itemTitle}`;
  const preheader = `One click to confirm you're giving "${input.itemTitle}".`;

  const eyebrow = (text: string, color: string, opacity: number) =>
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:${color};opacity:${opacity};">${text}</div>`;

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
              ${eyebrow("Registry & Gifts", "#ffffff", 0.6)}
              <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:38px;line-height:1.1;color:#ffffff;margin-top:16px;">${escapeHtml(couple)}</div>
              <div style="width:46px;height:1px;background:rgba(255,255,255,0.35);margin:20px auto 18px;font-size:0;line-height:0;">&nbsp;</div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.78);">${escapeHtml(wedding.weddingDateLabel)} &nbsp;·&nbsp; ${escapeHtml(wedding.city)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:42px 44px 8px;font-family:Arial,Helvetica,sans-serif;color:${p.ink};">
              <p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${p.ink};">Hi ${name},</p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.65;color:${p.ink};opacity:0.82;">
                Thank you so much — it means the world. Just one quick step: confirm the gift below so we can mark it as covered and no one else doubles up.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${p.tint};border-radius:14px;">
                <tr><td style="padding:20px 26px;">
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${p.ink};opacity:0.5;">Your gift</div>
                  <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:${p.ink};margin-top:8px;">${item}</div>
                </td></tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:34px;">
                <tr><td align="center" style="padding-bottom:12px;">${btn(confirmUrl, "Confirm this gift", true)}</td></tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px;">
                <tr><td style="border-top:1px solid ${divider};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>
                <tr><td align="center" style="padding-top:26px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${p.ink};opacity:0.7;">
                  Changed your mind, or clicked by accident?<br>You can release it so someone else can give it.
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
    `Thank you so much! Please confirm your gift so we can mark it as covered:`,
    "",
    `Gift: ${input.itemTitle}`,
    "",
    `Confirm this gift: ${confirmUrl}`,
    "",
    `Changed your mind? Release it so someone else can give it: ${releaseUrl}`,
    "",
    `With love and gratitude, ${couple}`,
    `${wedding.venueName} · ${wedding.weddingDateLabel}`,
  ].join("\n");

  return { subject, html, text };
}
