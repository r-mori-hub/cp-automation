import { NextRequest, NextResponse } from "next/server";
import { sentReportMail } from "../../../library/sent_gmail/sent_gmail";

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  await sentReportMail(id);
  return NextResponse.json({ ok: true });
}