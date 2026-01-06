# 環境変数が読み込まれない最終確認

## 確認できたこと

✅ 環境変数はVercelに正しく設定されています：
- `NEXT_PUBLIC_SUPABASE_URL`: `https://hcceyhmisbmclqrgfedr.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 正しく設定されています
- Development, Preview, Production すべてに設定されています

## 問題の原因

環境変数は設定されていますが、**Production環境でのビルド時に正しく注入されていない**可能性があります。

## 解決方法

### ステップ1: Vercelダッシュボードで再デプロイ

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト **「alert」** を選択（「alert-35i1」ではない）
3. 「**Deployments**」タブをクリック
4. 最新のデプロイメントの右側にある「**...**」（三点メニュー）をクリック
5. 「**Redeploy**」を選択
6. **重要**: 「**Use existing Build Cache**」のチェックを**外す**
7. 「**Redeploy**」ボタンをクリック
8. デプロイが完了するまで待つ（通常1-2分）

### ステップ2: デプロイログを確認

1. デプロイメントをクリック
2. 「**Build Logs**」を確認
3. 環境変数に関するエラーがないか確認

### ステップ3: ブラウザのキャッシュをクリア

1. デプロイされたURLにアクセス
2. **Ctrl+Shift+R** (Windows/Linux) または **Cmd+Shift+R** (Mac) でハードリロード
3. または、ブラウザの開発者ツール（F12）を開き、「Network」タブで「Disable cache」にチェックを入れる

### ステップ4: 確認

1. `/test-connection` ページにアクセス
2. F12キーを押してDevToolsを開く
3. 「Console」タブを選択
4. 「接続テストを実行」ボタンをクリック
5. コンソールに表示される「🔍 環境変数の確認:」のログを確認
   - `hasUrl: true` と `hasKey: true` が表示されればOK

## それでも解決しない場合

### 方法1: 環境変数を削除して再作成

1. Vercelダッシュボードで環境変数を削除
2. 再度作成（Production, Preview, Development すべてにチェック）
3. **「Use existing Build Cache」のチェックを外して**再デプロイ

### 方法2: Vercel CLIで環境変数を再設定

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"

# 環境変数を削除（すべての環境）
npx vercel env rm NEXT_PUBLIC_SUPABASE_URL production
npx vercel env rm NEXT_PUBLIC_SUPABASE_URL preview
npx vercel env rm NEXT_PUBLIC_SUPABASE_URL development

npx vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY preview
npx vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY development

# 環境変数を再追加
echo "https://hcceyhmisbmclqrgfedr.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "https://hcceyhmisbmclqrgfedr.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL preview
echo "https://hcceyhmisbmclqrgfedr.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL development

echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
```

その後、Vercelダッシュボードから再デプロイを実行してください。

---

**重要**: 再デプロイする際は、「Use existing Build Cache」のチェックを**外す**ことが重要です！

