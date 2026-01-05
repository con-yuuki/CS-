# トラブルシューティング: localhost に接続できない

## 問題: "localhost で接続が拒否されました"

### 原因1: 開発サーバーが起動していない

**解決方法:**
```bash
npm run dev
```

サーバーが起動すると、以下のメッセージが表示されます：
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 原因2: 環境変数の問題でサーバーがクラッシュしている

**確認方法:**
1. `.env.local` ファイルを開く
2. 以下の値が実際のSupabase認証情報になっているか確認：
   - `NEXT_PUBLIC_SUPABASE_URL` → `https://xxxxxxxxxxxxx.supabase.co` の形式
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `eyJ...` で始まるJWT形式
   - `SUPABASE_SERVICE_ROLE_KEY` → `eyJ...` で始まるJWT形式

**解決方法:**
- テンプレート値（`your-project`、`your_anon_key_here`など）が残っている場合は、実際のSupabase認証情報に置き換える

### 原因3: ポート3000が既に使用されている

**確認方法:**
```bash
lsof -ti:3000
```

**解決方法:**
別のポートで起動：
```bash
npm run dev -- -p 3001
```
その後、`http://localhost:3001` にアクセス

### 原因4: ファイアウォールやセキュリティソフトのブロック

**確認方法:**
- macOSのセキュリティ設定を確認
- ファイアウォールがlocalhostへの接続をブロックしていないか確認

## ステップバイステップの解決手順

### 1. サーバーの状態を確認

```bash
# サーバーが起動しているか確認
lsof -ti:3000

# 起動していない場合、起動
npm run dev
```

### 2. エラーログを確認

ターミナルに表示されるエラーメッセージを確認：
- `Missing Supabase environment variables` → 環境変数の問題
- `EADDRINUSE` → ポートが使用中
- その他のエラー → エラーメッセージに従って対処

### 3. ブラウザで確認

- `http://localhost:3000` にアクセス
- ブラウザの開発者ツール（F12）でコンソールエラーを確認

### 4. 環境変数の再確認

`.env.local` ファイルが正しく設定されているか確認：

```bash
# ファイルの存在確認
ls -la .env.local

# 内容の確認（値は表示されませんが、設定されているか確認）
grep -c "NEXT_PUBLIC_SUPABASE" .env.local
```

## よくあるエラーと解決方法

### エラー: "Missing Supabase environment variables"

**原因:** `.env.local` に環境変数が設定されていない、またはテンプレート値のまま

**解決方法:**
1. Supabase ダッシュボードで認証情報を取得
2. `.env.local` に正しい値を設定
3. 開発サーバーを再起動

### エラー: "EADDRINUSE: address already in use"

**原因:** ポート3000が既に使用されている

**解決方法:**
```bash
# 既存のプロセスを停止
pkill -f "next dev"

# または別のポートで起動
npm run dev -- -p 3001
```

### エラー: "Cannot find module"

**原因:** 依存関係がインストールされていない

**解決方法:**
```bash
npm install
```

## それでも解決しない場合

1. **サーバーを完全に再起動:**
   ```bash
   pkill -f "next dev"
   npm run dev
   ```

2. **キャッシュをクリア:**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **依存関係を再インストール:**
   ```bash
   rm -rf node_modules
   npm install
   npm run dev
   ```

4. **別のブラウザで試す:**
   - Chrome、Firefox、Safariなどで試す

5. **ターミナルのエラーログを確認:**
   - サーバー起動時のエラーメッセージを確認
   - エラーメッセージを共有していただければ、具体的な解決方法を提案できます

