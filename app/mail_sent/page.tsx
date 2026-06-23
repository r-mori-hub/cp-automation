import { createClient } from "@supabase/supabase-js";
import SentMail from "../mail_list/SentMail";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

export default async function MailSentPage() {
  const { data, error } = await supabase
    .from("reports")
    .select("id, ai_summary, mailaddress, sent")
    // 追加: 送信済みメールだけ取得
    .eq("sent", true);

  if (error) {
    return <div>取得失敗: {error.message}</div>;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>送信済み一覧</h1>
      <a href="/">トップに戻る</a>

      {/* 追加: sent=true のメールだけ表示 */}
      {data?.map((item) => (
        <SentMail key={item.id} item={item} />
      ))}
    </main>
  );
}