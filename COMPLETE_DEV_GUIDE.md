# 完全な開発ガイド（機能・ロジックも含む）

## 🎯 概要

見た目だけでなく、**機能やロジックも含めて**「パッと見てパッと修正」できる開発環境です。

## 🚀 セットアップ

### ステップ1: 開発サーバーを起動

```bash
cd "/Users/yuuki.takada/Desktop/CSアラート機能"
npm run dev
```

### ステップ2: ブラウザで開く

`http://localhost:3000` にアクセス

## 💡 開発の流れ

### 1. 2画面構成で作業

```
┌─────────────────┬─────────────────┐
│  コードエディタ  │     ブラウザ     │
│   (Cursor)      │  localhost:3000 │
│                 │                 │
│  - UI編集       │  - 見た目確認    │
│  - ロジック編集  │  - 機能確認      │
│  - バグ修正      │  - エラー確認    │
│  ↓             │  ↓             │
│  保存 (Cmd+S)   │  自動更新！      │
└─────────────────┴─────────────────┘
```

### 2. 編集→保存→確認のサイクル

1. **コードを編集**（UI、ロジック、スタイルすべて）
2. **保存**（Cmd+S / Ctrl+S）
3. **数秒で自動更新**（ブラウザが自動リロード）
4. **結果を確認**（ブラウザで即座に確認）

## 🛠️ 実践的な開発例

### 例1: スコア計算ロジックの調整

1. `lib/score-calculator.ts` を開く
2. 計算ロジックを編集
3. デバッグログを追加：
   ```typescript
   import { devLog } from "@/lib/utils/dev-logger";
   
   devLog.data("スコア計算入力", { currentPeriod, previousPeriod, mrc });
   devLog.data("スコア計算結果", scoreResult);
   ```
4. 保存
5. `/import` でデータをインポート
6. ブラウザのコンソール（F12）で計算過程を確認
7. `/dashboard` で結果を確認

### 例2: バリデーションルールの追加

1. `lib/utils/excel-parser.ts` を開く
2. バリデーションロジックを追加
3. エラーログを追加：
   ```typescript
   import { devLog } from "@/lib/utils/dev-logger";
   
   devLog.warn("バリデーションエラー", error);
   ```
4. 保存
5. `/import` でファイルをアップロード
6. コンソールでエラーを確認
7. UIでエラーメッセージを確認

### 例3: API呼び出しの最適化

1. `lib/services/*.ts` を開く
2. API呼び出しを最適化
3. パフォーマンス測定を追加：
   ```typescript
   import { measurePerformanceAsync } from "@/lib/utils/dev-logger";
   
   const result = await measurePerformanceAsync(
     "API呼び出し: usage_logs",
     () => supabase.from("usage_logs").select("*")
   );
   ```
4. 保存
5. ブラウザで動作を確認
6. コンソールで処理時間を確認

### 例4: UIコンポーネントの動作確認

1. 任意のページファイルを開く
2. デバッグパネルを追加：
   ```typescript
   import { DebugPanel } from "@/components/dev/DebugPanel";
   
   <DebugPanel data={{ state, props }} title="コンポーネント状態" />
   ```
3. 保存
4. ブラウザでデバッグパネルを確認
5. 状態の変化をリアルタイムで確認

## 🔍 デバッグツール

### 1. 開発用ロガー

`lib/utils/dev-logger.ts` を使用：

```typescript
import { devLog } from "@/lib/utils/dev-logger";

// データの確認
devLog.data("インポートデータ", parsedData);

// エラーの確認
devLog.error("エラーが発生", error);

// API呼び出しの確認
devLog.api("POST", "/api/usage_logs", data);

// パフォーマンス測定
const startTime = performance.now();
// 処理...
devLog.performance("処理名", startTime);
```

### 2. デバッグパネル

`components/dev/DebugPanel.tsx` を使用：

```typescript
import { DebugPanel } from "@/components/dev/DebugPanel";

<DebugPanel data={yourData} title="デバッグ情報" />
```

### 3. ブラウザの開発者ツール

- **F12キー**で開発者ツールを開く
- **Console**タブ：ログとエラーを確認
- **Network**タブ：APIリクエストを確認
- **Elements**タブ：HTMLとスタイルを確認

## 📝 よく編集するファイル

### UI・見た目

- `app/page.tsx` - ホームページ
- `app/import/page.tsx` - インポートページ
- `app/dashboard/page.tsx` - ダッシュボード
- `app/trends/page.tsx` - トレンド分析
- `components/ui/*.tsx` - UIコンポーネント

### ロジック・機能

- `lib/score-calculator.ts` - スコア計算
- `lib/services/*.ts` - API呼び出し
- `lib/utils/excel-parser.ts` - データパース
- `lib/utils/excel-exporter.ts` - データエクスポート

### スタイル

- `app/globals.css` - グローバルスタイル
- `tailwind.config.ts` - Tailwind設定

## ⚡ 便利なショートカット

### Cursor（エディタ）

- **Cmd+S / Ctrl+S**: 保存（自動リロード）
- **Cmd+P / Ctrl+P**: ファイルを開く
- **Cmd+Shift+F / Ctrl+Shift+F**: 全体検索
- **Cmd+B / Ctrl+B**: サイドバーの表示/非表示

### ブラウザ

- **Cmd+R / Ctrl+R**: 通常のリロード
- **Cmd+Shift+R / Ctrl+Shift+R**: ハードリロード
- **F12**: 開発者ツールを開く
- **Cmd+Option+I / Ctrl+Shift+I**: 開発者ツールを開く

## 🎨 開発のコツ

### 1. 小さく変更して確認

- 一度に大きな変更をせず、小さく変更して確認
- 動作確認しながら進める

### 2. デバッグログを活用

- 問題箇所に `devLog.data()` を追加
- コンソールでデータの流れを確認

### 3. エラーメッセージを読む

- ターミナルのエラーメッセージを確認
- ブラウザのコンソールのエラーメッセージを確認
- エラーメッセージから問題箇所を特定

## 🚨 トラブルシューティング

### ホットリロードが動作しない

1. ブラウザのキャッシュをクリア（Cmd+Shift+R）
2. 開発サーバーを再起動（Ctrl+C → `npm run dev`）
3. `.next` フォルダを削除：
   ```bash
   rm -rf .next
   npm run dev
   ```

### エラーが表示される

1. **ターミナルを確認**：エラーメッセージが表示されます
2. **ブラウザのコンソールを確認**：F12キーで開く
3. **エラーを修正**：自動的に再読み込みされます

---

**これで、機能やロジックも含めて、パッと見てパッと修正できる環境が整いました！** 🎉




