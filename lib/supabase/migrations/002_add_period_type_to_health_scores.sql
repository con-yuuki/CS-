-- Add period_type to health_scores to separate weekly/monthly scores
ALTER TABLE health_scores
  ADD COLUMN IF NOT EXISTS period_type TEXT;

-- Backfill existing rows as monthly by default
UPDATE health_scores
SET period_type = 'monthly'
WHERE period_type IS NULL;

ALTER TABLE health_scores
  ALTER COLUMN period_type SET NOT NULL;

ALTER TABLE health_scores
  ADD CONSTRAINT health_scores_period_type_check
  CHECK (period_type IN ('weekly', 'monthly'));

ALTER TABLE health_scores
  DROP CONSTRAINT IF EXISTS health_scores_tenant_id_period_date_key;

ALTER TABLE health_scores
  ADD CONSTRAINT health_scores_tenant_id_period_type_period_date_key
  UNIQUE (tenant_id, period_type, period_date);

CREATE INDEX IF NOT EXISTS idx_health_scores_period_type ON health_scores(period_type);

