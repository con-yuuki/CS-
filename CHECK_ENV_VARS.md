# 環境変数の確認チェックリスト

## 現在の状況

再デプロイ後も環境変数が反映されない場合、以下のチェックリストで確認してください。

## チェックリスト

### ✅ チェック1: 環境変数が存在するか

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト `alert` を選択
3. 「Settings」→「Environment Variables」に移動
4. 以下の2つが表示されているか確認：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**結果**: 
- ✅ 存在する → チェック2へ
- ❌ 存在しない → 環境変数を追加してください

### ✅ チェック2: 環境が正しく選択されているか

各環境変数の「Environment」列を確認：

- ✅ Production にチェックが入っているか
- ✅ Preview にチェックが入っているか
- ✅ Development にチェックが入っているか

**結果**: 
- ✅ すべてにチェックが入っている → チェック3へ
- ❌ 一部のみ → すべての環境にチェックを入れてください

### ✅ チェック3: 環境変数の値が正しいか

各環境変数の「Value」列を確認：

**`NEXT_PUBLIC_SUPABASE_URL`**:
- 値: `https://hcceyhmisbmclqrgfedr.supabase.co`
- 前後にスペースがないか確認
- `https://` で始まっているか確認

**`NEXT_PUBLIC_SUPABASE_ANON_KEY`**:
- 値: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw`
- 前後にスペースがないか確認
- 完全にコピーされているか確認

**結果**: 
- ✅ 値が正しい → チェック4へ
- ❌ 値が間違っている → 値を修正してください

### ✅ チェック4: 再デプロイを実行したか

1. 「Deployments」タブに移動
2. 最新のデプロイメントの状態を確認
3. 環境変数を追加・変更した後、再デプロイを実行したか確認

**結果**: 
- ✅ 再デプロイを実行した → チェック5へ
- ❌ 再デプロイを実行していない → 再デプロイを実行してください

### ✅ チェック5: デプロイが完了したか

1. 「Deployments」タブで最新のデプロイメントの状態を確認
2. ✅ **Ready** と表示されているか確認

**結果**: 
- ✅ Ready → チェック6へ
- ⏳ Building → デプロイが完了するまで待ってください
- ❌ Error → エラーログを確認してください

### ✅ チェック6: アプリケーションで確認

1. デプロイされたURLにアクセス
2. `/test-connection` ページにアクセス
3. 「接続テストを実行」ボタンをクリック
4. 「環境変数の設定: ✅ 正常」と表示されるか確認

**結果**: 
- ✅ 正常と表示される → 完了！
- ❌ エラーと表示される → 上記のチェックを再度確認してください

## それでも解決しない場合

### 方法1: 環境変数を削除して再作成

1. 既存の環境変数を削除
2. 上記の手順で再度作成
3. 再デプロイを実行

### 方法2: Vercel CLIを使用

ターミナルで以下のコマンドを実行：

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
# プロンプトが表示されたら、Valueを入力: https://hcceyhmisbmclqrgfedr.supabase.co

npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development
# プロンプトが表示されたら、Valueを入力: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw

npx vercel --prod
```

---

**重要**: 環境変数は一度設定すれば永続的に使用できます。毎回設定する必要はありません！




