# Vercel Dashboardからデプロイする方法（最も簡単）

## 手順

### ステップ1: Vercel Dashboardにアクセス

1. ブラウザで [https://vercel.com/dashboard](https://vercel.com/dashboard) を開く
2. ログインする

### ステップ2: プロジェクトを選択

1. プロジェクト一覧から「alert」をクリック

### ステップ3: デプロイを実行

1. プロジェクトページの右上にある「Deploy」ボタンをクリック
2. または、GitHubにプッシュすると自動的にデプロイされます

## GitHub経由で自動デプロイ（推奨）

GitHubにコードをプッシュすると、Vercelが自動的にデプロイを開始します。

### 手順

1. **GitHubにプッシュ**
   - ターミナルで以下を実行：
   ```bash
   cd "/Users/yuuki.takada/Desktop/CSアラート機能"
   git push origin main
   ```
   - GitHubの認証情報を入力（パーソナルアクセストークンを使用）

2. **Vercelで自動デプロイを確認**
   - Vercel Dashboardの「Deployments」タブでデプロイ状況を確認
   - 数分でデプロイが完了します

## デプロイ後の確認

デプロイが完了すると、URLが表示されます。そのURLにアクセスして動作を確認してください。

## 環境変数の確認

デプロイ前に、以下の環境変数がVercelに設定されているか確認してください：

1. Vercel Dashboardで「Settings」→「Environment Variables」を開く
2. 以下の環境変数が設定されているか確認：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

設定されていない場合は、追加してください。

