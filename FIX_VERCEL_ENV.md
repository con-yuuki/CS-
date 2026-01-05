# Vercel環境変数の設定方法

## 問題

インポート機能が動作しない場合、Vercelの環境変数が正しく設定されていない可能性があります。

## 解決方法

### ステップ1: Vercelダッシュボードにアクセス

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. デプロイしたプロジェクト（`alert`）を選択
3. 「Settings」タブをクリック
4. 「Environment Variables」を選択

### ステップ2: 環境変数を追加

以下の2つの環境変数を追加してください：

#### 環境変数1: NEXT_PUBLIC_SUPABASE_URL

- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://hcceyhmisbmclqrgfedr.supabase.co`
- **Environment**: 
  - ✅ Production
  - ✅ Preview
  - ✅ Development

#### 環境変数2: NEXT_PUBLIC_SUPABASE_ANON_KEY

- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw`
- **Environment**: 
  - ✅ Production
  - ✅ Preview
  - ✅ Development

### ステップ3: 環境変数を保存

1. 「Save」ボタンをクリック
2. 環境変数が追加されたことを確認

### ステップ4: 再デプロイ

環境変数を追加した後、**再デプロイが必要**です：

1. 「Deployments」タブに移動
2. 最新のデプロイメントの「...」メニューをクリック
3. 「Redeploy」を選択
4. または、GitHubに新しいコミットをプッシュすると自動的に再デプロイされます

## 確認方法

### 方法1: アプリケーションで確認

1. デプロイされたURLにアクセス
2. `/test-connection` ページにアクセス
3. 「接続テストを実行」ボタンをクリック
4. 環境変数の設定が「✅ 正常」と表示されることを確認

### 方法2: Vercelダッシュボードで確認

1. Vercelダッシュボードの「Settings」→「Environment Variables」
2. 2つの環境変数が表示されていることを確認

## トラブルシューティング

### 環境変数が反映されない場合

1. **再デプロイを実行**: 環境変数を追加・変更した後は、必ず再デプロイが必要です
2. **環境の確認**: Production、Preview、Developmentすべてにチェックが入っているか確認
3. **変数名の確認**: `NEXT_PUBLIC_` で始まっているか確認（クライアントサイドで使用する場合）

### まだエラーが発生する場合

1. **SupabaseのRLSポリシーを確認**: SupabaseダッシュボードでRLSポリシーが適切に設定されているか確認
2. **テーブルの存在確認**: `ユーザー基礎情報`、`usage_logs`、`health_scores` テーブルが存在するか確認
3. **ブラウザのコンソールを確認**: エラーメッセージの詳細を確認

## 参考

- [Vercel環境変数のドキュメント](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js環境変数のドキュメント](https://nextjs.org/docs/basic-features/environment-variables)

