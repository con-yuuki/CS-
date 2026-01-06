# Vercel環境変数の設定方法（Settingsが見つからない場合）

## 方法1: 直接URLでアクセス（最も簡単）

以下のURLをブラウザのアドレスバーに**直接入力**してください：

```
https://vercel.com/con-yuukis-projects/alert/settings/environment-variables
```

このURLで直接環境変数設定ページにアクセスできます。

## 方法2: Vercel CLIを使用（推奨）

ターミナルで以下のコマンドを実行してください：

### ステップ1: Vercel CLIにログイン

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
npx vercel login
```

ブラウザが開くので、Vercelアカウントでログインしてください。

### ステップ2: 現在の環境変数を確認

```bash
npx vercel env ls
```

これで、現在設定されている環境変数の一覧が表示されます。

### ステップ3: 環境変数を削除（既存のものがある場合）

もし既存の環境変数が正しく動作していない場合、削除して再作成します：

```bash
npx vercel env rm NEXT_PUBLIC_SUPABASE_URL production
npx vercel env rm NEXT_PUBLIC_SUPABASE_URL preview
npx vercel env rm NEXT_PUBLIC_SUPABASE_URL development

npx vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY preview
npx vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY development
```

### ステップ4: 環境変数を追加

#### 1つ目の環境変数（Production）

```bash
echo "https://hcceyhmisbmclqrgfedr.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
```

#### 1つ目の環境変数（Preview）

```bash
echo "https://hcceyhmisbmclqrgfedr.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL preview
```

#### 1つ目の環境変数（Development）

```bash
echo "https://hcceyhmisbmclqrgfedr.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL development
```

#### 2つ目の環境変数（Production）

```bash
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

#### 2つ目の環境変数（Preview）

```bash
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
```

#### 2つ目の環境変数（Development）

```bash
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
```

### ステップ5: 再デプロイ

```bash
npx vercel --prod
```

## 方法3: 環境変数を一括で設定（簡単な方法）

以下のコマンドを順番に実行してください：

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"

# ログイン（まだの場合）
npx vercel login

# 環境変数を追加（対話形式）
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
# プロンプトが表示されたら：
# - Environment: Production, Preview, Development をすべて選択
# - Value: https://hcceyhmisbmclqrgfedr.supabase.co を入力

npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# プロンプトが表示されたら：
# - Environment: Production, Preview, Development をすべて選択
# - Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw を入力

# 再デプロイ
npx vercel --prod
```

---

**最も簡単な方法**: 方法1の直接URLでアクセスするか、方法3のVercel CLIを使用してください。

