# Supabase接続エラーの修正方法

## 🔴 現在の問題

環境変数がテンプレート値のままです：
- `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co` ❌
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here` ❌
- `SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here` ❌

これが原因でSupabaseに接続できません。

## ✅ 解決方法

### ステップ1: Supabase認証情報を取得

1. **Supabase Dashboard にアクセス**
   - https://app.supabase.com を開く
   - プロジェクトを選択（または新規作成）

2. **認証情報を取得**
   - 左メニューの「Settings」（⚙️）をクリック
   - 「API」をクリック
   - 以下の3つの値をコピー：

   #### ① Project URL
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   - 「Project URL」の下に表示されています
   - 例: `https://abcdefghijklmnop.supabase.co`

   #### ② anon public key
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   - 「Project API keys」セクションの「anon public」の値をコピー
   - `eyJ` で始まる長い文字列です

   #### ③ service_role key
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   - 「Project API keys」セクションの「service_role」の値をコピー
   - ⚠️ **注意**: これは秘密鍵です。他人に共有しないでください
   - `eyJ` で始まる長い文字列です

### ステップ2: .env.local ファイルを編集

1. **ファイルを開く**
   - プロジェクトのルートディレクトリにある `.env.local` を開く
   - パス: `/Users/yuuki.takada/Desktop/CSアラート機能/.env.local`

2. **値を置き換える**

   現在の内容：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

   実際の値に置き換える：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://あなたがコピーしたProjectURL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたがコピーしたanonキー
   SUPABASE_SERVICE_ROLE_KEY=あなたがコピーしたservice_roleキー
   ```

   **例:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTIwMiwiZXhwIjoxOTMxODE1MjAyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MjAyLCJleHAiOjE5MzE4MTUyMDJ9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
   ```

3. **ファイルを保存**
   - 保存（Cmd+S または Ctrl+S）

### ステップ3: 開発サーバーを再起動

環境変数を変更した後は、**必ずサーバーを再起動**してください。

1. **現在のサーバーを停止**
   - ターミナルで `Ctrl + C` を押す
   - または、別のターミナルで：
     ```bash
     pkill -f 'next dev'
     ```

2. **サーバーを再起動**
   ```bash
   npm run dev
   ```

### ステップ4: 接続テストを再実行

1. ブラウザで http://localhost:3000/test-connection にアクセス
2. 「接続テストを実行」ボタンをクリック
3. 結果を確認：
   - ✅ すべて緑色のチェックマーク → 成功！
   - ❌ まだエラーが出る → 以下を確認

## 🔍 よくある問題

### 問題1: 環境変数が読み込まれない

**確認事項:**
- ファイル名が `.env.local` であること（`.env` ではない）
- ファイルがプロジェクトのルートディレクトリにあること
- サーバーを再起動したこと

**解決方法:**
```bash
# サーバーを完全に停止
pkill -f 'next dev'

# サーバーを再起動
npm run dev
```

### 問題2: 値の形式が間違っている

**確認事項:**
- `NEXT_PUBLIC_SUPABASE_URL` は `https://` で始まること
- 値の前後にスペースや引用符がないこと
- 各値が1行で記述されていること

**間違った例:**
```env
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"  ❌ 引用符不要
NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co  ❌ スペース不要
```

**正しい例:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co  ✅
```

### 問題3: データベーススキーマが適用されていない

環境変数は正しいが、テーブルが存在しない場合：

1. Supabase Dashboard → SQL Editor
2. `lib/supabase/migrations/001_initial_schema.sql` の内容をコピー
3. SQL Editor に貼り付けて「Run」をクリック
4. 成功メッセージを確認

## ✅ 成功の確認

接続テストで以下がすべて ✅ になれば成功です：

- ✅ 環境変数の設定: 正常
- ✅ Supabase接続: 成功
- ✅ companies テーブル: 存在
- ✅ usage_logs テーブル: 存在
- ✅ health_scores テーブル: 存在

## 📝 チェックリスト

- [ ] Supabase Dashboard で認証情報を取得した
- [ ] `.env.local` ファイルを開いた
- [ ] 3つの環境変数を実際の値に置き換えた
- [ ] ファイルを保存した
- [ ] 開発サーバーを再起動した
- [ ] 接続テストを実行した
- [ ] すべての項目が緑色のチェックマークになった

## 🆘 まだ解決しない場合

1. **エラーメッセージを確認**
   - ブラウザの開発者ツール（F12）→ Console タブ
   - ターミナルのエラーメッセージ

2. **Supabase Dashboard で確認**
   - Settings → API で認証情報が正しいか確認
   - Table Editor でテーブルが存在するか確認

3. **エラーメッセージを共有**
   - 具体的なエラーメッセージを共有していただければ、解決方法を提案します

