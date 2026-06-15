import "server-only";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);

/**
 * Sends texts by driving the macOS **Messages** app via AppleScript. This only
 * works when the Next.js server is running on the Mac (npm run dev / start) that
 * is signed into Messages — i.e. NOT on the deployed Linux host. iMessage goes
 * blue; plain SMS routes through the paired iPhone if "Text Message Forwarding"
 * is enabled (iPhone → Settings → Messages → Text Message Forwarding).
 *
 * Because it's person-to-person from your own number, this sidesteps A2P 10DLC
 * registration and carrier fees entirely — the trade-off is it's a local tool,
 * not something the cloud deployment can run.
 *
 * NOTE: the first run will prompt for Automation permission (System Settings →
 * Privacy & Security → Automation → allow your terminal/app to control Messages).
 * AppleScript support for Messages varies by macOS version, so confirm delivery
 * (e.g. add just your own number) before sending a real broadcast.
 */
export function isLocalSmsAvailable(): boolean {
  return process.platform === "darwin";
}

// Number + body are passed as argv (not interpolated) so quotes/newlines in the
// message can never break the script. Tries iMessage, then falls back to SMS.
const SEND_SCRIPT = `
on run argv
  set targetNumber to item 1 of argv
  set targetMessage to item 2 of argv
  tell application "Messages"
    try
      set targetService to 1st service whose service type = iMessage
      send targetMessage to buddy targetNumber of targetService
    on error
      set smsService to 1st service whose service type = SMS
      send targetMessage to buddy targetNumber of smsService
    end try
  end tell
end run
`;

export async function sendViaMessages(to: string, body: string): Promise<void> {
  if (!isLocalSmsAvailable()) {
    throw new Error("Local SMS sending is only available when running on macOS.");
  }
  try {
    await execFileP("osascript", ["-e", SEND_SCRIPT, to, body], { timeout: 30_000 });
  } catch (e) {
    // osascript surfaces AppleScript + Automation-permission errors on stderr,
    // which promisified execFile rolls into the thrown error's message.
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(msg.trim() || "osascript failed");
  }
}
