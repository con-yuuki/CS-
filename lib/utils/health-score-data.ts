import { ActivityEntry, SCORE_FEATURE_DEFINITIONS, LoginStats } from "@/lib/score-calculator";
import { getFeatureCountFromRawData } from "@/lib/utils/feature-usage-helper";

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[\s　_]/g, "");
}

function matchesPattern(name: string, pattern: string): boolean {
  const normalizedName = normalizeText(name);
  const normalizedPattern = normalizeText(pattern);
  return (
    normalizedName.includes(normalizedPattern) ||
    normalizedPattern.includes(normalizedName)
  );
}

function getCountByPatterns(source: Record<string, any>, patterns: string[]): number {
  for (const pattern of patterns) {
    if (source[pattern] !== undefined) {
      return Number(source[pattern]) || 0;
    }
  }

  for (const key of Object.keys(source)) {
    for (const pattern of patterns) {
      if (matchesPattern(key, pattern)) {
        return Number(source[key]) || 0;
      }
    }
  }

  return 0;
}

function getRawData(usageLog: any): Record<string, any> {
  if (!usageLog) return {};
  const rawData = usageLog.raw_data ?? usageLog._original ?? {};
  if (typeof rawData === "string") {
    try {
      return JSON.parse(rawData);
    } catch {
      return {};
    }
  }
  return rawData;
}

const LOGIN_PATTERNS = ["ログイン回数", "ログイン数", "ログイン"];

function getLoginCount(source: Record<string, any>): number {
  return getCountByPatterns(source, LOGIN_PATTERNS);
}

function isLoginKey(key: string): boolean {
  return LOGIN_PATTERNS.some((pattern) => matchesPattern(key, pattern));
}

export function buildActivityDataFromUsageLog(usageLog: any): ActivityEntry[] {
  const rawData = getRawData(usageLog);
  const entries: ActivityEntry[] = [];

  const featureDefinitions = SCORE_FEATURE_DEFINITIONS.filter((feature) => feature.key !== "その他");

  const loginCount = Math.max(
    getLoginCount(usageLog ?? {}),
    getLoginCount(rawData)
  );
  if (loginCount > 0) {
    entries.push({ name: "ログイン", count: loginCount });
  }

  for (const feature of featureDefinitions) {
    const countFromLog = getCountByPatterns(usageLog ?? {}, feature.patterns);
    const countFromRaw = getFeatureCountFromRawData(rawData, feature.patterns[0]);
    const count = Math.max(countFromLog, countFromRaw);
    if (count > 0) {
      entries.push({ name: feature.key, count });
    }
  }

  for (const [key, value] of Object.entries(rawData)) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) continue;
    if (isLoginKey(key)) continue;
    const matched = featureDefinitions.some((feature) =>
      feature.patterns.some((pattern) => matchesPattern(key, pattern))
    );
    if (!matched) {
      entries.push({ name: key, count: numericValue });
    }
  }

  return entries;
}

export function buildLoginStatsFromUsageLog(
  usageLog: any,
  periodType: "weekly" | "monthly"
): LoginStats {
  const rawData = getRawData(usageLog);

  const loginDays =
    getCountByPatterns(rawData, ["ログイン日数", "ログイン日", "ログイン日数合計"]) ||
    getCountByPatterns(usageLog ?? {}, ["ログイン日数", "ログイン日", "ログイン日数合計"]) ||
    Number(usageLog?.ログイン回数 || 0);

  const workingDays =
    getCountByPatterns(rawData, ["稼働日数", "営業日数", "稼働日", "営業日"]) ||
    getCountByPatterns(usageLog ?? {}, ["稼働日数", "営業日数", "稼働日", "営業日"]) ||
    (periodType === "weekly" ? 7 : 30);

  return {
    loginDays: Number(loginDays || 0),
    workingDays: Math.max(1, Number(workingDays || 0)),
  };
}


