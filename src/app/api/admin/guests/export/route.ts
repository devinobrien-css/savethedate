import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getAddressBook, guestName } from "@/lib/guests";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  // Escape quotes; wrap in quotes if it contains comma/quote/newline.
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Export the address book as a "guest list" CSV — one row per party
 * (household), matching the common import template: the first person is the
 * named guest, everyone else in the party is a plus-one / family member on the
 * same line, and the party's mailing address is split into columns.
 */
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  let parties;
  try {
    ({ parties } = await getAddressBook());
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load guests.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const header = [
    "Full Name",
    "Plus one or Y/N",
    "Street Address",
    "City",
    "State",
    "Zip",
  ];
  const lines = [header.join(",")];
  for (const p of parties) {
    const names = p.guests.map(guestName).filter(Boolean);
    const fullName = names[0] ?? p.household_label ?? "";
    // Everyone after the first person shares the line as plus-ones / family.
    const plusOnes = names.slice(1).join(", ");
    const street = [p.address_line1, p.address_line2].filter(Boolean).join(", ");
    lines.push(
      [
        csvCell(fullName),
        csvCell(plusOnes),
        csvCell(street),
        csvCell(p.city ?? ""),
        csvCell(p.state ?? ""),
        csvCell(p.postal_code ?? ""),
      ].join(",")
    );
  }

  const csv = lines.join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="guest-list.csv"`,
    },
  });
}
