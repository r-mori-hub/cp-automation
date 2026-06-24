"use client";

import { useState } from "react";

export default function UnsentMail({ item }: { item: any }) {
  const [summary, setSummary] = useState(item.ai_summary);

  const handleUpdate = async () => {

    // 誤更新防止の確認ポップアップ(森)
    const confirmUpdate = window.confirm(`${item.companyname}様の${item.report_month}分のレポートを更新します。よろしいですか？`);
    if (!confirmUpdate) {
      return; // ユーザーがキャンセルした場合、更新処理を中止
    }
    const res = await fetch("/api/update-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, ai_summary: summary }),
    });

    if (res.ok) {
      alert("更新しました");
    } else {
      const text = await res.text();
      console.log(text);
      alert("更新失敗: " + text);
    }
  };

  const handleSend = async () => {

    // 誤送信防止の確認ポップアップ(森)
    const confirmSend = window.confirm(`${item.companyname}様の${item.report_month}分のメールを ${item.mailaddress} に送信します。よろしいですか？`);
    if (!confirmSend) {
      return; // ユーザーがキャンセルした場合、送信処理を中止
    }
    
    const res = await fetch("/api/send-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });

    if (res.ok) {
      alert("送信しました");
      window.location.reload();
    } else {
      alert("送信失敗");
    }
  };

  return (
    <div style={{border: "1px solid #ddd", borderRadius: 12, padding: 20, marginTop: 20, }}>
      <h3>{item.companyname}</h3>
      <p>
        <strong>対象月:</strong> {item.report_month}
      </p>
      <p>
        <strong>送信先:</strong> {item.mailaddress}
      </p>

      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        rows={20}
        style={{ width: "100%" }}
      />
      <a href={`/api/preview-pdf?id=${item.id}`} target="_blank" rel="noopener noreferrer">
        <button type="button">PDFプレビュー</button>
      </a>

      <button onClick={handleUpdate} style={{ marginLeft: 8 }}>
        内容を更新
      </button>
      <button onClick={handleSend} style={{ marginLeft: 8 }}>
        メール送信
      </button>
    </div>
  );
}