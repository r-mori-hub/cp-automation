"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logger } from "../library/logger/logger";

export default function Home() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const url = "/api/read-drive-pdf";
  const pdf_number = 3;

  async function run() {
    try {
      // reactのルール、loadingで情報をつけ足してsummaryに入っていく
      setLoading(true);
      setSummary("");

      for (let i = 0; i < pdf_number; i++) {
        const res = await fetch(`${url}?i=${i}`);

        if (!res.ok) {
          throw new Error(`Https error:${res.status}`);
        }

        const data = await res.json();

        if (data.summary) {
          setSummary((prev) => `${prev}\n\n--- PDF ${i + 1} ---\n${data.summary}`);
        } else if (data.error) {
          setSummary((prev) => `${prev}\n\n--- PDF ${i + 1} ---\n${data.error}`);
        } else {
          setSummary((prev) => `${prev}\n\n--- PDF ${i + 1} ---\n結果がありません`);
        }
      }
    } catch (error) {
      logger.error(error, "ユーザー取得処理失敗");
      setSummary("PDFの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>PDF要約アプリ</h1>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={run} disabled={loading}>
          {loading ? "実行中..." : "PDF要約を実行"}
        </button>

        <button onClick={() => router.push("/mail_list")}>
          メール確認画面
        </button>
      </div>

      <pre style={{ whiteSpace: "pre-wrap", marginTop: 24 }}>
        {summary}
      </pre>
    </main>
  );
}