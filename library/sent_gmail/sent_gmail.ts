import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { Buffer } from "buffer";
import { getReportPdf } from "../report_pdf/reportPdfService";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function sentReportMail(id: number) {
  const { data, error } = await supabase
    .from("reports")
    .select(
      "ai_summary,mailaddress,pdf_path,subject_mail"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error(
      "データ取得失敗: " + error?.message
    );
  }

  const { pdfFile } = await getReportPdf(id);

  const pdfBuffer = Buffer.from(
    await pdfFile.arrayBuffer()
  );

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
      //to: data.mailaddress, //こっちは本番環境、練習では自分のメールアドレスでやってください。許可があるまでこれは使わない
      to :process.env.GMAIL_USER,
    subject:  `${data.subject_mail}`,
    text: data.ai_summary,

    attachments: [
      {
        filename: `${data.subject_mail}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  //mail送信ができたらsentをtrueにする処理(森)
  const { error: updateError } = await supabase
    .from("reports")
    .update({ sent: true })
    .eq("id", id);
  
  if (updateError) {
    throw new Error(
      "sent更新失敗: " + updateError.message
    );
  }
}