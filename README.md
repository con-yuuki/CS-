# CS Health Score Dashboard

顧客の利用ログデータを解析し、健康状態を「100点満点のスコア」として可視化するCS（カスタマーサクセス）向けダッシュボード。

## 技術スタック

- **Frontend**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend/DB**: Supabase (PostgreSQL, Row Level Security)
- **Data Fetching**: TanStack Query (v5)
- **Validation**: React Hook Form, Zod
- **Charts**: Recharts
- **Excel**: xlsx

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabase の設定

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. `.env.local` ファイルを作成し、以下の環境変数を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. データベーススキーマの適用

Supabase の SQL Editor で `lib/supabase/migrations/001_initial_schema.sql` の内容を実行してください。

または、Supabase CLI を使用する場合：

```bash
supabase db push
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 機能

### 1. データインポート (`/import`)

- Excel/CSV ファイルのドラッグ&ドロップ
- ヘッダー名の自動マッピング
- データのバリデーション
- 利用ログデータの一括インポート

### 2. メインダッシュボード (`/dashboard`)

- スコア一覧表示
- 企業名・ID での検索
- ステータス別フィルタリング
- インパクト企業（MRC ≥ 55,000円）のハイライト
- ポートフォリオ統計（平均点、ランク別社数分布）
- Excel 形式でのエクスポート

### 3. トレンド分析 (`/trends`)

- 企業別のスコア推移グラフ
- 前期間比での「急落企業」アラート表示

## スコア算出ロジック (v12.7)

システムは 100 点を満点とする減点方式を採用し、高単価顧客（インパクト企業）の変動を強調します。

### ステップ1: 基本変動値の計算

| カテゴリ | 項目 | 条件 | 変動値 |
|---------|------|------|--------|
| 基本利用 | ログインなし | 当該期間の利用が 0 | -40 |
| 見積未利用 | 見積未利用 | 当該期間の作成数が 0 | -15 |
| 工事未利用 | 工事未利用 | 当該期間の登録数が 0 | -15 |
| Active率 | 低Active | Active率 < 10% | -15 |
| Active率 | 高Active | Active率 > 50% | +10 |
| トレンド | 大幅減少 | 前月/前週比で 20%以上減少 | -10 |
| トレンド | 増加・開始 | 未利用からの開始、または 10%以上増加 | +10 |

### ステップ2: インパクト係数

対象: 月額契約額（MRC） ≥ 55,000 円の企業
補正: ステップ1で算出した「変動値の合計」を 1.5倍 に増幅

### ステップ3: 最終スコア

```
Score = max(0, min(100, 100 + (変動値合計 × 係数)))
```

## データベーススキーマ

### companies (マスタテーブル)

- `id`: integer (PK) - テナントID
- `name`: text - 企業名
- `mrc`: numeric - 月額契約額
- `is_excluded`: boolean - 分析除外フラグ
- `created_at`: timestamp - 作成日

### usage_logs (利用統計テーブル)

- `id`: uuid (PK) - ログID
- `tenant_id`: integer (FK) - 企業ID
- `period_type`: text - 'weekly' または 'monthly'
- `period_date`: date - 集計対象日
- `login_count`: integer - ログイン回数
- `est_count`: integer - 見積作成数
- `const_count`: integer - 工事登録数
- `active_rate`: numeric - Active率 (%)
- `raw_data`: jsonb - インポートされた生データ

### health_scores (解析結果テーブル)

- `id`: uuid (PK) - スコアID
- `tenant_id`: integer (FK) - 企業ID
- `score`: integer - 算出された合計点数
- `status`: text - Excellent / Stable / Warning / Critical
- `period_date`: date - 算出対象期間

## デプロイ

### Vercel へのデプロイ

1. GitHub リポジトリにプッシュ
2. [Vercel](https://vercel.com) でプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

## ライセンス

MIT

