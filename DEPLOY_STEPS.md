# デプロイ手順（簡易版）

## ステップ1: GitHubリポジトリを作成

1. [GitHub](https://github.com) にログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例: `cs-health-score-dashboard`）
4. 「Private」または「Public」を選択
5. 「Create repository」をクリック

## ステップ2: ローカルリポジトリをGitHubにプッシュ

ターミナルで以下のコマンドを実行してください：

```bash
# GitHubリポジトリのURLを設定（YOUR_USERNAMEを実際のGitHubユーザー名に置き換えてください）
git remote add origin https://github.com/YOUR_USERNAME/cs-health-score-dashboard.git

# メインブランチにプッシュ
git branch -M main
git push -u origin main
```

## ステップ3: Vercelにデプロイ

1. [Vercel](https://vercel.com) にアクセス
2. 「Sign Up」または「Log In」をクリック（GitHubアカウントでログイン推奨）
3. 「Add New...」→「Project」をクリック
4. 作成したGitHubリポジトリを選択
5. プロジェクト設定：
   - **Framework Preset**: Next.js（自動検出されるはず）
   - **Root Directory**: `./`（デフォルト）
   - **Build Command**: `npm run build`（デフォルト）
   - **Output Directory**: `.next`（デフォルト）

6. **環境変数の設定**（重要！）
   「Environment Variables」セクションで以下を追加：
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://hcceyhmisbmclqrgfedr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw
   ```

7. 「Deploy」をクリック

8. デプロイ完了後、Vercelが自動的にURLを生成します（例: `https://cs-health-score-dashboard.vercel.app`）

## ステップ4: 動作確認

1. デプロイされたURLにアクセス
2. インポート機能が動作するか確認
3. ダッシュボードが表示されるか確認

## トラブルシューティング

### ビルドエラーが発生する場合

- Vercelのデプロイログを確認
- 環境変数が正しく設定されているか確認

### Supabase接続エラーが発生する場合

- 環境変数が正しく設定されているか確認
- SupabaseのRLSポリシーが適切に設定されているか確認

