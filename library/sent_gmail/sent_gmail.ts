import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { Buffer } from "buffer";

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

  const { data: pdfFile, error: pdfError } =
    await supabase.storage
      .from("origin_pdf_save")
      .download(`2026_6/${data.pdf_path}`)

  if (pdfError || !pdfFile) {
    throw new Error(
      "PDF取得失敗: " + pdfError?.message
    );
  }

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
     to: data.mailaddress, //こっちは本番環境、練習では自分のメールアドレスでやってください。許可があるまでこれは使わない
    // to :process.env.GMAIL_USER,
    subject:  `${data.subject_mail}`,
    text: data.ai_summary,

    attachments: [
      {
        filename: `${data.subject_mail}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}