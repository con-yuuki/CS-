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

export interface CustomerProfile {
  mrc: number;
}

export interface PreviousScore {
  rawScore?: number;
  score?: number;
}

export interface ScoreCalculationParams {
  activityData: ActivityData;
  loginStats: LoginStats;
  customerProfile: CustomerProfile;
  previousScore?: PreviousScore;
}

export interface ScoreResult {
  score: number;
  status: "Excellent" | "Stable" | "Warning" | "Critical";
  breakdown: {
    continuation: number;
    core: number;
    peripheral: number;
    rawScore: number;
    adjustedScore: number;
    impactMultiplier: number;
    impactApplied: boolean;
    impactDrop: number;
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

const IMPACT_THRESHOLD = 55000;
const IMPACT_MULTIPLIER = 1.5;
const CORE_POINT = 10;
const CONTINUATION_MAX = 10;
const CONTINUATION_PARTIAL = 5;
const PERIPHERAL_POINT = 20 / 9;

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

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function determineStatus(score: number): "Excellent" | "Stable" | "Warning" | "Critical" {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Stable";
  if (score >= 50) return "Warning";
  return "Critical";
}

export function calculateHealthScore(params: ScoreCalculationParams): ScoreResult {
  const { activityData, loginStats, customerProfile, previousScore } = params;
  const entries = normalizeActivityData(activityData);
  const workingDays = Math.max(1, Number(loginStats.workingDays || 0));
  const loginDays = Math.max(0, Number(loginStats.loginDays || 0));

  // 継続利用
  const loginRate = loginDays / workingDays;
  const continuationScore =
    loginRate >= 0.5 ? CONTINUATION_MAX : loginDays >= 1 ? CONTINUATION_PARTIAL : 0;

  // コア業務
  const coreUsedCount = CORE_FEATURE_DEFINITIONS.filter((feature) =>
    hasUsage(entries, feature.patterns)
  ).length;
  const coreScore = coreUsedCount * CORE_POINT;

  // 周辺活用
  const peripheralDefinitions = PERIPHERAL_FEATURE_DEFINITIONS.filter(
    (feature) => feature.key !== "その他"
  );
  const peripheralUsedCount = peripheralDefinitions.filter((feature) =>
    hasUsage(entries, feature.patterns)
  ).length;

  const hasOtherUsage = entries.some(
    (entry) =>
      entry.count > 0 && !isMatchedByDefinitions(entry.name, [...CORE_FEATURE_DEFINITIONS, ...peripheralDefinitions])
  );

  const peripheralScore = (peripheralUsedCount + (hasOtherUsage ? 1 : 0)) * PERIPHERAL_POINT;

  // 素点
  const rawScore = continuationScore + coreScore + peripheralScore;

  // インパクト係数
  const previousRawScore = previousScore?.rawScore ?? previousScore?.score ?? 0;
  const isImpactCompany = Number(customerProfile.mrc || 0) >= IMPACT_THRESHOLD;
  const dropAmount = previousRawScore > 0 ? previousRawScore - rawScore : 0;
  const dropPercent = previousRawScore > 0 ? dropAmount / previousRawScore : 0;
  const impactApplied = isImpactCompany && dropPercent >= 0.2 && dropAmount > 0;
  const adjustedScore = impactApplied ? rawScore - dropAmount * 0.5 : rawScore;

  const finalScore = clampScore(adjustedScore);
  const status = determineStatus(finalScore);

  return {
    score: Math.round(finalScore),
    status,
    breakdown: {
      continuation: round2(continuationScore),
      core: round2(coreScore),
      peripheral: round2(peripheralScore),
      rawScore: round2(rawScore),
      adjustedScore: round2(adjustedScore),
      impactMultiplier: impactApplied ? IMPACT_MULTIPLIER : 1,
      impactApplied,
      impactDrop: round2(impactApplied ? dropAmount : 0),
      finalScore: Math.round(finalScore),
    },
  };
}

