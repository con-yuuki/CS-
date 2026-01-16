# Vercel環境変数の設定方法（画面別ガイド）

## 現在の画面を確認してください

Vercelダッシュボードで、現在どの画面にいますか？

### パターン1: プロジェクト一覧画面

```
┌─────────────────────────────────────┐
│  Vercel                              │
├─────────────────────────────────────┤
│  Projects                            │
│  ┌─────────┐  ┌─────────┐          │
│  │ alert   │  │ ...     │          │
│  └─────────┘  └─────────┘          │
└─────────────────────────────────────┘
```

**→ 解決方法**: `alert` プロジェクトを**クリック**してください

---

### パターン2: プロジェクトのOverview画面

```
┌─────────────────────────────────────┐
│  alert                               │
├─────────────────────────────────────┤
│ [Overview] [Deployments] [Settings] │ ← 上部のタブ
├─────────────────────────────────────┤
│  Latest Deployments                  │
│  ...                                 │
└─────────────────────────────────────┘
```

**→ 解決方法**: 上部のタブから「**Settings**」をクリックしてください

---

### パターン3: プロジェクトのDeployments画面

```
┌─────────────────────────────────────┐
│  alert                               │
├─────────────────────────────────────┤
│ [Overview] [Deployments] [Settings] │
├─────────────────────────────────────┤
│  Deployment History                  │
│  ...                                 │
└─────────────────────────────────────┘
```

**→ 解決方法**: 上部のタブから「**Settings**」をクリックしてください

---

### パターン4: Settings画面（左メニューあり）

```
┌─────────────────────────────────────┐
│  alert                               │
├─────────────────────────────────────┤
│ [Overview] [Deployments] [Settings] │
├─────────────────────────────────────┤
│  Settings                            │
│  ├─ General                          │
│  ├─ Environment Variables  ← ここ！   │
│  ├─ Domains                          │
│  └─ ...                              │
└─────────────────────────────────────┘
```

**→ 解決方法**: 左メニューから「**Environment Variables**」をクリックしてください

---

## それでも見つからない場合

### 方法A: 検索機能を使用

1. Vercelダッシュボードの上部に検索バーがある場合、`environment` と入力
2. 「Environment Variables」を選択

### 方法B: URLで直接アクセス

以下のURLをブラウザのアドレスバーに入力してください：

```
https://vercel.com/[YOUR_ACCOUNT]/alert/settings/environment-variables
```

`[YOUR_ACCOUNT]` の部分は、Vercelにログインした際のアカウント名（個人アカウントまたはチーム名）に置き換えてください。

### 方法C: プロジェクト設定から

1. プロジェクトページの右上にある「**...**」（三点メニュー）をクリック
2. 「**Settings**」または「**Project Settings**」を選択
3. 左メニューから「**Environment Variables**」を選択

---

## 現在の画面を教えてください

以下の情報を教えていただければ、より具体的な手順を案内できます：

1. **現在の画面**: プロジェクト一覧 / Overview / Deployments / Settings / その他
2. **表示されているタブやメニュー**: 何が表示されていますか？
3. **スクリーンショット**: 可能であれば、現在の画面のスクリーンショットを共有してください

---

## 代替方法: Vercel APIトークンを使用

Web UIで設定できない場合、APIトークンを使用して設定することもできます。

1. [Vercel Settings - Tokens](https://vercel.com/account/tokens) にアクセス
2. 「Create Token」をクリック
3. トークン名を入力（例: `env-setup`）
4. 「Create」をクリック
5. 表示されたトークンをコピー

その後、以下のコマンドで環境変数を設定できます：

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development --token YOUR_TOKEN
# Value: https://hcceyhmisbmclqrgfedr.supabase.co

npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development --token YOUR_TOKEN
# Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw
```




