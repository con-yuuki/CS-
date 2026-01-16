# Vercel環境変数の永続的な設定方法

## 重要なポイント

**環境変数は一度設定すれば、永続的に使用できます。毎回設定する必要はありません。**

## 現在の問題

再デプロイ後も環境変数が反映されない場合、以下の可能性があります：

1. **環境変数が正しく設定されていない**
2. **環境（Production/Preview/Development）が正しく選択されていない**
3. **環境変数の名前が間違っている**
4. **値に余分なスペースや文字が含まれている**

## 解決方法

### ステップ1: Vercelで環境変数を確認

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト `alert` を選択
3. 「Settings」→「Environment Variables」に移動
4. 以下の2つの環境変数が**存在するか**確認：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### ステップ2: 環境変数が存在しない場合

環境変数を追加してください：

#### 1つ目の環境変数

1. 「Add New」ボタンをクリック
2. **Key（キー）**: `NEXT_PUBLIC_SUPABASE_URL`（手動で入力）
3. **Value（値）**: `https://hcceyhmisbmclqrgfedr.supabase.co`
4. **Environment（環境）**: 
   - ✅ Production
   - ✅ Preview
   - ✅ Development
   - （または「All Environments」を選択）
5. 「Save」をクリック

#### 2つ目の環境変数

1. 「Add New」ボタンを再度クリック
2. **Key（キー）**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`（手動で入力）
3. **Value（値）**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw`
4. **Environment（環境）**: 
   - ✅ Production
   - ✅ Preview
   - ✅ Development
   - （または「All Environments」を選択）
5. 「Save」をクリック

### ステップ3: 環境変数が存在する場合

既に環境変数が存在する場合、以下を確認してください：

1. **環境の確認**
   - Production, Preview, Development **すべて**にチェックが入っているか確認
   - 一部の環境にしか設定されていない場合、その環境でのみ使用できます

2. **値の確認**
   - 値に余分なスペースや改行が含まれていないか確認
   - 値が正しいか確認

3. **名前の確認**
   - `NEXT_PUBLIC_` で始まっているか確認
   - 大文字小文字が正しいか確認

### ステップ4: 環境変数を削除して再作成

もし環境変数が正しく動作しない場合：

1. 既存の環境変数を削除
2. 上記の手順で再度作成
3. **再デプロイを実行**

### ステップ5: 再デプロイ

環境変数を追加・変更した後は、**必ず再デプロイ**が必要です：

1. 「Deployments」タブに移動
2. 最新のデプロイメントの「...」メニューをクリック
3. 「Redeploy」を選択
4. 「Redeploy」ボタンをクリック
5. デプロイが完了するまで待つ

## 確認方法

### 方法1: Vercelダッシュボードで確認

1. 「Settings」→「Environment Variables」に移動
2. 環境変数が表示されているか確認
3. 各環境変数の「Environment」列で、Production, Preview, Development すべてにチェックが入っているか確認

### 方法2: アプリケーションで確認

1. デプロイされたURLにアクセス
2. `/test-connection` ページにアクセス
3. 「接続テストを実行」ボタンをクリック
4. 「環境変数の設定: ✅ 正常」と表示されればOK

## よくある質問

### Q: 環境変数は毎回設定する必要がありますか？

A: **いいえ。一度設定すれば、永続的に使用できます。** 削除しない限り、設定は保持されます。

### Q: 環境変数を設定したのに、反映されません

A: 以下の点を確認してください：
1. 環境（Production, Preview, Development）が正しく選択されているか
2. 再デプロイを実行したか
3. 環境変数の名前が正しいか（`NEXT_PUBLIC_` で始まっているか）

### Q: どの環境に設定すればいいですか？

A: **Production, Preview, Development すべて**に設定することを推奨します。これにより、どの環境でも同じ環境変数が使用されます。

---

**重要**: 環境変数は一度設定すれば永続的に使用できます。毎回設定する必要はありません！




