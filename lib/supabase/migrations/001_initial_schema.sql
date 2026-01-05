-- 既存の「ユーザー基礎情報」テーブルを使用
-- テーブル作成は不要（既に存在するため）

-- Usage Logs テーブル
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id BIGINT NOT NULL REFERENCES "ユーザー基礎情報"(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly')),
  period_date DATE NOT NULL,
  login_count INTEGER NOT NULL DEFAULT 0,
  est_count INTEGER NOT NULL DEFAULT 0,
  const_count INTEGER NOT NULL DEFAULT 0,
  active_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, period_type, period_date)
);

-- Health Scores テーブル
CREATE TABLE IF NOT EXISTS health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id BIGINT NOT NULL REFERENCES "ユーザー基礎情報"(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  status TEXT NOT NULL CHECK (status IN ('Excellent', 'Stable', 'Warning', 'Critical')),
  period_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, period_date)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant_id ON usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_period_date ON usage_logs(period_date);
CREATE INDEX IF NOT EXISTS idx_health_scores_tenant_id ON health_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_period_date ON health_scores(period_date);
CREATE INDEX IF NOT EXISTS idx_health_scores_status ON health_scores(status);

-- Row Level Security (RLS) の有効化
-- 既存の「ユーザー基礎情報」テーブルのRLSは既に設定されていると仮定
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能（本番環境では適切な認証ポリシーを設定してください）
CREATE POLICY "Allow all read access" ON usage_logs FOR SELECT USING (true);
CREATE POLICY "Allow all read access" ON health_scores FOR SELECT USING (true);

-- 全ユーザーが書き込み可能（本番環境では適切な認証ポリシーを設定してください）
CREATE POLICY "Allow all insert access" ON usage_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all insert access" ON health_scores FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update access" ON usage_logs FOR UPDATE USING (true);
CREATE POLICY "Allow all update access" ON health_scores FOR UPDATE USING (true);

CREATE POLICY "Allow all delete access" ON usage_logs FOR DELETE USING (true);
CREATE POLICY "Allow all delete access" ON health_scores FOR DELETE USING (true);

