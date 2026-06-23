import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { id, ai_summary } = await req.json();

  console.log("受け取ったid:", id);
  console.log("受け取ったai_summary:", ai_summary);

  const { error } = await supabase
    .from("reports")
    .update({ ai_summary })
    .eq("id", id);

  console.log("Supabase error:", error);
  console.log("SERVICE_ROLE exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log("KEY starts:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}