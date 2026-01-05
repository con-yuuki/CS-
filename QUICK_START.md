# クイックスタートガイド

## 現在の状況

ブラウザで確認できない場合、以下の手順で確認してください。

## ステップ1: 環境変数の設定（必須）

`.env.local` ファイルを開いて、実際のSupabase認証情報を設定してください。

### 現在の問題
- 環境変数がテンプレート値（`your-project.supabase.co`）のままです
- これが原因でSupabaseに接続できません

### 設定方法

1. **Supabase Dashboard で認証情報を取得**
   - https://app.supabase.com にアクセス
   - プロジェクトを選択
   - Settings → API を開く
   - 以下の3つの値をコピー：
     - Project URL
     - anon public key
     - service_role key

2. **`.env.local` ファイルを編集**
   
   プロジェクトのルートディレクトリ（`/Users/yuuki.takada/Desktop/CSアラート機能/.env.local`）を開いて、以下のように設定：

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://あなたのプロジェクトID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのanonキー
   SUPABASE_SERVICE_ROLE_KEY=あなたのservice_roleキー
   ```

   **重要:**
   - `https://` で始まること
   - 値の前後にスペースを入れない
   - 引用符は不要

3. **ファイルを保存**

## ステップ2: サーバーの起動

ターミナルで以下のコマンドを実行：

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
npm run dev
```

サーバーが起動すると、以下のメッセージが表示されます：

```
✓ Ready in XXXXms
- Local:        http://localhost:3000
```

## ステップ3: ブラウザでアクセス

1. ブラウザで以下のURLを開く：
   - http://localhost:3000
   - または http://127.0.0.1:3000

2. ホームページが表示されれば成功です

## ステップ4: 接続テスト

1. ホームページの「🔍 Supabase接続テスト」ボタンをクリック
2. または直接 http://localhost:3000/test-connection にアクセス
3. 「接続テストを実行」ボタンをクリック
4. すべての項目が緑色のチェックマークになれば成功です

## トラブルシューティング

### 問題1: "接続が拒否されました"

**原因:** サーバーが起動していない

**解決方法:**
```bash
# サーバーが起動しているか確認
lsof -ti:3000

# 起動していない場合
npm run dev
```

### 問題2: "ERR_NAME_NOT_RESOLVED"

**原因:** 環境変数がテンプレート値のまま

**解決方法:**
1. `.env.local` ファイルを開く
2. 実際のSupabase認証情報に置き換える
3. サーバーを再起動（Ctrl+C で停止 → `npm run dev`）

### 問題3: ページは表示されるがエラーが出る

**原因:** 環境変数は設定されているが、データベーススキーマが適用されていない

**解決方法:**
1. Supabase Dashboard → SQL Editor
2. `lib/supabase/migrations/001_initial_schema.sql` の内容をコピー
3. SQL Editor に貼り付けて「Run」をクリック

### 問題4: ブラウザのキャッシュの問題

**解決方法:**
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

または、シークレットモード（プライベートブラウジング）で開く

## 確認チェックリスト

- [ ] `.env.local` に実際のSupabase認証情報が設定されている
- [ ] 開発サーバーが起動している（`npm run dev`）
- [ ] ブラウザで `http://localhost:3000` にアクセスできる
- [ ] ホームページが表示される
- [ ] 接続テストで全ての項目が緑色

## 次のステップ

設定が完了したら：

1. **データインポート** (`/import`)
   - Excel/CSVファイルからデータをインポート

2. **ダッシュボード** (`/dashboard`)
   - スコア一覧を確認

3. **トレンド分析** (`/trends`)
   - 企業別のスコア推移を確認

## サポート

問題が解決しない場合：

1. ターミナルのエラーメッセージを確認
2. ブラウザの開発者ツール（F12）のコンソールでエラーを確認
3. エラーメッセージを共有していただければ、具体的な解決方法を提案します

