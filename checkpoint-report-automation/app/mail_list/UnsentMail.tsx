"use client";

import { useState } from "react";

export default function UnsentMail({ item }: { item: any }) {
  const [summary, setSummary] = useState(item.ai_summary);
  const [subject, setSubject] = useState(item.subject_mail ?? "");
  const [mailaddress, setMailaddress] = useState(item.mailaddress ?? "");

  const handleUpdate = async () => {
    const confirmUpdate = window.confirm(
      `${item.companyname}様の${item.report_month}分のレポートを更新します。よろしいですか？`
    );

    if (!confirmUpdate) {
      return;
    }

    const res = await fetch("/api/update-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        ai_summary: summary,
        subject_mail: subject,
        mailaddress: mailaddress,
      }),
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
    const confirmSend = window.confirm(
      `${item.companyname}様の${item.report_month}分のメールを ${mailaddress} に送信します。よろしいですか？`
    );

    if (!confirmSend) {
      return;
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
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
      }}
    >
      <h3>{item.companyname}</h3>

      <p>
        <strong>対象月:</strong> {item.report_month}
      </p>

      <div style={{ marginBottom: 12 }}>
        <label>
          <strong>件名</strong>
        </label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>
          <strong>送信先</strong>
        </label>
        <input
          value={mailaddress}
          onChange={(e) => setMailaddress(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        rows={20}
        style={{ width: "100%" }}
      />

      <a
        href={`/api/preview-pdf?id=${item.id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
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