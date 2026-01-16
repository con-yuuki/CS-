# GitHubへのプッシュが難しい場合のデプロイ方法

## 方法1: Vercel Dashboardから直接再デプロイ（簡単）

最新のコード変更は反映されませんが、既存のデプロイを再実行できます。

### 手順

1. **Vercel Dashboardを開く**
   - ブラウザで [https://vercel.com/dashboard](https://vercel.com/dashboard) を開く
   - ログインする

2. **プロジェクトを選択**
   - プロジェクト一覧から「alert」をクリック

3. **Deploymentsタブを開く**
   - 画面上部の「Deployments」タブをクリック

4. **再デプロイを実行**
   - 最新のデプロイメント（一番上）の右側にある「...」（3つの点）をクリック
   - 「Redeploy」を選択
   - 確認ダイアログで「Redeploy」をクリック

## 方法2: GitHub Desktopを使う（GUIツール）

コマンドラインが苦手な場合は、GitHub Desktopという無料のGUIツールを使うことができます。

### ステップ1: GitHub Desktopをインストール

1. [https://desktop.github.com/](https://desktop.github.com/) にアクセス
2. 「Download for macOS」をクリック
3. ダウンロードしたファイルを開いてインストール

### ステップ2: GitHub Desktopでリポジトリを開く

1. GitHub Desktopを起動
2. 「File」→「Add Local Repository」をクリック
3. `/Users/yuuki.takada/Desktop/CSアラート機能` を選択
4. 「Add repository」をクリック

### ステップ3: 変更をコミット

1. 左側の「Changes」タブで変更されたファイルを確認
2. 下部の「Summary」に「モーダル表示の修正」など適当なメッセージを入力
3. 「Commit to main」をクリック

### ステップ4: GitHubにプッシュ

1. 上部の「Push origin」ボタンをクリック
2. 認証情報を求められた場合は、GitHubのユーザー名とパスワード（またはパーソナルアクセストークン）を入力

## 方法3: 最新のコード変更を反映する必要がない場合

もし最新のコード変更（Active率計算機能など）を反映する必要がない場合は、方法1で十分です。

## 確認方法

デプロイが完了したら：

1. Vercel Dashboardの「Visit」ボタンからアクセス
2. ダッシュボードで企業カードをクリック
3. モーダルが表示されるか確認

