export default function SentMail({ item }: { item: any }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 16, marginTop: 16 }}>
      <p>送信先: {item.mailaddress}</p>

      <pre style={{ whiteSpace: "pre-wrap" }}>{item.ai_summary}</pre>
    </div>
  );
}