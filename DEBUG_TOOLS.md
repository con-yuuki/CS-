# デバッグツールと開発効率化

## リアルタイムデバッグ機能

### 1. コンソールログの活用

コードに `console.log()` を追加すると、ブラウザのコンソールに表示されます：

```typescript
// データの確認
console.log("📊 インポートデータ:", parsedData);

// スコア計算の確認
console.log("📈 スコア計算結果:", {
  input: { currentPeriod, previousPeriod, mrc },
  output: scoreResult
});

// API呼び出しの確認
console.log("🔍 API呼び出し:", {
  endpoint: "usage_logs",
  data: cleanedLog
});
```

### 2. エラーの視覚的表示

- エラーがある場合、ブラウザにエラーメッセージが表示されます
- ターミナルにもエラーメッセージが表示されます
- エラーを修正すると、自動的に再読み込みされます

### 3. ネットワークタブでのAPI確認

1. F12キーで開発者ツールを開く
2. 「Network」タブを選択
3. ページを操作
4. APIリクエストを確認
5. リクエスト/レスポンスの詳細を確認

## 開発効率化のコツ

### 1. 2画面構成

```
┌─────────────────┬─────────────────┐
│  コードエディタ  │     ブラウザ     │
│   (Cursor)      │  localhost:3000 │
│                 │                 │
│  - ロジック編集  │  - 結果確認      │
│  - 機能追加      │  - エラー確認    │
│  - バグ修正      │  - デバッグ      │
└─────────────────┴─────────────────┘
```

### 2. 段階的な開発

1. **小さく変更** → 保存 → 確認
2. **動作確認** → 次の変更へ
3. **エラーが出たら** → すぐに修正

### 3. デバッグの流れ

1. **問題を特定**（ブラウザで確認）
2. **コンソールで確認**（エラーメッセージ）
3. **コードを修正**（該当ファイル）
4. **保存**（自動リロード）
5. **結果を確認**（ブラウザで確認）

## よく使うデバッグパターン

### パターン1: データフローの確認

```typescript
// データが正しく流れているか確認
console.log("1. パース結果:", parsedData);
console.log("2. バリデーション結果:", validationResult);
console.log("3. API送信データ:", apiData);
console.log("4. APIレスポンス:", apiResponse);
```

### パターン2: 条件分岐の確認

```typescript
// どの条件分岐に入ったか確認
if (condition) {
  console.log("✅ 条件Aに入りました");
  // ...
} else {
  console.log("❌ 条件Bに入りました");
  // ...
}
```

### パターン3: パフォーマンスの確認

```typescript
// 処理時間を測定
const startTime = performance.now();
// 処理...
const endTime = performance.now();
console.log(`⏱️ 処理時間: ${endTime - startTime}ms`);
```

## 実践的な開発例

### 例1: スコア計算ロジックの調整

1. `lib/score-calculator.ts` を開く
2. 計算ロジックを編集
3. デバッグログを追加：
   ```typescript
   console.log("📊 スコア計算:", { input, output: score });
   ```
4. 保存
5. `/import` でデータをインポート
6. コンソールで計算過程を確認
7. `/dashboard` で結果を確認

### 例2: バリデーションルールの追加

1. `lib/utils/excel-parser.ts` を開く
2. バリデーションロジックを追加
3. エラーメッセージを追加：
   ```typescript
   console.warn("⚠️ バリデーションエラー:", error);
   ```
4. 保存
5. `/import` でファイルをアップロード
6. コンソールでエラーを確認
7. UIでエラーメッセージを確認

### 例3: API呼び出しの最適化

1. `lib/services/*.ts` を開く
2. API呼び出しを最適化
3. リクエスト/レスポンスをログ：
   ```typescript
   console.log("🔍 API呼び出し:", { url, method, data });
   console.log("✅ APIレスポンス:", response);
   ```
4. 保存
5. ブラウザで動作を確認
6. ネットワークタブでリクエストを確認
7. コンソールでログを確認

---

**これで、機能やロジックも含めて、効率的に開発・デバッグできます！**

