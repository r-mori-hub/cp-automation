import { NextRequest, NextResponse } from "next/server";
import { getReportPdf } from "../../../library/report_pdf/reportPdfService";


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "idが指定されていません" },
        { status: 400 }
      );
    }

    // 共通関数からPDFを取得
    const { pdfFile } = await getReportPdf(Number(id));

    const pdfBuffer = await pdfFile.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}