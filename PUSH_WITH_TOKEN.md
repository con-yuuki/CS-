# パーソナルアクセストークンを使ってプッシュする方法

## 403エラーの原因

403エラーは、認証情報が正しく設定されていないか、リポジトリへのアクセス権限がないことを示しています。

## 解決方法

### 方法1: リモートURLにトークンを埋め込む（一時的な方法）

**注意**: この方法はセキュリティ上推奨されませんが、一時的に使用できます。

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
git remote set-url origin https://<YOUR_GITHUB_TOKEN>@github.com/con-yuuki/alert.git
git push -u origin main
```

### 方法2: 認証情報を対話的に入力する

1. **リモートURLを通常の形式に戻す**
   ```bash
   cd "/Users/yuuki.takada/Desktop/CSアラート機能"
   git remote set-url origin https://github.com/con-yuuki/alert.git
   ```

2. **プッシュを実行**
   ```bash
   git push -u origin main
   ```

3. **認証情報を入力**
   - ユーザー名を求められたら: `con-yuuki` と入力してEnter
   - パスワードを求められたら: 生成したトークンを貼り付けてEnter

### 方法3: リポジトリが存在しない場合

もしリポジトリが存在しない場合は、まずGitHubでリポジトリを作成する必要があります。

1. **GitHubにログイン**
   - [https://github.com](https://github.com) にアクセス

2. **新しいリポジトリを作成**
   - 右上の「+」ボタン → 「New repository」
   - Repository name: `alert`
   - 「Initialize this repository with a README」のチェックは外す
   - 「Create repository」をクリック

3. **プッシュを実行**
   ```bash
   cd "/Users/yuuki.takada/Desktop/CSアラート機能"
   git push -u origin main
   ```

## 確認方法

プッシュが成功したか確認：

```bash
git log --oneline -5
```

GitHubで確認：
- [https://github.com/con-yuuki/alert](https://github.com/con-yuuki/alert) にアクセス
- コミットが表示されているか確認

