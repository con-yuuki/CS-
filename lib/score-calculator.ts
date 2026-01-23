/**
 * CS Health Score 算出ロジック（積み上げ方式）
 * 指定の全16機能＋ログインについて、期間内のアクション数が count > 0 なら加点する
 */

export interface FeatureCounts {
  [featureKey: string]: number;
}

export interface PeriodData {
  login_count: number;
  feature_counts: FeatureCounts;
}

export interface ScoreCalculationParams {
  currentPeriod: PeriodData;
  previousPeriod?: PeriodData;
  mrc: number; // 月額契約額
}

export interface ScoreResult {
  score: number;
  status: "Excellent" | "Stable" | "Warning" | "Critical";
  trendChangePct: number;
  trendStatus: "up" | "down" | "flat";
  zeroedFeatureAlert: boolean;
  totalActions: number;
  previousTotalActions: number;
  breakdown: {
    activeFeatures: number;
    totalFeatureSlots: number;
    loginActive: boolean;
  };
}

const IMPACT_THRESHOLD = 55000;
const DEFAULT_FEATURE_SLOTS = 16;

function determineStatus(score: number): "Excellent" | "Stable" | "Warning" | "Critical" {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Stable";
  if (score >= 50) return "Warning";
  return "Critical";
}

function sumActions(counts: FeatureCounts): number {
  return Object.values(counts).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

function calculateTrendChange(currentTotal: number, previousTotal: number): number {
  if (previousTotal === 0) {
    return currentTotal > 0 ? 100 : 0;
  }
  return ((currentTotal - previousTotal) / previousTotal) * 100;
}

function detectZeroedFeature(current: FeatureCounts, previous?: FeatureCounts): boolean {
  if (!previous) return false;
  return Object.keys(previous).some((key) => (Number(previous[key]) || 0) > 0 && (Number(current[key]) || 0) === 0);
}

/**
 * メインのスコア算出関数
 */
export function calculateHealthScore(params: ScoreCalculationParams): ScoreResult {
  const { currentPeriod, previousPeriod, mrc } = params;
  const featureKeys = Array.from(
    new Set([
      ...Object.keys(currentPeriod.feature_counts || {}),
      ...Object.keys(previousPeriod?.feature_counts || {}),
    ])
  );
  const totalFeatureSlots = Math.max(DEFAULT_FEATURE_SLOTS, featureKeys.length);
  const activeFeatures = featureKeys.filter((key) => (Number(currentPeriod.feature_counts[key]) || 0) > 0).length;
  const loginActive = (Number(currentPeriod.login_count) || 0) > 0;
  const score = Math.round(((activeFeatures + (loginActive ? 1 : 0)) / (totalFeatureSlots + 1)) * 100);

  const currentTotal = sumActions(currentPeriod.feature_counts) + (Number(currentPeriod.login_count) || 0);
  const previousTotal =
    (previousPeriod ? sumActions(previousPeriod.feature_counts) : 0) +
    (previousPeriod ? (Number(previousPeriod.login_count) || 0) : 0);
  const trendChangePct = calculateTrendChange(currentTotal, previousTotal);
  const trendStatus = trendChangePct > 0 ? "up" : trendChangePct < 0 ? "down" : "flat";
  const zeroedFeatureAlert = detectZeroedFeature(currentPeriod.feature_counts, previousPeriod?.feature_counts);

  return {
    score,
    status: determineStatus(score),
    trendChangePct,
    trendStatus,
    zeroedFeatureAlert,
    totalActions: currentTotal,
    previousTotalActions: previousTotal,
    breakdown: {
      activeFeatures,
      totalFeatureSlots,
      loginActive,
    },
  };
}

