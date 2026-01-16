# インポート機能の修正方法（簡易版）

## 問題

インポート機能が動作しない原因は、**Vercelの環境変数が設定されていない**ことです。

## 解決方法（3ステップ）

### ステップ1: Vercelダッシュボードにアクセス

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト `alert` を選択
3. 「Settings」タブをクリック
4. 左メニューから「Environment Variables」を選択

### ステップ2: 環境変数を追加

「Add New」ボタンをクリックして、以下の2つを追加：

#### 1つ目: NEXT_PUBLIC_SUPABASE_URL

- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://hcceyhmisbmclqrgfedr.supabase.co`
- **Environment**: 
  - ✅ Production
  - ✅ Preview  
  - ✅ Development

「Save」をクリック

#### 2つ目: NEXT_PUBLIC_SUPABASE_ANON_KEY

- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw`
- **Environment**: 
  - ✅ Production
  - ✅ Preview
  - ✅ Development

「Save」をクリック

### ステップ3: 再デプロイ

環境変数を追加した後、**必ず再デプロイが必要**です：

1. 「Deployments」タブに移動
2. 最新のデプロイメントの右側にある「...」メニューをクリック
3. 「Redeploy」を選択
4. 「Redeploy」ボタンをクリック

または、GitHubにプッシュすると自動的に再デプロイされます。

## 確認方法

再デプロイ後、以下の方法で確認できます：

1. **アプリケーションで確認**
   - デプロイされたURLにアクセス
   - `/import` ページに移動
   - 環境変数が設定されている場合、警告メッセージが表示されません

2. **接続テストで確認**
   - `/test-connection` ページにアクセス
   - 「接続テストを実行」ボタンをクリック
   - 「環境変数の設定: ✅ 正常」と表示されればOK

## よくある質問

### Q: 環境変数を追加したのに、まだエラーが出ます

A: **再デプロイが必要です**。環境変数を追加・変更した後は、必ず再デプロイしてください。

### Q: どの環境に設定すればいいですか？

A: Production、Preview、Development **すべて**にチェックを入れてください。

### Q: 環境変数の値はどこで確認できますか？

A: Supabaseダッシュボードの「Settings」→「API」で確認できます。

---

**重要**: 環境変数を追加した後は、必ず再デプロイを実行してください！




