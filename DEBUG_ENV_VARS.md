# 環境変数が読み込まれない問題のデバッグ方法

## 問題

再デプロイ後も「Supabase環境変数が設定されていません」というメッセージが表示される。

## デバッグ手順

### ステップ1: ブラウザのコンソールで確認

1. デプロイされたURLにアクセス
2. F12キーを押してDevToolsを開く
3. 「Console」タブを選択
4. `/test-connection` ページにアクセス
5. 「接続テストを実行」ボタンをクリック
6. コンソールに表示される「🔍 環境変数の確認:」のログを確認

**確認ポイント**:
- `hasUrl: true` と `hasKey: true` が表示されていれば、環境変数は読み込まれています
- `hasUrl: false` または `hasKey: false` が表示されていれば、環境変数が読み込まれていません

### ステップ2: Vercelで環境変数を再確認

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト `alert` を選択
3. 「Settings」→「Environment Variables」に移動
4. 以下の2つが存在するか確認：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### ステップ3: 環境変数の環境を確認

各環境変数の「Environment」列を確認：

- ✅ Production にチェックが入っているか
- ✅ Preview にチェックが入っているか
- ✅ Development にチェックが入っているか

**重要**: Production, Preview, Development **すべて**にチェックを入れてください。

### ステップ4: 環境変数の値を確認

各環境変数の「Value」列を確認：

**`NEXT_PUBLIC_SUPABASE_URL`**:
- 値: `https://hcceyhmisbmclqrgfedr.supabase.co`
- 前後にスペースがないか確認
- `https://` で始まっているか確認

**`NEXT_PUBLIC_SUPABASE_ANON_KEY`**:
- 値が完全にコピーされているか確認
- 前後にスペースがないか確認

### ステップ5: デプロイログを確認

1. 「Deployments」タブに移動
2. 最新のデプロイメントをクリック
3. 「Build Logs」を確認
4. 環境変数に関するエラーがないか確認

### ステップ6: 環境変数を削除して再作成

もし環境変数が正しく動作しない場合：

1. 既存の環境変数を削除
2. 上記の手順で再度作成
3. **再デプロイを実行**

## よくある問題

### 問題1: 環境変数が一部の環境にしか設定されていない

**解決方法**: Production, Preview, Development **すべて**にチェックを入れてください。

### 問題2: 環境変数の値に余分なスペースが含まれている

**解決方法**: 値をコピー&ペーストする際に、前後のスペースを削除してください。

### 問題3: 環境変数の名前が間違っている

**解決方法**: 以下の名前を正確に入力してください：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 問題4: ブラウザのキャッシュ

**解決方法**: ブラウザのキャッシュをクリアしてください（Ctrl+Shift+R または Cmd+Shift+R）。

## Vercel CLIで確認

ターミナルで以下のコマンドを実行して、環境変数を確認できます：

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
npx vercel env ls
```

これで、設定されている環境変数の一覧が表示されます。

---

**次のステップ**: ブラウザのコンソールで「🔍 環境変数の確認:」のログを確認し、結果を教えてください。

