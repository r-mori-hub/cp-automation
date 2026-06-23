"use client";

import { useState } from "react";

export default function MailItem({ item }: { item: any }) {
  const [summary, setSummary] = useState(item.ai_summary);

  const handleUpdate = async () => {
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
    const res = await fetch("/api/send-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });

    if (res.ok) {
      alert("送信しました");
    } else {
      alert("送信失敗");
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 16, marginTop: 16 }}>
      <pre style={{ whiteSpace: "pre-wrap" }}>{item.mailaddress}</pre>
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        rows={20}
        style={{ width: "100%" }}
      />
      <button onClick={handleUpdate}>内容を更新</button>
      <button onClick={handleSend} style={{ marginLeft: 8 }}>メール送信</button>
    </div>
  );
}



