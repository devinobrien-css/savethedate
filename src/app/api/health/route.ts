import { NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured, RSVP_TABLE } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Health + keep-alive endpoint.
 *
 * Hit on a daily schedule (see vercel.json crons) so the free Supabase project
 * registers activity and never auto-pauses. Runs the cheapest possible query:
 * a head-only count, which returns no rows.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, db: "not-configured" });
  }
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from(RSVP_TABLE)
      .select("id", { count: "exact", head: true });
    if (error) {
      return NextResponse.json({ ok: false, db: "error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, db: "up" });
  } catch {
    return NextResponse.json({ ok: false, db: "error" }, { status: 500 });
  }
}
