# 本番環境へのデプロイ手順

## 方法1: GitHub経由で自動デプロイ（推奨）

### ステップ1: GitHubにプッシュ

ターミナルで以下のコマンドを実行してください：

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
git push origin main
```

認証が求められた場合は、GitHubのパーソナルアクセストークン（PAT）を使用してください。

### ステップ2: Vercelで自動デプロイ

GitHubにプッシュすると、Vercelが自動的にデプロイを開始します。

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト「alert」を選択
3. 「Deployments」タブでデプロイ状況を確認

## 方法2: Vercel CLIで直接デプロイ

### ステップ1: Vercel CLIをインストール

```bash
npm install -g vercel
```

### ステップ2: Vercelにログイン

```bash
vercel login
```

### ステップ3: デプロイ

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
vercel --prod
```

## 環境変数の確認

デプロイ前に、Vercelの環境変数が正しく設定されているか確認してください：

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト「alert」を選択
3. 「Settings」→「Environment Variables」を開く
4. 以下の環境変数が設定されているか確認：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`（必要に応じて）

## デプロイ後の確認

デプロイが完了したら、以下を確認してください：

1. **ビルドログの確認**
   - Vercel Dashboardの「Deployments」タブでビルドログを確認
   - エラーがないか確認

2. **本番URLでの動作確認**
   - デプロイされたURLにアクセス
   - ダッシュボードが正常に表示されるか確認
   - インポート機能が動作するか確認

3. **環境変数の確認**
   - Supabaseへの接続が正常に動作するか確認

## トラブルシューティング

### ビルドエラーが発生した場合

1. ローカルでビルドを実行してエラーを確認：
   ```bash
   npm run build
   ```

2. エラーを修正してから再デプロイ

### 環境変数が読み込まれない場合

1. Vercel Dashboardで環境変数を再設定
2. 「Redeploy」を実行（ビルドキャッシュをクリア）

### デプロイが失敗する場合

1. Vercel Dashboardの「Deployments」タブでエラーログを確認
2. エラーメッセージに基づいて修正

