import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getYearMonthFolder } from "../../../library/get_date/get_date";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  // 追加: Storage内の今月PDF件数を取得(森)
  const nowyear = getYearMonthFolder();

  const { data: files, error: storageError } = await supabase.storage
    .from("origin_pdf_save")
    .list(nowyear);
    console.log("report-counts folder =", nowyear);
  if (storageError) {
    return NextResponse.json(
      { error: storageError.message },
      { status: 500 }
    );
  }

  const pdfCount = (files ?? []).filter((file) =>
    file.name.toLowerCase().endsWith(".pdf")
  ).length;

  // 追加: 未送信件数を取得(森)
  const { count: unsentCount, error: unsentError } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("sent", false);

  if (unsentError) {
    return NextResponse.json(
      { error: unsentError.message },
      { status: 500 }
    );
  }

  // 追加: 送信済み件数を取得(森)
  const { count: sentCount, error: sentError } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("sent", true);

  if (sentError) {
    return NextResponse.json(
      { error: sentError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    pdfCount,
    unsentCount,
    sentCount,
  });
}