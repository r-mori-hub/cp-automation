import { createClient } from "@supabase/supabase-js";
import SentMailItem from "./SentMail";
import UnsentMailItem from "./UnsentMail";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

export default async function MailListPage() {
  const { data, error } = await supabase
    .from("reports")
    .select("id, ai_summary, mailaddress, sent");

  if (error) {
    return <div>取得失敗: {error.message}</div>;
  }

  // 追加: sentで未送信データだけ抽出
  const unsentItems = data?.filter((item) => item.sent === false);
  // 追加: sentで送信済みデータだけ抽出
  const sentItems = data?.filter((item) => item.sent === true);

  return (
    <main style={{ padding: 24 }}>
      <h1>メール未送信一覧</h1>

      {/* MailItem-> UnsetMailItemに変更 */}
      {unsentItems?.map((item) => (
        <UnsentMailItem key={item.id} item={item} />
      ))}

      {/*送信済み一覧 */}
      <h1 style={{marginTop: 40}}>
        メール送信済み一覧
      </h1>

      {/* sent=trueのデータ表示 */}
      {sentItems?.map((item) => (
        <SentMailItem key={item.id} item={item} />
      ))}
    </main>
  );
}
