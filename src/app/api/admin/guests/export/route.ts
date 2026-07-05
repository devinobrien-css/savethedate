import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getAddressBook,
  guestExportRows,
  GUEST_EXPORT_HEADERS,
} from "@/lib/guests";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Always wrap in quotes (and escape inner quotes). Every field is emitted as a
// quoted string so the zip is a quoted "06897" rather than a bare number.
function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return `"${s.replaceAll('"', '""')}"`;
}

/**
 * Export the address book as a "guest list" CSV — one mailing line per party
 * (household): the envelope/household name as the full name, the plus-one
 * column left blank, and the party's mailing address split into columns.
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

  const lines = [GUEST_EXPORT_HEADERS.map(csvCell).join(",")];
  for (const r of guestExportRows(parties)) {
    lines.push(
      [r.fullName, r.plusOne, r.street, r.city, r.state, r.zip]
        .map(csvCell)
        .join(",")
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
