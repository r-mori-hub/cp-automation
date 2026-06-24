"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logger } from "../library/logger/logger";

export default function Home() {
  const [summary, setSummary] = useState("");

  // 追加: 件数表示用
  const [pdfCount, setPdfCount] = useState(0);
  const [unsentCount, setUnsentCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [currentPdf, setCurrentPdf] = useState(0);

  const router = useRouter();

  const url = "/api/read-drive-pdf";
  const pdf_number = 3;

  // 追加: トップ画面表示時に件数を取得
  useEffect(() => {
    const loadCounts = async () => {
      const res = await fetch("/api/report-counts");

      if (!res.ok) {
        return;
      }

      const data = await res.json();

      setPdfCount(data.pdfCount ?? 0);
      setUnsentCount(data.unsentCount ?? 0);
      setSentCount(data.sentCount ?? 0);
    };

    loadCounts();
  }, []);

  async function run() {
    let skippedCount = 0;

    try {
      setLoading(true);
      setSummary("");

      for (let i = 0; i < pdf_number; i++) {
        setCurrentPdf(i + 1);

        const res = await fetch(`${url}?i=${i}`);

        if (!res.ok) {
          throw new Error(`Https error:${res.status}`);
        }

        const data = await res.json();

        // 追加: 既に要約済みのPDFは画面表示せず、件数だけ数える
        if (data.skipped) {
          skippedCount++;
          continue;
        }

        if (data.summary) {
          setSummary((prev) => `${prev}\n\n--- PDF ${i + 1} ---\n${data.summary}`);
        } else if (data.error) {
          setSummary((prev) => `${prev}\n\n--- PDF ${i + 1} ---\n${data.error}`);
        } else {
          setSummary((prev) => `${prev}\n\n--- PDF ${i + 1} ---\n結果がありません`);
        }
      }

      if (skippedCount > 0) {
        alert(`${skippedCount}件は既に要約済みのためスキップしました`);
      }
    } catch (error) {
      logger.error(error, "ユーザー取得処理失敗");
      setSummary("PDFの読み込みに失敗しました");
    } finally {
      setLoading(false);
      setCurrentPdf(0);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      {/* 追加: AI要約実行中の画面ロック */}
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 40,
              borderRadius: 12,
              border: "1px solid #ddd",
              minWidth: 320,
              textAlign: "center",
            }}
          >
            <h2>AI要約実行中...</h2>

            <p style={{ fontSize: 18 }}>
              PDF {currentPdf} / {pdf_number} を処理しています
            </p>

            <p style={{ marginTop: 20 }}>
              完了までお待ちください
            </p>
          </div>
        </div>
      )}

      <h1>cp月次レポート管理システム</h1>

      {/* 追加: ダッシュボード件数表示 */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div style={{ border: "1px solid #ddd", padding: 16 }}>
          <strong>今月PDF取込数</strong>
          <p>{pdfCount}件</p>
        </div>

        <div style={{ border: "1px solid #ddd", padding: 16 }}>
          <strong>未送信</strong>
          <p>{unsentCount}件</p>
        </div>

        <div style={{ border: "1px solid #ddd", padding: 16 }}>
          <strong>送信済み</strong>
          <p>{sentCount}件</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={run} disabled={loading}>
          {loading ? "実行中..." : "PDF要約を実行"}
        </button>

        <button onClick={() => router.push("/mail_unsent")} disabled={loading}>
          未送信画面
        </button>

        <button onClick={() => router.push("/mail_sent")} disabled={loading}>
          送信済み画面
        </button>
      </div>

      <pre style={{ whiteSpace: "pre-wrap", marginTop: 24 }}>
        {summary}
      </pre>
    </main>
  );
}