# 環境変数の設定方法

## エラー: `ERR_NAME_NOT_RESOLVED` について

このエラーは、`.env.local` ファイルにテンプレート値（`your-project.supabase.co`）が残っているために発生しています。

## 解決方法

### ステップ1: Supabase認証情報を取得

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. プロジェクトを選択
3. 左メニューの「Settings」→「API」をクリック
4. 以下の情報をコピー：

   - **Project URL**
     - 例: `https://abcdefghijklmnop.supabase.co`
     - これを `NEXT_PUBLIC_SUPABASE_URL` に設定

   - **anon public** key
     - 例: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTIwMiwiZXhwIjoxOTMxODE1MjAyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
     - これを `NEXT_PUBLIC_SUPABASE_ANON_KEY` に設定

   - **service_role** key（秘密鍵 - 注意して扱う）
     - 例: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MjAyLCJleHAiOjE5MzE4MTUyMDJ9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`
     - これを `SUPABASE_SERVICE_ROLE_KEY` に設定

### ステップ2: .env.local ファイルを編集

プロジェクトのルートディレクトリにある `.env.local` ファイルを開き、以下のように実際の値を設定してください：

```env
NEXT_PUBLIC_SUPABASE_URL=https://あなたのプロジェクトID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのanonキー
SUPABASE_SERVICE_ROLE_KEY=あなたのservice_roleキー
```

**重要:**
- `https://` で始まる必要があります
- 値の前後に余分なスペースや引用符を入れないでください
- 各値は1行で記述してください

### ステップ3: 開発サーバーを再起動

環境変数を変更した後は、**必ず開発サーバーを再起動**してください：

```bash
# サーバーを停止（Ctrl+C を押すか、別のターミナルで）
pkill -f 'next dev'

# サーバーを再起動
npm run dev
```

### ステップ4: 確認

1. ブラウザで `http://localhost:3000/test-connection` にアクセス
2. 「接続テストを実行」ボタンをクリック
3. すべての項目が緑色のチェックマークになれば成功です

## 設定例

正しい設定例：

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTIwMiwiZXhwIjoxOTMxODE1MjAyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MjAyLCJleHAiOjE5MzE4MTUyMDJ9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

**間違った設定例（テンプレート値のまま）:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co  ❌
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here  ❌
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  ❌
```

## トラブルシューティング

### エラーが続く場合

1. `.env.local` ファイルの内容を再確認
2. 開発サーバーを完全に再起動
3. ブラウザのキャッシュをクリア（Cmd+Shift+R または Ctrl+Shift+R）
4. ブラウザの開発者ツール（F12）のコンソールでエラーを確認

### 環境変数が読み込まれない場合

1. ファイル名が `.env.local` であることを確認（`.env` ではない）
2. ファイルがプロジェクトのルートディレクトリにあることを確認
3. 開発サーバーを再起動

