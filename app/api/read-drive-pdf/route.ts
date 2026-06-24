export const runtime = "nodejs";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { summarizePdf } from "../../../library/open_ai/summarizePdf";
import { createClient } from "@supabase/supabase-js";
import { upload_supabase } from "../../../library/upload_supabase/upload_supabase";
import { download_supabase } from "../../../library/download_supabase/download_supabase";
import {logger} from "../../../library/logger/logger"
import { notifySlack } from "../../../library/slack/notifyslack";
import { sentReportMail } from "../../../library/sent_gmail/sent_gmail";

//open aiにpdfファイルを読み込ませる
export async function GET(request: Request) {

  try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "");

      const { searchParams } = new URL(request.url);
      const i = Number(
      searchParams.get("i")
  );


     const {fileName,origin} =await download_supabase(i); // supabaseにあるstorageからデータを取得する
    
    // 追加: AI要約前に同じPDFが既に登録済みか確認
    // pdf_path が既に reports に存在する場合、OpenAI APIを呼ばずにスキップする
    const { data: existingReport, error: existingError } = await supabase
      .from("reports")
      .select("id")
      .eq("pdf_path", fileName)
      .limit(1)

    if (existingError) {
      throw existingError;
    }

    if (existingReport) {
      logger.info(`PDF ${fileName} は既に要約済みです`);

      return NextResponse.json({
        success: true,
        skipped: true,
        message: "既に要約済みのPDFのため処理をスキップしました",
      });
    }
     const summary = await summarizePdf(fileName,origin);
     console.log("summarizepdfまでは終わった")
    
    if(summary.error){
       return NextResponse.json(
      {
        error: String(summary.error),
      },
       );
    }

     await upload_supabase(fileName,summary);

    //  await sentReportMail(summary); //メール送信する関数

    //  slackの通知だけ別のtry分に書く
    // try{
    //  await notifySlack(`PDFの要約処理が完了しました。i=${i}`)
    // }catch(slackError){
    //   logger.error(slackError,"slack通知に失敗しました")
    // }
    // slack通知だけ別のtyr分に書く

  // }

    return NextResponse.json(
      {
        success: true, //これは現時点で使っていない
        summary: summary.ai_summary,
      });
  } catch (error) {
    return NextResponse.json(
      {
        error: String(error),
      },
      { status: 500 }
    );
    
  }
}

//open aiにpdfファイルを読み込ませる
