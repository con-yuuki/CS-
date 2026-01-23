ALTER TABLE health_scores
  ADD COLUMN IF NOT EXISTS trend_status TEXT;

ALTER TABLE health_scores
  ADD COLUMN IF NOT EXISTS trend_change_pct NUMERIC;

ALTER TABLE health_scores
  ADD COLUMN IF NOT EXISTS zeroed_feature_alert BOOLEAN;

