# GitHubへのプッシュ手順

## 方法1: GitHub CLIを使用（推奨）

GitHub CLIがインストールされている場合：

```bash
gh auth login
git push -u origin main
```

## 方法2: Personal Access Tokenを使用

1. [GitHub Settings](https://github.com/settings/tokens) にアクセス
2. 「Generate new token」→「Generate new token (classic)」をクリック
3. トークン名を入力（例: `cs-alert-deploy`）
4. スコープで「repo」にチェック
5. 「Generate token」をクリック
6. 表示されたトークンをコピー（一度しか表示されません）

7. ターミナルで以下のコマンドを実行：

```bash
git push -u origin main
```

ユーザー名: `con-yuuki`
パスワード: （上記でコピーしたPersonal Access Tokenを貼り付け）

## 方法3: GitHub Desktopを使用

1. [GitHub Desktop](https://desktop.github.com/) をインストール
2. GitHub Desktopでリポジトリを開く
3. 「Publish repository」をクリック

## 方法4: 手動でプッシュ（最も簡単）

以下のコマンドをターミナルで実行してください：

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
git push -u origin main
```

認証が求められたら：
- ユーザー名: `con-yuuki`
- パスワード: GitHub Personal Access Token（上記の方法2で作成）

---

**注意**: パスワードには通常のGitHubパスワードではなく、Personal Access Tokenを使用する必要があります。

