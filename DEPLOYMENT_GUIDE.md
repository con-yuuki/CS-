# デプロイメントガイド

このガイドでは、CS Health Score Dashboard を本番環境にデプロイする手順を説明します。

## デプロイ方法の選択肢

### 1. Vercel（推奨）
- Next.jsの公式ホスティングサービス
- 無料プランあり
- GitHub連携で自動デプロイ
- 設定が簡単

### 2. その他の選択肢
- Netlify
- AWS Amplify
- 自社サーバー（VPS等）

---

## 方法1: Vercel へのデプロイ（推奨）

### 前提条件
- GitHubアカウント
- Vercelアカウント（無料で作成可能）

### ステップ1: GitHubにリポジトリを作成

1. GitHubで新しいリポジトリを作成
   - リポジトリ名: `cs-health-score-dashboard`（任意）
   - プライベート/パブリックは任意

2. ローカルでGitを初期化（まだの場合）
```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
git init
git add .
git commit -m "Initial commit"
```

3. GitHubリポジトリにプッシュ
```bash
git remote add origin https://github.com/YOUR_USERNAME/cs-health-score-dashboard.git
git branch -M main
git push -u origin main
```

### ステップ2: Vercelにデプロイ

1. [Vercel](https://vercel.com) にアクセスしてアカウントを作成（GitHubアカウントでログイン可能）

2. 「New Project」をクリック

3. GitHubリポジトリを選択

4. プロジェクト設定
   - **Framework Preset**: Next.js（自動検出されるはず）
   - **Root Directory**: `./`（デフォルト）
   - **Build Command**: `npm run build`（デフォルト）
   - **Output Directory**: `.next`（デフォルト）

5. **環境変数の設定**（重要！）
   - 「Environment Variables」セクションで以下を追加：
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://hcceyhmisbmclqrgfedr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw
   ```
   
   ⚠️ **注意**: `SUPABASE_SERVICE_ROLE_KEY` は**設定しないでください**。これはサーバーサイド専用で、クライアントサイドに公開するとセキュリティリスクがあります。

6. 「Deploy」をクリック

7. デプロイ完了後、Vercelが自動的にURLを生成します（例: `https://cs-health-score-dashboard.vercel.app`）

### ステップ3: 動作確認

1. デプロイされたURLにアクセス
2. インポート機能が動作するか確認
3. ダッシュボードが表示されるか確認

### ステップ4: カスタムドメインの設定（オプション）

1. Vercelダッシュボードでプロジェクトを選択
2. 「Settings」→「Domains」に移動
3. カスタムドメインを追加

---

## 方法2: Netlify へのデプロイ

### ステップ1: GitHubにリポジトリを作成（方法1と同じ）

### ステップ2: Netlifyにデプロイ

1. [Netlify](https://www.netlify.com) にアクセスしてアカウントを作成

2. 「Add new site」→「Import an existing project」

3. GitHubリポジトリを選択

4. ビルド設定
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

5. 環境変数の設定
   - 「Site settings」→「Environment variables」で以下を追加：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://hcceyhmisbmclqrgfedr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw
   ```

6. 「Deploy site」をクリック

---

## 方法3: 自社サーバーへのデプロイ

### 前提条件
- Node.js 18以上がインストールされたサーバー
- PM2などのプロセスマネージャー（推奨）

### ステップ1: サーバーにファイルをアップロード

```bash
# サーバーにSSH接続
ssh user@your-server.com

# プロジェクトディレクトリに移動
cd /var/www/cs-health-score-dashboard

# Gitからクローン（またはファイルをアップロード）
git clone https://github.com/YOUR_USERNAME/cs-health-score-dashboard.git .
```

### ステップ2: 依存関係のインストール

```bash
npm install
```

### ステップ3: 環境変数の設定

`.env.local` ファイルを作成：

```bash
nano .env.local
```

以下を追加：
```
NEXT_PUBLIC_SUPABASE_URL=https://hcceyhmisbmclqrgfedr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw
```

### ステップ4: ビルドと起動

```bash
# 本番ビルド
npm run build

# PM2で起動（PM2がインストールされている場合）
pm2 start npm --name "cs-health-score" -- start

# または通常の方法で起動
npm start
```

### ステップ5: Nginxリバースプロキシの設定（オプション）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## デプロイ前のチェックリスト

- [ ] `.env.local` が `.gitignore` に含まれている（機密情報がGitにコミットされないように）
- [ ] 本番環境の環境変数が正しく設定されている
- [ ] SupabaseのRLSポリシーが適切に設定されている
- [ ] ビルドが正常に完了する（`npm run build`）
- [ ] ローカルで `npm start` が正常に動作する

---

## トラブルシューティング

### ビルドエラーが発生する場合

```bash
# ローカルでビルドをテスト
npm run build
```

エラーメッセージを確認して修正してください。

### 環境変数が読み込まれない場合

- Vercel/Netlifyの環境変数設定を確認
- 変数名が `NEXT_PUBLIC_` で始まっているか確認（クライアントサイドで使用する場合）
- デプロイ後に再ビルドが必要な場合があります

### Supabase接続エラーが発生する場合

- SupabaseのURLとAPIキーが正しいか確認
- SupabaseのRLSポリシーが適切に設定されているか確認
- CORS設定を確認（通常は問題ありません）

---

## セキュリティに関する注意事項

1. **環境変数の管理**
   - `.env.local` は絶対にGitにコミットしない
   - 本番環境の環境変数はホスティングサービスの管理画面で設定

2. **Supabase APIキー**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` はクライアントサイドで使用されるため、公開されても問題ありません（RLSで保護されています）
   - `SUPABASE_SERVICE_ROLE_KEY` は**絶対に**クライアントサイドで使用しないでください

3. **RLSポリシー**
   - 本番環境では、必要に応じてRLSポリシーをより厳格に設定してください

---

## サポート

問題が発生した場合は、以下を確認してください：
- ブラウザのコンソールエラー
- Vercel/Netlifyのデプロイログ
- Supabaseのログ

