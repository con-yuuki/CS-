# Vercelへのデプロイ手順

## ステップ1: Vercelにアクセス

1. [Vercel](https://vercel.com) にアクセス
2. 「Sign Up」または「Log In」をクリック
3. **GitHubアカウントでログインすることを推奨**（連携が簡単）

## ステップ2: プロジェクトをインポート

1. ダッシュボードで「Add New...」→「Project」をクリック
2. 「Import Git Repository」セクションで `con-yuuki/alert` を検索して選択
3. 「Import」をクリック

## ステップ3: プロジェクト設定

以下の設定を確認・入力：

- **Framework Preset**: `Next.js`（自動検出されるはず）
- **Root Directory**: `./`（デフォルト）
- **Build Command**: `npm run build`（デフォルト）
- **Output Directory**: `.next`（デフォルト）
- **Install Command**: `npm install`（デフォルト）

## ステップ4: 環境変数の設定（重要！）

「Environment Variables」セクションで、以下の2つの環境変数を追加：

### 1. NEXT_PUBLIC_SUPABASE_URL

- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://hcceyhmisbmclqrgfedr.supabase.co`
- **Environment**: Production, Preview, Development すべてにチェック

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY

- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw`
- **Environment**: Production, Preview, Development すべてにチェック

## ステップ5: デプロイ

1. 「Deploy」ボタンをクリック
2. ビルドが開始されます（通常1-3分）
3. デプロイが完了すると、URLが表示されます（例: `https://alert-xxx.vercel.app`）

## ステップ6: 動作確認

1. デプロイされたURLにアクセス
2. 以下の機能を確認：
   - ✅ トップページが表示される
   - ✅ インポートページでファイルをアップロードできる
   - ✅ ダッシュボードでデータが表示される
   - ✅ トレンド分析ページが表示される

## トラブルシューティング

### ビルドエラーが発生する場合

1. Vercelのデプロイログを確認
2. 環境変数が正しく設定されているか確認
3. ローカルで `npm run build` が成功するか確認

### Supabase接続エラーが発生する場合

1. 環境変数が正しく設定されているか確認
2. SupabaseのRLSポリシーが適切に設定されているか確認
3. Supabaseのログを確認

### デプロイ後の更新方法

GitHubにプッシュすると、自動的にVercelで再デプロイされます：

```bash
git add .
git commit -m "Update: 変更内容"
git push origin main
```

## カスタムドメインの設定（オプション）

1. Vercelダッシュボードでプロジェクトを選択
2. 「Settings」→「Domains」に移動
3. カスタムドメインを追加

---

**GitHubリポジトリ**: https://github.com/con-yuuki/alert




