# Vercel環境変数の設定方法（Settingsが見つからない場合）

## 方法1: 直接URLでアクセス（最も確実）

以下のURLをブラウザのアドレスバーに入力してください：

```
https://vercel.com/con-yuukis-projects/alert/settings/environment-variables
```

このURLで直接環境変数設定ページにアクセスできます。

## 方法2: プロジェクト設定から

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト一覧から **`alert`** をクリック
3. プロジェクトページの右上にある **「...」**（三点メニュー）をクリック
4. 「**Settings**」または「**Project Settings**」を選択
5. 左メニューから「**Environment Variables**」を選択

## 方法3: デプロイメントから

1. プロジェクト `alert` を開く
2. 「**Deployments**」タブをクリック
3. 最新のデプロイメントをクリック
4. 「**Settings**」または「**Configure**」ボタンを探す
5. 「**Environment Variables**」を選択

## 方法4: Vercel CLIを使用（推奨）

ターミナルで以下のコマンドを実行してください：

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
```

### ステップ1: Vercel CLIにログイン（まだログインしていない場合）

```bash
npx vercel login
```

ブラウザが開くので、Vercelアカウントでログインしてください。

### ステップ2: 環境変数を追加

#### 1つ目の環境変数

```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
```

プロンプトが表示されたら：
1. **Environment**: `Production, Preview, Development` を選択（すべて選択）
2. **Value**: `https://hcceyhmisbmclqrgfedr.supabase.co` を入力

#### 2つ目の環境変数

```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

プロンプトが表示されたら：
1. **Environment**: `Production, Preview, Development` を選択（すべて選択）
2. **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw` を入力

### ステップ3: 再デプロイ

```bash
npx vercel --prod
```

## 方法5: 環境変数の確認

設定した環境変数を確認するには：

```bash
npx vercel env ls
```

これで、設定されている環境変数の一覧が表示されます。

## 現在の画面を教えてください

以下の情報を教えていただければ、より具体的に案内できます：

1. **現在の画面**: プロジェクト一覧 / プロジェクトのOverview / Deployments / その他
2. **表示されているタブやメニュー**: 何が表示されていますか？
3. **URL**: 現在のURLを教えてください

---

**最も簡単な方法**: 方法1の直接URLでアクセスする方法を試してください！

