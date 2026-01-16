# 最も簡単なデプロイ方法

## 方法：Vercel Dashboardから再デプロイ

GitHubへの認証が難しい場合は、Vercel Dashboardから直接再デプロイできます。

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

5. **デプロイの確認**
   - 数分でデプロイが完了します
   - 完了したら、デプロイURLにアクセスして動作を確認してください

## 注意

この方法は、既存のデプロイを再実行するだけなので、最新のコード変更は反映されません。

最新のコード変更を反映するには、GitHubにプッシュする必要があります。

## GitHubにプッシュする場合

ターミナルで以下を実行してください：

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
git push origin main
```

認証情報を求められた場合：
- ユーザー名: `con-yuuki`
- パスワード: パーソナルアクセストークン（PAT）を入力

