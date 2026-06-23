import { createClient } from "@supabase/supabase-js";
import MailItem from "./MailItem";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

export default async function MailListPage() {
  const { data, error } = await supabase
    .from("reports")
    .select("id, ai_summary, mailaddress");

  if (error) {
    return <div>取得失敗: {error.message}</div>;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>メール未送信一覧</h1>
      {data?.map((item) => (
        <MailItem key={item.id} item={item} />
      ))}
    </main>
  );
}
