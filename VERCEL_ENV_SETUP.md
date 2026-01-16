# Vercel環境変数の設定方法（詳細版）

## 方法1: プロジェクト設定から（推奨）

### ステップ1: プロジェクトを選択

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト一覧から **`alert`** をクリック

### ステップ2: 設定画面にアクセス

以下のいずれかの方法で設定画面にアクセスできます：

**方法A: 上部のタブから**
- プロジェクトページの上部にタブが表示されています
- 「**Settings**」タブをクリック
- 左メニューから「**Environment Variables**」を選択

**方法B: プロジェクト設定から**
- プロジェクトページの右上にある「**...**」（三点メニュー）をクリック
- 「**Settings**」を選択
- 左メニューから「**Environment Variables**」を選択

**方法C: 直接URLでアクセス**
- ブラウザのアドレスバーに以下を入力：
  ```
  https://vercel.com/[YOUR_TEAM_NAME]/alert/settings/environment-variables
  ```
  （`[YOUR_TEAM_NAME]`はあなたのVercelアカウント名またはチーム名）

## 方法2: デプロイメントから設定

1. プロジェクトページの「**Deployments**」タブをクリック
2. 最新のデプロイメントをクリック
3. 「**Settings**」または「**Configure**」ボタンを探す
4. 「**Environment Variables**」を選択

## 方法3: プロジェクト作成時に設定

もし新しいプロジェクトを作成する場合は：

1. 「**Add New...**」→「**Project**」をクリック
2. `con-yuuki/alert` リポジトリを選択
3. 「**Configure Project**」画面で「**Environment Variables**」セクションを探す
4. 環境変数を追加

## 環境変数の追加手順

「Environment Variables」画面にアクセスできたら：

### 1. 「Add New」または「+」ボタンをクリック

### 2. 1つ目の環境変数を追加

- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://hcceyhmisbmclqrgfedr.supabase.co`
- **Environment**: 
  - ✅ Production
  - ✅ Preview
  - ✅ Development

「**Save**」をクリック

### 3. 2つ目の環境変数を追加

「Add New」を再度クリック

- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw`
- **Environment**: 
  - ✅ Production
  - ✅ Preview
  - ✅ Development

「**Save**」をクリック

## 再デプロイ

環境変数を追加した後、**必ず再デプロイ**が必要です：

1. 「**Deployments**」タブに移動
2. 最新のデプロイメントの右側にある「**...**」（三点メニュー）をクリック
3. 「**Redeploy**」を選択
4. 「**Redeploy**」ボタンをクリック

## スクリーンショットの参考

VercelのUIは以下のような構造になっています：

```
┌─────────────────────────────────────┐
│  Project: alert                     │
├─────────────────────────────────────┤
│ [Overview] [Deployments] [Settings] │ ← ここにSettingsタブがある
├─────────────────────────────────────┤
│                                     │
│  Settings                           │
│  ├─ General                         │
│  ├─ Environment Variables  ← ここ！  │
│  ├─ Domains                         │
│  └─ ...                             │
└─────────────────────────────────────┘
```

## それでも見つからない場合

### 確認事項

1. **正しいプロジェクトを選択していますか？**
   - プロジェクト名が `alert` であることを確認

2. **権限はありますか？**
   - プロジェクトのオーナーまたは管理者権限が必要です

3. **Vercelのプランは？**
   - 無料プランでも環境変数は設定できます

### 代替方法: Vercel CLIを使用

ターミナルで以下のコマンドを実行：

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
# Valueを入力: https://hcceyhmisbmclqrgfedr.supabase.co

npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development
# Valueを入力: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw

npx vercel --prod
```

---

**現在のVercelダッシュボードの画面を教えていただけますか？** それに合わせて、より具体的な手順を案内できます。




