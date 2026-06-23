import { createClient } from "@supabase/supabase-js";
import {logger} from "../logger/logger"
import { getYearMonthFolder } from "../get_date/get_date";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function download_supabase(i : number) {

const nowyear = getYearMonthFolder();

 const { data: files, error: listError } = await supabase.storage
  .from("origin_pdf_save")
  .list(nowyear);

if (listError) throw listError;

const pdfFiles = (files ?? []).filter((file: any) =>
  file.name.toLowerCase().endsWith(".pdf")
);
console.log(`downloadに入りました。i=${i}`);

const pdfFile = pdfFiles[i];
console.log(`pdfファイルの名前は=${pdfFile.name}`);

if (!pdfFile) {
  throw new Error("PDFファイルがありません");
}

const { data: pdfData, error: downloadError } = await supabase.storage
  .from("origin_pdf_save")
 .download(`${nowyear}/${pdfFile.name}`)

if (downloadError) throw downloadError;

return {
  fileName: pdfFile.name,
  origin: pdfData,
};
}