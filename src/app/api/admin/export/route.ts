import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import {
  getSupabase,
  isSupabaseConfigured,
  RSVP_TABLE,
  type RSVP,
} from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  // Escape quotes; wrap in quotes if it contains comma/quote/newline.
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(RSVP_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as RSVP[];
  const header = [
    "First name",
    "Last name",
    "Email",
    "Attending",
    "Party size",
    "Note",
    "Received",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvCell(r.first_name),
        csvCell(r.last_name),
        csvCell(r.email),
        csvCell(r.attending ? "Yes" : "No"),
        csvCell(r.attending ? r.party_size : 0),
        csvCell(r.note ?? ""),
        csvCell(r.created_at),
      ].join(",")
    );
  }

  const csv = lines.join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rsvps.csv"`,
    },
  });
}
