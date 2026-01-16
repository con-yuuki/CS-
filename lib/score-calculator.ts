/**
 * CS Health Score 算出ロジック (v12.7 準拠)
 * 100点満点の減点方式で、高単価顧客（インパクト企業）の変動を強調する
 */

export interface UsageData {
  login_count: number;
  est_count: number;
  const_count: number;
  active_rate: number;
  other_features_total?: number; // ログイン以外の15機能の合計利用回数
}

export interface PreviousPeriodData {
  login_count: number;
  est_count: number;
  const_count: number;
  active_rate: number;
}

export interface ScoreCalculationParams {
  currentPeriod: UsageData;
  previousPeriod?: PreviousPeriodData;
  mrc: number; // 月額契約額
  periodType: "weekly" | "monthly";
}

export interface ScoreResult {
  score: number;
  status: "Excellent" | "Stable" | "Warning" | "Critical";
  breakdown: {
    baseScore: number;
    variationTotal: number; // インパクト係数適用前
    adjustedVariation: number; // インパクト係数適用後
    impactMultiplier: number;
    finalScore: number;
  };
  details: {
    basicUsage: number;
    estimateUsage: number;
    constructionUsage: number;
    activeRate: number;
    trend: number;
  };
}

const IMPACT_THRESHOLD = 55000; // インパクト企業の閾値（円）
const IMPACT_MULTIPLIER = 1.5; // インパクト係数

/**
 * ステップ1: 基本変動値の計算
 */
function calculateVariation(
  current: UsageData,
  previous?: PreviousPeriodData
): {
  basicUsage: number;
  estimateUsage: number;
  constructionUsage: number;
  activeRate: number;
  trend: number;
} {
  let basicUsage = 0;
  let estimateUsage = 0;
  let constructionUsage = 0;
  let activeRate = 0;
  let trend = 0;

  // 基本利用（ログインなし かつ その他15機能の合計利用回数も0）
  // ログイン回数が0かつ、その他15機能の合計利用回数も0の場合のみ-40点を適用
  if (current.login_count === 0) {
    const otherFeaturesTotal = current.other_features_total ?? 0;
    if (otherFeaturesTotal === 0) {
      basicUsage = -40;
    }
  }

  // 見積未利用
  if (current.est_count === 0) {
    estimateUsage = -15;
  }

  // 工事未利用
  if (current.const_count === 0) {
    constructionUsage = -15;
  }

  // Active率
  if (current.active_rate < 10) {
    activeRate = -15;
  } else if (current.active_rate > 50) {
    activeRate = 10;
  }

  // トレンド（前期間比）
  if (previous) {
    const loginChange =
      previous.login_count > 0
        ? ((current.login_count - previous.login_count) /
            previous.login_count) *
          100
        : current.login_count > 0
        ? 100
        : 0;

    // 大幅減少（20%以上減少）
    if (loginChange <= -20) {
      trend = -10;
    }
    // 増加・開始（未利用からの開始、または10%以上増加）
    else if (
      (previous.login_count === 0 && current.login_count > 0) ||
      loginChange >= 10
    ) {
      trend = 10;
    }
  } else {
    // 前期データがない場合、新規開始として扱う
    if (current.login_count > 0) {
      trend = 10;
    }
  }

  return {
    basicUsage,
    estimateUsage,
    constructionUsage,
    activeRate,
    trend,
  };
}

/**
 * ステップ2: インパクト係数の適用
 */
function applyImpactMultiplier(
  variationTotal: number,
  mrc: number
): number {
  if (mrc >= IMPACT_THRESHOLD) {
    return variationTotal * IMPACT_MULTIPLIER;
  }
  return variationTotal;
}

/**
 * ステップ3: 最終スコアの計算
 */
function calculateFinalScore(variationTotal: number): number {
  return Math.max(0, Math.min(100, 100 + variationTotal));
}

/**
 * ステータスの判定
 */
function determineStatus(score: number): "Excellent" | "Stable" | "Warning" | "Critical" {
  if (score >= 90) {
    return "Excellent";
  } else if (score >= 70) {
    return "Stable";
  } else if (score >= 50) {
    return "Warning";
  } else {
    return "Critical";
  }
}

/**
 * メインのスコア算出関数
 */
export function calculateHealthScore(
  params: ScoreCalculationParams
): ScoreResult {
  const { currentPeriod, previousPeriod, mrc, periodType } = params;

  // ステップ1: 基本変動値の計算
  const variations = calculateVariation(currentPeriod, previousPeriod);

  // 変動値の合計
  const variationTotal =
    variations.basicUsage +
    variations.estimateUsage +
    variations.constructionUsage +
    variations.activeRate +
    variations.trend;

  // ステップ2: インパクト係数の適用
  const adjustedVariation = applyImpactMultiplier(variationTotal, mrc);

  // ステップ3: 最終スコアの計算
  const finalScore = calculateFinalScore(adjustedVariation);

  // ステータスの判定
  const status = determineStatus(finalScore);
  
  return {
    score: Math.round(finalScore),
    status,
    breakdown: {
      baseScore: 100,
      variationTotal, // インパクト係数適用前
      adjustedVariation, // インパクト係数適用後
      impactMultiplier: mrc >= IMPACT_THRESHOLD ? IMPACT_MULTIPLIER : 1,
      finalScore: Math.round(finalScore),
    },
    details: variations,
  };
}

