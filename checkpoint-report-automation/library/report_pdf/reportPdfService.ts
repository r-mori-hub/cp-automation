import { createClient } from "@supabase/supabase-js";
import { getYearMonthFolder } from "../get_date/get_date";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 追加: reports.id から添付対象PDFを取得する共通関数
// PDFプレビューとメール添付で同じPDFを参照するために使う
export async function getReportPdf(id: number) {
  const { data, error } = await supabase
    .from("reports")
    .select("pdf_path, subject_mail")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error("PDF情報の取得に失敗しました: " + error?.message);
  }

  const nowyear = getYearMonthFolder();
  const storagePath = `${nowyear}/${data.pdf_path}`;

  const { data: pdfFile, error: pdfError } = await supabase.storage
    .from("origin_pdf_save")
    .download(storagePath);

  if (pdfError || !pdfFile) {
    throw new Error("PDFファイルの取得に失敗しました: " + pdfError?.message);
  }

  return {
    pdfFile,
    pdfPath: data.pdf_path,
    subjectMail: data.subject_mail,
    storagePath,
  };
}