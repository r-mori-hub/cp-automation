import OpenAI from "openai";
import {logger} from "../../library/logger/logger"
import fs from "fs";
import path from "path";
import { Buffer } from "buffer";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



export async function summarizePdf(fileName:string ,origin: Blob) {
  try {

    // filenameをもとに戻す
  const encoded = fileName.replace(/\.pdf$/i, "");

  const base64 = encoded
    .replace(/-/g, "+")
    .replace(/_/g, "/");

    const decodedName = Buffer
    .from(base64, "base64")
    .toString("utf-8");
  // filenameをもとに戻す
   
  // macアドレス抽出
  const remac=decodedName.slice(0,12)
  // 会社名抽出
  const recompanyname=  decodedName.match(
  /lkjhg_(.*?)qwert_/
)?.[1];
// 部門名抽出
    const departmentname=  decodedName.match(
  /qwert_(.*?)poiuy_/
)?.[1]; 

// 送信日確定
const month = decodedName.match(
  /_asdfgh(.*?)lkjhg_/
)?.[1] ?? "";

// メールアドレス抽出 本番はこっち
  // const reemail= decodedName.match(
  //   /poiuy_(.*?)\.pdf/
  // )?.[1];
  const reemail = "r-mori@rem2525.com";

  // 件名確定
  const subject_mail = departmentname
  ? `${month}_${recompanyname}様_${departmentname}分`
  : `${month}_${recompanyname}様`;
// filenameから会社名などの取り出し官僚

 console.log(subject_mail,"ここはデータベースに入れる変数")


    const arrayBuffer = await origin.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfPath = path.join("/tmp", "origin.pdf");

    fs.writeFileSync(pdfPath, buffer);

    const file = await client.files.create({
      file: fs.createReadStream(pdfPath),
      purpose: "user_data",
    });

    if (!file.id) {
      throw new Error("アップロード失敗");
    }

    logger.info(`アップロード成功 file_id=${file.id}`);

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_file",
              file_id: file.id,
            },
            {
              type: "input_text",
              text: 
              `

              このPDFを解析して、以下のJSONのみを出力してください。
              数値項目はPDFから読み取ってください。(0の部分を)
              説明文やコードブロックは不要です。
            

{
  "ai_summary": "",
  "customer_id": 11,
  "report_month": "${month}",
  "pdf_path": "${fileName}",
  "av_count": 0 ,
  "ips_count": 0,
  "bot_count": 0,
  "infected_Hosts": 0,
  "trafficGb_gb" : 0,
 "macaddress": "${remac}",
  "mailaddress": "${reemail}",
  "companyname": "${recompanyname}",
  "departmentname": "${departmentname}"
   "subject_mail": "${subject_mail}"
  }


顧客にgmailを書きます。以下のことを端的にまとめたメール文章を書いてください
ai_summaryにそのメール文章をそのまま挿入してください


顧客向け月次セキュリティレポートを作成してください。
専門用語を減らし、非エンジニアにも分かる文章にしてください。
この機器が防いだ脅威と、防げなかった場合に想定されるリスクを説明してください。


comanynameは会社名だから、以下のように書き出してください。
${recompanyname}様 
いつもお世話になっております。
ニコニコテクノサービスでございます。

              `,
            },
          ],
        },
      ],
    });

    return JSON.parse(response.output_text);
  } catch (error) {
    logger.error(error);
    throw error;
  }
}
