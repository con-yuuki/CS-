# GitHubにプッシュしてデプロイする方法

## 手順

### ステップ1: ターミナルを開く

Macの「ターミナル」アプリを開いてください。

### ステップ2: 以下のコマンドを順番に実行

ターミナルに以下のコマンドをコピー＆ペーストして実行してください：

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
git push origin main
```

### ステップ3: GitHubの認証

認証情報を求められた場合：

1. **ユーザー名を入力**（GitHubのユーザー名：`con-yuuki`）

2. **パスワードの代わりに、パーソナルアクセストークン（PAT）を入力**

   **パーソナルアクセストークンの作成方法：**
   
   a. GitHubにログイン
   
   b. 右上のアイコンをクリック → 「Settings」
   
   c. 左側のメニューから「Developer settings」をクリック
   
   d. 「Personal access tokens」→ 「Tokens (classic)」をクリック
   
   e. 「Generate new token」→ 「Generate new token (classic)」をクリック
   
   f. 「Note」に「Vercel Deploy」など適当な名前を入力
   
   g. 「Expiration」で有効期限を選択
   
   h. 「Select scopes」で「repo」にチェックを入れる
   
   i. 「Generate token」をクリック
   
   j. 表示されたトークンをコピー（この画面を閉じると二度と見れません）
   
   k. ターミナルでパスワードを求められたら、このトークンを貼り付け

### ステップ4: デプロイの確認

プッシュが完了すると、Vercelが自動的にデプロイを開始します。

1. [Vercel Dashboard](https://vercel.com/dashboard) を開く
2. プロジェクト「alert」を選択
3. 「Deployments」タブを開く
4. 新しいデプロイが開始されていることを確認

## 完了！

数分でデプロイが完了します。完了したら、デプロイURLにアクセスして動作を確認してください。

