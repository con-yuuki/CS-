# Vercel CLIでのデプロイ手順

## 方法1: ブラウザでログイン（推奨）

以下のコマンドを実行すると、ブラウザが開いてログインできます：

```bash
npx vercel login
```

ログイン後、以下のコマンドでデプロイ：

```bash
npx vercel --prod --yes \
  -e NEXT_PUBLIC_SUPABASE_URL="https://hcceyhmisbmclqrgfedr.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw"
```

## 方法2: APIトークンを使用

1. [Vercel Settings - Tokens](https://vercel.com/account/tokens) にアクセス
2. 「Create Token」をクリック
3. トークン名を入力（例: `cs-alert-deploy`）
4. 「Create」をクリック
5. 表示されたトークンをコピー

6. 以下のコマンドでデプロイ：

```bash
npx vercel --prod --yes --token YOUR_VERCEL_TOKEN \
  -e NEXT_PUBLIC_SUPABASE_URL="https://hcceyhmisbmclqrgfedr.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw"
```

## 方法3: Web UIを使用（最も簡単）

1. [Vercel](https://vercel.com) にアクセス
2. GitHubアカウントでログイン
3. 「Add New...」→「Project」
4. `con-yuuki/alert` を選択
5. 環境変数を設定してデプロイ

