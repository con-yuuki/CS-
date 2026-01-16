# GitHub Desktopでプッシュする手順

## ステップ1: リポジトリを開く

1. **GitHub Desktopを起動**

2. **リポジトリを追加**
   - 「File」→「Add Local Repository」をクリック
   - または、左上の「+」ボタン → 「Add Existing Repository」をクリック

3. **フォルダを選択**
   - 「Choose...」ボタンをクリック
   - `/Users/yuuki.takada/Desktop/CSアラート機能` を選択
   - 「Add repository」をクリック

## ステップ2: 変更を確認

1. **左側の「Changes」タブを確認**
   - 変更されたファイルが表示されます
   - 以下のファイルが表示されるはずです：
     - `components/CompanyScoreDetailModal.tsx`
     - `lib/services/usage-log-service.ts`
     - その他のドキュメントファイル

## ステップ3: コミット（既に完了しています）

既にコミットは完了しているので、このステップはスキップできます。

もし新しい変更がある場合は：
1. 下部の「Summary」に「モーダル表示の修正」などメッセージを入力
2. 「Commit to main」をクリック

## ステップ4: GitHubにプッシュ

1. **上部の「Push origin」ボタンをクリック**
   - または、「Repository」→「Push」をクリック

2. **認証情報を入力**
   - GitHubのログイン画面が開きます
   - GitHubのユーザー名とパスワードを入力
   - または、パーソナルアクセストークン（PAT）を使用

3. **プッシュの確認**
   - プッシュが完了すると、「Push origin」ボタンが消えます
   - または、「Fetch origin」ボタンに変わります

## ステップ5: Vercelで自動デプロイを確認

1. **Vercel Dashboardを開く**
   - [https://vercel.com/dashboard](https://vercel.com/dashboard) を開く

2. **プロジェクト「alert」を選択**

3. **「Deployments」タブを開く**
   - 新しいデプロイが自動的に開始されます
   - 数分でデプロイが完了します

## 完了！

デプロイが完了したら、デプロイURLにアクセスして動作を確認してください。

