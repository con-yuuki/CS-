# クイック開発ガイド

## 3ステップで開発開始

### ステップ1: 環境変数を設定

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
```

`.env.local` ファイルを作成（まだない場合）：

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://hcceyhmisbmclqrgfedr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw
EOF
```

### ステップ2: 開発サーバーを起動

```bash
npm run dev
```

### ステップ3: ブラウザで確認

1. `http://localhost:3000` にアクセス
2. コードを編集すると、**自動的にブラウザが更新されます**

## 開発のコツ

### リアルタイム編集

1. **2つのウィンドウを開く**：
   - 左：コードエディタ（Cursor）
   - 右：ブラウザ（`http://localhost:3000`）

2. **コードを編集**：
   - ファイルを保存（Cmd+S / Ctrl+S）
   - 数秒でブラウザが自動更新

3. **結果を確認**：
   - ブラウザで即座に変更を確認
   - エラーがあれば、ターミナルとブラウザに表示

### よく編集するファイル

- **UIの見た目**: `app/**/page.tsx`, `components/ui/*.tsx`
- **スタイル**: `app/globals.css`, `tailwind.config.ts`
- **ロジック**: `lib/**/*.ts`, `app/**/page.tsx`

### デバッグのコツ

1. **コンソールログ**: `console.log()` を追加
2. **開発者ツール**: F12キーで開く
3. **エラー確認**: ターミナルとブラウザの両方を確認

---

**これで、GeminiのCanvas機能のように、パッと見てパッと修正できます！**

