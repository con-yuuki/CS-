# リポジトリが見つからない問題の解決方法

## 問題

`fatal: repository 'https://github.com/con-yuuki/alert.git/' not found`

このエラーは、GitHub上にリポジトリが存在しないか、アクセス権限がないことを示しています。

## 解決方法

### 方法1: GitHubでリポジトリを作成する

1. **GitHubにログイン**
   - [https://github.com](https://github.com) にアクセス
   - ログインする

2. **新しいリポジトリを作成**
   - 右上の「+」ボタンをクリック
   - 「New repository」を選択
   - リポジトリ名: `alert`
   - 説明: 任意（例：「CS Health Score Dashboard」）
   - プライベート/パブリック: 任意
   - 「Initialize this repository with a README」のチェックは外す（既にローカルにコードがあるため）
   - 「Create repository」をクリック

3. **リモートURLを確認**
   - リポジトリ作成後、表示されるURLを確認
   - 通常は `https://github.com/con-yuuki/alert.git` です

4. **ローカルのリモートURLを確認**
   - ターミナルで以下を実行：
   ```bash
   cd "/Users/yuuki.takada/Desktop/CSアラート機能"
   git remote -v
   ```

5. **リモートURLを更新（必要に応じて）**
   - リモートURLが間違っている場合：
   ```bash
   git remote set-url origin https://github.com/con-yuuki/alert.git
   ```

6. **プッシュを実行**
   ```bash
   git push -u origin main
   ```

### 方法2: 既存のリポジトリに接続する

もし既にリポジトリが存在する場合：

1. **GitHubでリポジトリを確認**
   - [https://github.com/con-yuuki?tab=repositories](https://github.com/con-yuuki?tab=repositories) にアクセス
   - 「alert」という名前のリポジトリがあるか確認

2. **リモートURLを確認**
   - リポジトリのページで「Code」ボタンをクリック
   - URLをコピー

3. **ローカルのリモートURLを更新**
   ```bash
   cd "/Users/yuuki.takada/Desktop/CSアラート機能"
   git remote set-url origin [コピーしたURL]
   ```

4. **プッシュを実行**
   ```bash
   git push -u origin main
   ```

## 確認方法

リポジトリが正しく接続されたか確認：

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
git remote -v
```

正しく表示されれば、プッシュを試みてください。

