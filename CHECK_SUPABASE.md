# Supabase連携確認ガイド

## ✅ 設定確認チェックリスト

### 1. 環境変数の確認

`.env.local` ファイルに以下の3つの環境変数が正しく設定されているか確認してください：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**確認方法:**
- `.env.local` ファイルを開く
- `your-project` や `your_anon_key` などのテンプレート値が残っていないか確認
- すべて実際のSupabaseの値になっているか確認

### 2. データベーススキーマの確認

Supabase ダッシュボードで以下のテーブルが作成されているか確認：

- ✅ `companies` テーブル
- ✅ `usage_logs` テーブル
- ✅ `health_scores` テーブル

**確認方法:**
1. Supabase ダッシュボード → Table Editor
2. 左側のテーブル一覧を確認

### 3. 接続テストの実行

#### 方法1: ブラウザで確認（推奨）

1. 開発サーバーを起動：
   ```bash
   npm run dev
   ```

2. ブラウザで以下にアクセス：
   ```
   http://localhost:3000/test-connection
   ```

3. 「接続テストを実行」ボタンをクリック

4. 結果を確認：
   - ✅ すべて緑色のチェックマーク → 設定完了！
   - ❌ 赤色のエラー → 以下を確認

#### 方法2: ターミナルで確認

開発サーバーを起動して、エラーメッセージを確認：

```bash
npm run dev
```

エラーが出る場合：
- `Missing Supabase environment variables` → 環境変数が設定されていません
- `relation does not exist` → データベーススキーマが適用されていません
- `permission denied` → RLSポリシーの問題

## 🔧 よくある問題と解決方法

### 問題1: 環境変数が読み込まれない

**解決方法:**
1. `.env.local` ファイルがプロジェクトのルートディレクトリにあるか確認
2. 開発サーバーを再起動（環境変数の変更後は必須）
3. ファイル名が `.env.local` であることを確認（`.env` ではない）

### 問題2: テーブルが存在しない

**解決方法:**
1. Supabase ダッシュボード → SQL Editor
2. `lib/supabase/migrations/001_initial_schema.sql` の内容をコピー
3. SQL Editor に貼り付けて「Run」をクリック
4. 成功メッセージを確認

### 問題3: RLSポリシーのエラー

**解決方法:**
マイグレーションファイルにはRLSポリシーが含まれていますが、正しく実行されていない可能性があります。

1. Supabase ダッシュボード → Authentication → Policies
2. 各テーブルにポリシーが作成されているか確認
3. なければ、マイグレーションファイルを再実行

### 問題4: 接続は成功するがデータが表示されない

**確認事項:**
1. データが実際にインポートされているか
2. `is_excluded` フラグが `false` になっているか
3. フィルタ条件が正しいか

## 📝 正しい設定の確認ポイント

✅ **環境変数**
- `NEXT_PUBLIC_SUPABASE_URL` が `https://` で始まる
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` が `eyJ` で始まる（JWT形式）
- `SUPABASE_SERVICE_ROLE_KEY` が `eyJ` で始まる（JWT形式）

✅ **データベース**
- 3つのテーブル（companies, usage_logs, health_scores）が存在
- 各テーブルにRLSポリシーが設定されている

✅ **接続テスト**
- `/test-connection` ページで全ての項目が緑色のチェックマーク

## 🚀 次のステップ

設定が正しく完了したら：

1. テストデータをインポート（`/import` ページ）
2. ダッシュボードで確認（`/dashboard` ページ）
3. トレンド分析を確認（`/trends` ページ）

問題がある場合は、エラーメッセージを確認して上記の解決方法を試してください。

