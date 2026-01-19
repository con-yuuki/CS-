/**
 * CS Health Score 算出ロジック（現在表示している設計案に準拠）
 */

export type ActivityEntry = {
  name: string;
  count: number;
};

export type ActivityData = ActivityEntry[] | Record<string, number>;

export interface LoginStats {
  loginDays: number;
  workingDays: number;
}

export interface ScoreCalculationParams {
  activityData: ActivityData;
  loginStats: LoginStats;
}

export type TrendStatus = "up" | "down" | "flat";

export interface TrendResult {
  currentTotalActions: number;
  previousTotalActions: number;
  changePercent: number;
  status: TrendStatus;
  hasFeatureDrop: boolean;
  droppedFeatures: string[];
}

export interface ScoreResult {
  score: number;
  status: "Excellent" | "Stable" | "Warning" | "Critical";
  breakdown: {
    loginUsed: boolean;
    usedFeatureCount: number;
    totalFeatureCount: number;
    scorePerItem: number;
    rawScore: number;
    finalScore: number;
  };
}

export const CORE_FEATURE_DEFINITIONS = [
  { key: "工事", patterns: ["工事登録", "工事"] },
  { key: "顧客", patterns: ["顧客登録", "顧客"] },
  { key: "見積", patterns: ["見積作成", "見積"] },
  { key: "請求書", patterns: ["請求書作成", "請求書"] },
  { key: "商品発注書", patterns: ["商品発注書作成", "商品発注書", "商品発注"] },
  { key: "外注発注書", patterns: ["外注発注書作成", "外注発注書", "外注発注"] },
  { key: "実行予算", patterns: ["実行予算作成", "実行予算", "予算作成", "予算"] },
];

export const PERIPHERAL_FEATURE_DEFINITIONS = [
  { key: "業者登録", patterns: ["業者登録", "業者"] },
  { key: "現場連絡表", patterns: ["現場連絡表作成", "現場連絡表", "現場連絡"] },
  { key: "メール送信", patterns: ["メール送信", "書類メール", "書類メール送信"] },
  { key: "資料登録", patterns: ["資料登録", "資料"] },
  { key: "写真登録", patterns: ["写真登録", "写真"] },
  { key: "工程表", patterns: ["工程表作成", "工程表"] },
  { key: "タスク", patterns: ["タスク登録", "タスク"] },
  { key: "日報", patterns: ["日報登録", "日報"] },
  { key: "その他", patterns: ["その他"] },
];

export const SCORE_FEATURE_DEFINITIONS = [
  ...CORE_FEATURE_DEFINITIONS,
  ...PERIPHERAL_FEATURE_DEFINITIONS,
];

const LOGIN_PATTERNS = ["ログイン", "login"];
const STATUS_THRESHOLDS = {
  excellent: 90,
  stable: 70,
  warning: 50,
};

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[\s　_]/g, "");
}

function normalizeActivityData(activityData: ActivityData): ActivityEntry[] {
  if (Array.isArray(activityData)) {
    return activityData.map((entry) => ({
      name: entry.name,
      count: Number(entry.count || 0),
    }));
  }

  return Object.entries(activityData).map(([name, count]) => ({
    name,
    count: Number(count || 0),
  }));
}

function matchesPattern(name: string, pattern: string): boolean {
  const normalizedName = normalizeText(name);
  const normalizedPattern = normalizeText(pattern);
  return (
    normalizedName.includes(normalizedPattern) ||
    normalizedPattern.includes(normalizedName)
  );
}

function hasUsage(entries: ActivityEntry[], patterns: string[]): boolean {
  return entries.some(
    (entry) =>
      entry.count > 0 && patterns.some((pattern) => matchesPattern(entry.name, pattern))
  );
}

function isMatchedByDefinitions(
  entryName: string,
  definitions: { patterns: string[] }[]
): boolean {
  return definitions.some((definition) =>
    definition.patterns.some((pattern) => matchesPattern(entryName, pattern))
  );
}

function sumCounts(entries: ActivityEntry[]): number {
  return entries.reduce((total, entry) => total + (Number(entry.count) || 0), 0);
}

function getCountByPatterns(entries: ActivityEntry[], patterns: string[]): number {
  return entries.reduce((total, entry) => {
    if (entry.count <= 0) return total;
    if (patterns.some((pattern) => matchesPattern(entry.name, pattern))) {
      return total + entry.count;
    }
    return total;
  }, 0);
}

function getOtherUsageCount(entries: ActivityEntry[], definitions: { patterns: string[] }[]): number {
  return entries.reduce((total, entry) => {
    if (entry.count <= 0) return total;
    const matched = definitions.some((definition) =>
      definition.patterns.some((pattern) => matchesPattern(entry.name, pattern))
    );
    return matched ? total : total + entry.count;
  }, 0);
}

function buildFeatureUsageCounts(
  entries: ActivityEntry[]
): Record<string, number> {
  const definitionsWithoutOther = SCORE_FEATURE_DEFINITIONS.filter(
    (feature) => feature.key !== "その他"
  );
  const counts: Record<string, number> = {};

  for (const definition of definitionsWithoutOther) {
    counts[definition.key] = getCountByPatterns(entries, definition.patterns);
  }

  const otherDefinition = SCORE_FEATURE_DEFINITIONS.find((feature) => feature.key === "その他");
  const otherPatternCount = otherDefinition
    ? getCountByPatterns(entries, otherDefinition.patterns)
    : 0;
  const otherFallbackCount = getOtherUsageCount(entries, definitionsWithoutOther);
  counts["その他"] = otherPatternCount > 0 ? otherPatternCount : otherFallbackCount;

  return counts;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function determineStatus(score: number): "Excellent" | "Stable" | "Warning" | "Critical" {
  if (score >= STATUS_THRESHOLDS.excellent) return "Excellent";
  if (score >= STATUS_THRESHOLDS.stable) return "Stable";
  if (score >= STATUS_THRESHOLDS.warning) return "Warning";
  return "Critical";
}

export function calculateHealthScore(params: ScoreCalculationParams): ScoreResult {
  const { activityData, loginStats } = params;
  const entries = normalizeActivityData(activityData);

  const loginDays = Math.max(0, Number(loginStats.loginDays || 0));
  const loginUsed = loginDays > 0 || hasUsage(entries, LOGIN_PATTERNS);

  const featureUsageCounts = buildFeatureUsageCounts(entries);
  const usedFeatureCount = SCORE_FEATURE_DEFINITIONS.filter(
    (feature) => featureUsageCounts[feature.key] > 0
  ).length;

  const totalItems = SCORE_FEATURE_DEFINITIONS.length + 1;
  const scorePerItem = 100 / totalItems;
  const rawScore = (usedFeatureCount + (loginUsed ? 1 : 0)) * scorePerItem;
  const finalScore = clampScore(rawScore);
  const status = determineStatus(finalScore);

  return {
    score: Math.round(finalScore),
    status,
    breakdown: {
      loginUsed,
      usedFeatureCount,
      totalFeatureCount: SCORE_FEATURE_DEFINITIONS.length,
      scorePerItem: round2(scorePerItem),
      rawScore: round2(rawScore),
      finalScore: Math.round(finalScore),
    },
  };
}

export function calculateTrend(
  currentActivityData: ActivityData,
  previousActivityData?: ActivityData | null
): TrendResult {
  const currentEntries = normalizeActivityData(currentActivityData);
  const previousEntries = normalizeActivityData(previousActivityData ?? []);

  const currentTotalActions = sumCounts(currentEntries);
  const previousTotalActions = sumCounts(previousEntries);

  const changePercent =
    previousTotalActions > 0
      ? ((currentTotalActions - previousTotalActions) / previousTotalActions) * 100
      : currentTotalActions > 0
      ? 100
      : 0;

  const status: TrendStatus =
    changePercent > 0 ? "up" : changePercent < 0 ? "down" : "flat";

  const currentFeatureCounts = buildFeatureUsageCounts(currentEntries);
  const previousFeatureCounts = buildFeatureUsageCounts(previousEntries);

  const droppedFeatures = SCORE_FEATURE_DEFINITIONS.filter(
    (feature) => (previousFeatureCounts[feature.key] || 0) > 0 && (currentFeatureCounts[feature.key] || 0) === 0
  ).map((feature) => feature.key);

  return {
    currentTotalActions,
    previousTotalActions,
    changePercent: round2(changePercent),
    status,
    hasFeatureDrop: droppedFeatures.length > 0,
    droppedFeatures,
  };
}

