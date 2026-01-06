# 開発サーバーの起動方法（超簡単版）

## 🚀 3ステップで起動

### ステップ1: ターミナルを開く

1. **Cursorの画面下部にある「ターミナル」をクリック**
   - 画面の一番下に「ターミナル」というタブがあります
   - または、キーボードで `Cmd+J` (Mac) / `Ctrl+J` (Windows) を押す

### ステップ2: コマンドを入力

ターミナルに以下を**そのままコピー&ペースト**してEnter：

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能" && npm run dev
```

### ステップ3: 「Ready」と表示されるまで待つ

ターミナルに以下のように表示されます：

```
  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
  ✓ Ready in 2.3s
```

**「Ready」と表示されたら準備完了です！**

## ✅ 確認方法

### ターミナルで確認

以下のように表示されていれば、サーバーが起動しています：

```
✓ Compiled successfully
  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
  ✓ Ready in 2.3s
```

### ブラウザで確認

1. ブラウザで `http://localhost:3000` にアクセス
2. ホームページが表示されれば成功です！

## 🛑 サーバーを停止する方法

ターミナルで `Ctrl+C` を押すと、サーバーが停止します。

## ❌ エラーが出た場合

### 「command not found」と表示される

1. まず、プロジェクトのディレクトリに移動：
   ```bash
   cd "/Users/yuuki.takada/Desktop/CSアラート機能"
   ```
2. その後、開発サーバーを起動：
   ```bash
   npm run dev
   ```

### 「Port 3000 is already in use」と表示される

1. 既に起動しているサーバーを停止（ターミナルで `Ctrl+C`）
2. 再度起動：
   ```bash
   npm run dev
   ```

### 「Cannot find module」と表示される

1. 依存関係をインストール：
   ```bash
   npm install
   ```
2. その後、開発サーバーを起動：
   ```bash
   npm run dev
   ```

---

**開発サーバーを起動すれば、404エラーは解決します！**

