# Vercel環境変数エラー修正方法

## エラー内容

「The name contains invalid characters. Only letters, digits, and underscores are allowed. Furthermore, the name should not start with a digit.」

このエラーは、環境変数のキー名（Key）に無効な文字が含まれている場合に表示されます。

## 原因

以下のいずれかが原因の可能性があります：

1. **コピー&ペースト時に見えない文字が混入**
   - スペース、改行、タブなど
   - 全角文字が混入

2. **入力欄に余分な文字が入っている**
   - 前後のスペース
   - 特殊文字

## 解決方法

### 方法1: 手動で入力し直す（推奨）

**1つ目の環境変数：**

1. **Key（キー）の入力欄を完全にクリア**
   - 入力欄を選択して、すべて削除（Ctrl+A → Delete または Cmd+A → Delete）

2. **以下を手動で入力**（コピー&ペーストではなく、**1文字ずつ手動入力**）：
   ```
   NEXT_PUBLIC_SUPABASE_URL
   ```
   - 大文字小文字を正確に入力
   - アンダースコア（_）を正確に入力
   - スペースは入れない

3. **Value（値）の入力欄に以下を入力**：
   ```
   https://hcceyhmisbmclqrgfedr.supabase.co
   ```

4. **Environment（環境）を選択**：
   - Production
   - Preview
   - Development
   - または「All Environment」を選択

5. **「Save」ボタンをクリック**

**2つ目の環境変数：**

1. **「Add Another」ボタンをクリック**

2. **Key（キー）の入力欄を完全にクリア**

3. **以下を手動で入力**：
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

4. **Value（値）の入力欄に以下を入力**：
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw
   ```

5. **Environment（環境）を選択**

6. **「Save」ボタンをクリック**

### 方法2: テキストエディタで確認してからコピー

1. テキストエディタ（メモ帳、TextEditなど）を開く
2. 以下を入力：
   ```
   NEXT_PUBLIC_SUPABASE_URL
   ```
3. スペースや特殊文字がないか確認
4. コピーしてVercelの入力欄に貼り付け

### 方法3: 文字数を確認

正しいキー名の文字数：

- `NEXT_PUBLIC_SUPABASE_URL`: 24文字
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 28文字

入力したキー名の文字数が一致するか確認してください。

## 注意事項

- **大文字小文字を正確に**: `NEXT_PUBLIC_SUPABASE_URL`（すべて大文字）
- **アンダースコア（_）を使用**: ハイフン（-）やスペースは使用しない
- **数字で始まらない**: キー名は文字で始まる必要がある
- **スペースを入れない**: キー名の前後にスペースを入れない

## 正しいキー名（コピー用）

以下をコピーして使用してください（見えない文字が含まれていないことを確認）：

```
NEXT_PUBLIC_SUPABASE_URL
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## それでもエラーが出る場合

1. **ブラウザをリロード**してから再度試す
2. **別のブラウザ**で試す
3. **Vercel CLIを使用**して設定する（以下のコマンドを実行）：

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
# プロンプトが表示されたら、Valueを入力: https://hcceyhmisbmclqrgfedr.supabase.co

npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development
# プロンプトが表示されたら、Valueを入力: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw
```

