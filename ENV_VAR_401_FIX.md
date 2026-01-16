# 401 Unauthorized エラーの解決方法

## 問題

画像から確認できる問題：
- ✅ 環境変数が設定されていない（「環境変数の設定: × エラー」）
- ✅ 401 Unauthorized エラーが大量発生
- ✅ Supabase接続が失敗している

## 原因

Vercelの環境変数が正しく設定されていない、または再デプロイが実行されていない可能性があります。

## 解決方法

### ステップ1: Vercelで環境変数を確認

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト `alert` を選択
3. 「Settings」→「Environment Variables」に移動
4. 以下の2つの環境変数が存在するか確認：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### ステップ2: 環境変数が存在しない場合

環境変数を追加してください：

**1つ目:**
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://hcceyhmisbmclqrgfedr.supabase.co`
- Environment: Production, Preview, Development すべて

**2つ目:**
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw`
- Environment: Production, Preview, Development すべて

### ステップ3: 再デプロイ（重要！）

環境変数を追加・変更した後は、**必ず再デプロイ**が必要です：

1. 「Deployments」タブに移動
2. 最新のデプロイメントの「...」メニューをクリック
3. 「Redeploy」を選択
4. 「Redeploy」ボタンをクリック
5. デプロイが完了するまで待つ（通常1-2分）

### ステップ4: 確認

再デプロイ後：

1. デプロイされたURLにアクセス
2. `/test-connection` ページにアクセス
3. 「接続テストを実行」ボタンをクリック
4. 以下のように表示されればOK：
   - ✅ 環境変数の設定: 正常
   - ✅ Supabase接続: 成功

## よくある問題

### 問題1: 環境変数を設定したが、まだエラーが出る

**解決方法**: 再デプロイを実行してください。環境変数を追加・変更した後は、必ず再デプロイが必要です。

### 問題2: 環境変数の値が間違っている

**解決方法**: 以下を確認してください：
- `NEXT_PUBLIC_SUPABASE_URL`: `https://hcceyhmisbmclqrgfedr.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseダッシュボードの「Settings」→「API」で確認

### 問題3: 環境変数が一部の環境にしか設定されていない

**解決方法**: Production, Preview, Development **すべて**にチェックを入れてください。

## 確認方法

### ブラウザのコンソールで確認

1. F12キーを押してDevToolsを開く
2. 「Console」タブを確認
3. 401エラーが消えているか確認

### アプリケーションで確認

1. `/test-connection` ページで接続テストを実行
2. 「環境変数の設定: ✅ 正常」と表示されればOK

---

**重要**: 環境変数を設定した後は、必ず再デプロイを実行してください！




