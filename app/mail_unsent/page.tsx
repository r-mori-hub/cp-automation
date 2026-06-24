import { createClient } from "@supabase/supabase-js";
import UnsentMail from "../mail_list/UnsentMail";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

export default async function MailUnsentPage() {
  const { data, error } = await supabase
    .from("reports")
    .select("id, ai_summary, mailaddress, sent, companyname, report_month")
    // 追加: 未送信メールだけ取得
    .eq("sent", false);

  if (error) {
    return <div>取得失敗: {error.message}</div>;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>未送信一覧</h1>
        <a href="/">トップに戻る</a>
      {/* 追加: sent=false のメールだけ表示 */}
      {data?.map((item) => (
        <UnsentMail key={item.id} item={item} />
      ))}
      
    </main>
  );
}