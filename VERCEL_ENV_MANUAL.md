# Vercel環境変数の手動設定方法

## 最も簡単な方法

### ステップ1: プロジェクトを開く

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト一覧から **`alert`** という名前のプロジェクトを**クリック**

### ステップ2: Settingsタブを探す

プロジェクトページを開いたら、画面上部に以下のようなタブが表示されます：

```
[Overview] [Deployments] [Settings] [Analytics] [Logs]
```

**「Settings」タブをクリック**してください。

### ステップ3: Environment Variablesを選択

Settingsページの左側にメニューが表示されます：

```
Settings
├─ General
├─ Environment Variables  ← これをクリック
├─ Domains
├─ Integrations
└─ ...
```

**「Environment Variables」をクリック**してください。

### ステップ4: 環境変数を追加

「Environment Variables」ページで：

1. **「Add New」** または **「+」** ボタンをクリック

2. 1つ目の環境変数：
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: `https://hcceyhmisbmclqrgfedr.supabase.co`
   - **Environment**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - **「Save」** をクリック

3. 再度 **「Add New」** をクリック

4. 2つ目の環境変数：
   - **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw`
   - **Environment**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - **「Save」** をクリック

### ステップ5: 再デプロイ

1. 上部のタブから **「Deployments」** をクリック
2. 最新のデプロイメントの右側にある **「...」**（三点メニュー）をクリック
3. **「Redeploy」** を選択
4. **「Redeploy」** ボタンをクリック

---

## それでも見つからない場合

### 確認事項

1. **プロジェクト名を確認**
   - プロジェクト名が `alert` であることを確認してください
   - 別の名前でデプロイしている場合は、そのプロジェクトを選択してください

2. **権限を確認**
   - プロジェクトのオーナーまたは管理者権限が必要です
   - チームのメンバーの場合、権限が不足している可能性があります

3. **画面のスクロール**
   - Settingsページで、左メニューを下にスクロールして「Environment Variables」を探してください

### 代替方法: URLで直接アクセス

以下のURLをブラウザのアドレスバーに入力してください：

```
https://vercel.com/con-yuukis-projects/alert/settings/environment-variables
```

（`con-yuukis-projects` の部分は、あなたのアカウント名に合わせて変更してください）

---

## 現在の状況を教えてください

以下の情報を教えていただければ、より具体的にサポートできます：

1. **現在の画面**: プロジェクト一覧 / プロジェクトのOverview / その他
2. **表示されているタブ**: Overview, Deployments, Settings など、何が表示されていますか？
3. **エラーメッセージ**: 何かエラーメッセージが表示されていますか？

