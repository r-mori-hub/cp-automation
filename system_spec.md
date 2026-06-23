# セキュリティレポート自動送付システム 仕様書

**作成日:** 2026年6月  
**ステータス:** 開発中（追加実装あり）  
**対象読者:** 追加実装担当エンジニア

---
## 0.共有事項
メールアドレスについて、鈴木のメールアドレス宛になっているが、森さんのメールアドレスに変更してやってください。


## 1. システム概要

顧客から受け取ったセキュリティレポートPDF（月次）をAIで自動要約し、顧客へメール送付するWebアプリケーション。

**運営会社:** ニコニコテクノサービス  
**技術スタック:** Next.js (App Router) / TypeScript / Supabase / OpenAI API / Gmail (nodemailer) / Slack Webhook

---

## 2. システム構成図

```
[オペレーター]
     │
     │ ブラウザ操作
     ▼
┌──────────────────────────────┐
│     Next.js フロントエンド    │
│  / (PDF要約実行画面)          │
│  /mail_list (メール確認画面)  │
└──────────────┬───────────────┘
               │ API呼び出し
               ▼
┌──────────────────────────────────────────────────────┐
│              Next.js API Routes                      │
│  GET  /api/read-drive-pdf   PDF取得〜要約〜DB保存     │
│  POST /api/send-mail        メール送信                │
│  POST /api/update-summary   AI要約文の手動編集保存│
└───┬──────────────┬──────────────────────┬────────────┘
    │              │                      │
    ▼              ▼                      ▼
┌────────┐  ┌───────────┐        ┌──────────────┐
│OpenAI  │  │ Supabase  │        │  Gmail SMTP  │
│ API    │  │ Storage   │        │ (nodemailer) │
│(要約)  │  │(PDFファイル│        └──────────────┘
└────────┘  │ 保存・取得)│
            │           │
            │ DB(reports│
            │  テーブル) │
            └───────────┘
                  │
                  ▼（処理完了通知）
            ┌──────────┐
            │  Slack   │
            │ Webhook  │
            └──────────┘
```

---

## 3. フォルダ構成と各ファイルの役割

```
my-app/
├── app/
│   ├── page.tsx                   # トップページ（PDF要約実行ボタン）
│   ├── mail_list/
│   │   ├── page.tsx               # メール一覧・送信管理画面（Server Component）
│   │   └── MailItem.tsx           # メール1件のUI（編集・送信ボタン付き Client Component）
│   └── api/
│       ├── read-drive-pdf/
│       │   └── route.ts           # メインAPI: PDF取得〜OpenAI要約〜Supabase保存〜Slack通知
│       ├── send-mail/
│       │   └── route.ts           # メール送信API（Supabaseからデータ取得してGmail送信）
│       └── update-summary/
│           └── route.ts           # AI要約テキストの手動修正をDBに保存するAPI
│
├── library/                       # 共通処理ライブラリ（外部サービス連携の共通化）
│   ├── download_supabase/
│   │   └── download_supabase.ts   # Supabase StorageからPDFをダウンロード
│   ├── upload_supabase/
│   │   └── upload_supabase.ts     # OpenAI解析結果をSupabase DBに保存
│   ├── open_ai/
│   │   └── summarizePdf.ts        # PDFをOpenAIに送信して要約・データ抽出
│   ├── sent_gmail/
│   │   └── sent_gmail.ts          # Supabase DBから取得してGmailでメール送信
│   ├── slack/
│   │   └── notifyslack.ts         # Slack Webhookへ通知
│   ├── get_date/
│   │   └── get_date.ts            # 現在の「年_月」文字列を返すユーティリティ
│   └── logger/
│       └── logger.ts              # pinoロガー（構造化ログ）
│
├── sample/
│   └── cp.pdf                     # テスト用サンプルPDF
└── package.json
```

---

## 4. データフロー（処理の流れ）

### 4-1. PDF要約バッチ処理（メイン処理）

```
① オペレーターが「PDF要約を実行」ボタンを押す
        ↓
② フロントエンド（page.tsx）がGET /api/read-drive-pdf?i=0,1,2... を順次呼び出す
        ↓
③ download_supabase.ts
   → Supabase Storage「origin_pdf_save/{年_月}/」フォルダのPDFファイル一覧を取得
   → i番目のPDFをダウンロード
        ↓
④ summarizePdf.ts
   → ファイル名をデコードして顧客情報（会社名・部門名・メールアドレス等）を抽出
   → PDFをOpenAI APIに送信
   → AIがPDF内のセキュリティ数値を読み取り、顧客向けメール文も生成
   → JSONで結果を返す
        ↓
⑤ upload_supabase.ts
   → Supabase DB（reportsテーブル）に解析結果を保存
        ↓
⑥ notifyslack.ts
   → Slack Webhookに「処理完了」通知
        ↓
⑦ フロントに要約テキストを返してUIに表示
```

### 4-2. メール送信処理

```
① オペレーターが /mail_list でAI生成メール文を確認・手動編集
        ↓
② 「内容を更新」→ POST /api/update-summary → DB更新
        ↓
③ 「メール送信」→ POST /api/send-mail
   → Supabase DBから対象レコード（要約文・送付先・PDF）を取得
   → Supabase StorageからPDFをダウンロード
   → nodemailerでGmail送信（本文＋PDF添付）
```

---

## 5. Supabase 構成

### Storage バケット

| バケット名 | 用途 |
|---|---|
| `origin_pdf_save` | 顧客から受け取ったPDFの保管場所 |

**フォルダ命名規則:** `{西暦}_{月}/` 例: `2026_6/`

### DB テーブル: `reports`

| カラム名 | 型 | 説明 |
|---|---|---|
| id | int | 主キー（自動採番） |
| customer_id | int | 顧客ID（現在は固定値11） |
| report_month | text | 対象月 例: `2506` |
| pdf_path | text | Storageのファイル名（エンコード済み） |
| av_count | int | ウイルス検知数 |
| ips_count | int | 不正侵入検知数 |
| bot_count | int | Bot検知数 |
| infected_hosts | int | 感染ホスト数 |
| traffic_gb | float | 通信量(GB) |
| ai_summary | text | AI生成のメール本文（手動編集可） |
| macaddress | text | 機器MACアドレス |
| mailaddress | text | 送信先メールアドレス |
| companyname | text | 会社名 |
| departmentname | text | 部門名 |
| subject_mail | text | メール件名 |
|sent | boolean|メール送信したかしていないか判定フラグ、将来的にはstatusテーブルに実装するつもり

### DB テーブル: `status` これはエラーが出たのでまだ実装したいないが将来的に実装するかも

| カラム名 | 型 | 説明 |
|---|---|---|
| id | int | 主キー（自動採番） |
| sent | bool | 送信したか指定中のフラグ判定 |
| status | int | 現在は数字だけ入れているが運用しないかも |
| report_id | int | reportsのidと一致しているここでデータベース同士をつなげる |

---

## 6. PDFファイル名の命名規則（重要）

Supabase Storageに保存するPDFのファイル名は、顧客情報をBase64エンコードした特殊な形式です。

**デコード後の内部フォーマット:**

```
{MACアドレス12桁}_asdfgh{月}lkjhg_{会社名}qwert_{部門名}poiuy_{メールアドレス}.pdf
```

**例（デコード後）:**
```
AABBCCDDEEFF_asdfgh2506lkjhg_ABC商事qwert_情報システム部poiuy_tanaka@abc.co.jp.pdf
```

この文字列全体をBase64エンコード（`+→-`, `/→_`）したものがファイル名になります。PDFアップロード時はこの命名規則に従ってください。

---

## 7. 環境変数

`.env.local` に以下を設定してください。

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxx

# Gmail（Googleアカウントのアプリパスワードを使用）
GMAIL_USER=your-account@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz

# ログレベル（任意）
LOG_LEVEL=info
```

---

## 8. 追加実装タスク（依頼事項）


#### TASK-001: 環境変数の新規設定対応　6つあります

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxx

# Gmail（Googleアカウントのアプリパスワードを使用）
GMAIL_USER=your-account@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz

#### TASK-002 メールを送信　未送信とで分ける

未送信にまず入って送信したら　送信済みに入るようにする。

この二点だけお願いします。



