# CS Health Score Dashboard セットアップガイド

## ステップ1: 依存関係のインストール ✅

```bash
npm install
```

**完了しました！** 454個のパッケージがインストールされました。

---

## ステップ2: Supabase プロジェクトの作成

1. [Supabase](https://supabase.com) にアクセスしてアカウントを作成（またはログイン）
2. 「New Project」をクリック
3. プロジェクト名、データベースパスワード、リージョンを設定
4. プロジェクトが作成されるまで待機（数分かかります）

---

## ステップ3: 環境変数の設定

### 3.1 Supabase の認証情報を取得

1. Supabase ダッシュボードでプロジェクトを開く
2. 左メニューの「Settings」→「API」をクリック
3. 以下の情報をコピー：
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** key (`SUPABASE_SERVICE_ROLE_KEY`) - 注意: これは秘密鍵です

### 3.2 .env.local ファイルを作成

プロジェクトのルートディレクトリに `.env.local` ファイルを作成し、以下の形式で記入：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**重要**: `.env.local` ファイルは Git にコミットしないでください（既に `.gitignore` に含まれています）

---

## ステップ4: データベーススキーマの適用

### 方法1: Supabase Dashboard の SQL Editor を使用（推奨）

1. Supabase ダッシュボードでプロジェクトを開く
2. 左メニューの「SQL Editor」をクリック
3. 「New query」をクリック
4. 以下のファイルの内容をコピー&ペースト：
   - `lib/supabase/migrations/001_initial_schema.sql`
5. 「Run」ボタンをクリックして実行
6. 成功メッセージが表示されることを確認

### 方法2: Supabase CLI を使用（上級者向け）

```bash
# Supabase CLI をインストール（未インストールの場合）
npm install -g supabase

# Supabase にログイン
supabase login

# プロジェクトをリンク
supabase link --project-ref your-project-ref

# マイグレーションを適用
supabase db push
```

---

## ステップ5: 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

---

## ステップ6: 動作確認

### 6.1 ホーム画面の確認

- [http://localhost:3000](http://localhost:3000) にアクセス
- 3つのカード（インポート、ダッシュボード、トレンド分析）が表示されることを確認

### 6.2 データインポートのテスト

1. `/import` ページにアクセス
2. テスト用の Excel/CSV ファイルを準備（以下の形式）：
   ```
   テナントID, 企業名, ログイン回数, 見積作成数, 工事登録数, Active率
   1, テスト企業, 10, 5, 3, 25
   ```
3. ファイルをドラッグ&ドロップ
4. 「インポート実行」をクリック

### 6.3 ダッシュボードの確認

1. `/dashboard` ページにアクセス
2. インポートしたデータが表示されることを確認
3. 検索・フィルタリング機能をテスト

### 6.4 トレンド分析の確認

1. `/trends` ページにアクセス
2. 企業を選択してスコア推移グラフを表示

---

## トラブルシューティング

### エラー: "Missing Supabase environment variables"

- `.env.local` ファイルが正しく作成されているか確認
- 環境変数の値が正しいか確認
- 開発サーバーを再起動

### エラー: "relation does not exist"

- データベーススキーマが正しく適用されているか確認
- Supabase の SQL Editor でテーブルが作成されているか確認

### エラー: "permission denied"

- Supabase の Row Level Security (RLS) ポリシーを確認
- マイグレーションファイルが正しく実行されているか確認

---

## 次のステップ

- 実際のデータをインポート
- カスタマイズ（UI、ロジックなど）
- 本番環境へのデプロイ（Vercel 推奨）

---

## サポート

問題が発生した場合は、以下を確認してください：
1. Supabase のログ（Dashboard → Logs）
2. ブラウザのコンソールエラー
3. ターミナルのエラーメッセージ

