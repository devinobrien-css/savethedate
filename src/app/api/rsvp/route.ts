import { NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured, RSVP_TABLE } from "@/lib/supabase";

export const runtime = "nodejs";

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "RSVP storage is not configured yet." },
      { status: 503 }
    );
  }

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const firstName = str(data.get("firstName"));
  const lastName = str(data.get("lastName"));
  const email = str(data.get("email"));
  const attendingRaw = str(data.get("attending"));
  const note = str(data.get("note"));
  const partySize = Math.max(0, Math.min(20, parseInt(str(data.get("guests")) || "0", 10) || 0));

  // Validation
  if (!firstName || !lastName) {
    return NextResponse.json({ error: "Please include your name." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Please include a valid email." }, { status: 400 });
  }
  if (attendingRaw !== "yes" && attendingRaw !== "no") {
    return NextResponse.json({ error: "Please let us know if you can join." }, { status: 400 });
  }
  const attending = attendingRaw === "yes";

  try {
    const supabase = getSupabase();
    const { error } = await supabase.from(RSVP_TABLE).insert({
      first_name: firstName,
      last_name: lastName,
      email,
      attending,
      party_size: attending ? Math.max(1, partySize) : 0,
      note: note || null,
    });
    if (error) {
      console.error("RSVP insert failed:", error.message);
      return NextResponse.json(
        { error: "Something went wrong saving your response." },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error("RSVP route error:", e);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
