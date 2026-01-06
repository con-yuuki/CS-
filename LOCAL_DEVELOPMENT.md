# ローカル開発環境でのブラッシュアップ方法

## 概要

本番環境にデプロイする前に、ローカル環境で「パッと見てパッと修正」できる開発環境をセットアップします。

## セットアップ手順

### ステップ1: 環境変数の設定

1. プロジェクトルートに `.env.local` ファイルを作成（まだない場合）
2. 以下の内容を追加：

```env
NEXT_PUBLIC_SUPABASE_URL=https://hcceyhmisbmclqrgfedr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw
```

### ステップ2: 開発サーバーの起動

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
npm run dev
```

### ステップ3: ブラウザで確認

1. ブラウザで `http://localhost:3000` にアクセス
2. コードを編集すると、**自動的にブラウザが更新されます**（ホットリロード）

## 開発の流れ

### 1. コードを編集

- ファイルを編集すると、Next.jsが自動的に変更を検知
- ブラウザが自動的にリロードされます
- エラーがある場合は、ブラウザとターミナルの両方に表示されます

### 2. リアルタイムで確認

- ブラウザで `http://localhost:3000` を開いたまま
- コードを編集すると、数秒で変更が反映されます
- ページをリロードする必要はありません

### 3. エラーの確認

- ターミナルにエラーメッセージが表示されます
- ブラウザにもエラーが表示されます
- エラーを修正すると、自動的に再読み込みされます

## 便利な機能

### ブラウザの開発者ツール

1. **F12キー**で開発者ツールを開く
2. **Elements**タブでHTMLを確認・編集（一時的）
3. **Console**タブでJavaScriptのエラーやログを確認
4. **Network**タブでAPIリクエストを確認

### ホットリロードの確認

- ファイルを保存すると、ターミナルに「✓ Compiled successfully」と表示されます
- ブラウザが自動的に更新されます
- ページの状態（フォーム入力など）は保持されます

## よく使うコマンド

```bash
# 開発サーバーを起動
npm run dev

# ビルド（本番環境と同じ状態で確認）
npm run build
npm run start

# リンター（コードの品質チェック）
npm run lint
```

## 本番環境へのデプロイ前の確認

### 1. ローカルでビルドテスト

```bash
npm run build
```

エラーがないか確認します。

### 2. 本番環境と同じ状態で確認

```bash
npm run build
npm run start
```

`http://localhost:3000` で本番環境と同じ状態を確認できます。

### 3. VercelのPreview環境で確認

1. GitHubにプッシュすると、自動的にPreview環境が作成されます
2. VercelダッシュボードでPreview URLを確認
3. 問題なければ、本番環境にマージ

## トラブルシューティング

### ホットリロードが動作しない場合

1. ブラウザのキャッシュをクリア
2. 開発サーバーを再起動（Ctrl+C で停止してから `npm run dev`）
3. `.next` フォルダを削除して再起動

### 環境変数が読み込まれない場合

1. `.env.local` ファイルが正しい場所にあるか確認
2. ファイル名が `.env.local` であることを確認
3. 開発サーバーを再起動

---

**これで、GeminiのCanvas機能のように、パッと見てパッと修正できる環境が整いました！**

