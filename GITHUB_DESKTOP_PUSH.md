# GitHub Desktopでプッシュする詳細手順

## ステップ1: GitHub Desktopでリポジトリを開く

1. **GitHub Desktopを起動**

2. **リポジトリを追加**
   - 方法A: 「File」→「Add Local Repository」をクリック
   - 方法B: 左上の「+」ボタン → 「Add Existing Repository」をクリック

3. **フォルダを選択**
   - 「Choose...」ボタンをクリック
   - `/Users/yuuki.takada/Desktop/CSアラート機能` を選択
   - 「Add repository」をクリック

## ステップ2: 状態を確認

リポジトリを開くと、以下のように表示されます：

- **上部**: 「11 commits ahead of origin/main」と表示される
- **左側**: 「Changes」タブと「History」タブがある

## ステップ3: GitHubにプッシュ

1. **上部の「Push origin」ボタンをクリック**
   - ボタンは画面の上部中央にあります
   - 「Push origin」と表示されているはずです

2. **認証情報を入力**
   - 初回の場合、GitHubのログイン画面が開きます
   - GitHubのユーザー名とパスワードを入力
   - または、パーソナルアクセストークン（PAT）を使用

3. **プッシュの確認**
   - プッシュが完了すると、「Push origin」ボタンが消えます
   - または、「Fetch origin」ボタンに変わります
   - エラーが出た場合は、エラーメッセージを確認してください

## 認証エラーが出た場合

### パーソナルアクセストークン（PAT）の作成方法

1. **GitHubにログイン**
   - [https://github.com](https://github.com) にアクセス

2. **Settingsを開く**
   - 右上のアイコン（プロフィール画像）をクリック
   - 「Settings」をクリック

3. **Developer settingsを開く**
   - 左側のメニューを下にスクロール
   - 一番下の「Developer settings」をクリック

4. **Personal access tokensを作成**
   - 「Personal access tokens」→「Tokens (classic)」をクリック
   - 「Generate new token」→「Generate new token (classic)」をクリック
   - 「Note」に「GitHub Desktop」など適当な名前を入力
   - 「Expiration」で有効期限を選択（例：90 days）
   - 「Select scopes」で「repo」にチェックを入れる
   - 「Generate token」をクリック

5. **トークンをコピー**
   - 表示されたトークンをコピー（この画面を閉じると二度と見れません）
   - GitHub Desktopでパスワードを求められたら、このトークンを貼り付け

## ステップ4: Vercelで自動デプロイを確認

1. **Vercel Dashboardを開く**
   - [https://vercel.com/dashboard](https://vercel.com/dashboard) を開く

2. **プロジェクト「alert」を選択**

3. **「Deployments」タブを開く**
   - 新しいデプロイが自動的に開始されます
   - 数分でデプロイが完了します

## 完了！

デプロイが完了したら、デプロイURLにアクセスして動作を確認してください。

