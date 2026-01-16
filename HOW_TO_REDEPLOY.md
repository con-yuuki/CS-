# 最新の変更を本番環境に反映する方法

## 現在の状況

Vercel Dashboardを見ると、既にデプロイされている状態です。

## 最新の変更を反映する方法

### 方法1: GitHubにプッシュして自動デプロイ（推奨）

1. **ターミナルで以下を実行**：
   ```bash
   cd "/Users/yuuki.takada/Desktop/CSアラート機能"
   git push origin main
   ```

2. **GitHubの認証**
   - パーソナルアクセストークン（PAT）を求められた場合：
     - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
     - 新しいトークンを作成（`repo`権限が必要）
     - トークンをコピーして、パスワードの代わりに入力

3. **Vercelで自動デプロイを確認**
   - Vercel Dashboardの「Deployments」タブを開く
   - 新しいデプロイが自動的に開始されます

### 方法2: Vercel Dashboardから手動で再デプロイ

1. **Vercel Dashboardで「Deployments」タブを開く**
   - 画面上部の「Deployments」をクリック

2. **最新のデプロイを確認**
   - 最新のデプロイメントの右側にある「...」（3つの点）をクリック
   - 「Redeploy」を選択
   - または、GitHubにプッシュされた最新のコミットから再デプロイ

### 方法3: GitHub連携を確認

1. **Vercel Dashboardで「Settings」→「Git」を開く**
   - 左側のメニューから「Settings」をクリック
   - 「Git」セクションを確認
   - GitHubリポジトリが接続されているか確認

2. **接続されていない場合**
   - 「Connect Git Repository」をクリック
   - GitHubリポジトリを選択して接続

## 確認方法

デプロイが完了したら：

1. **デプロイURLにアクセス**
   - Vercel Dashboardの「Visit」ボタンからアクセス
   - または、デプロイメント一覧から最新のURLを確認

2. **動作確認**
   - ダッシュボードが正常に表示されるか
   - インポート機能が動作するか
   - Active率の計算が正常に動作するか

## 現在の状態

現在、GitHubにプッシュされていない変更があります。以下のコマンドでプッシュできます：

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
git push origin main
```

