import { getCompanies } from "./company-service";
import { getUsageLogs } from "./usage-log-service";
import { calculateHealthScore } from "@/lib/score-calculator";
import { Database } from "@/lib/supabase/database.types";
import { format } from "date-fns";
import { checkLearningPeriodAlert } from "./learning-period-alert-service";

type UsageLog = Database["public"]["Tables"]["usage_logs"]["Row"];
type Company = Database["public"]["Tables"]["ユーザー基礎情報"]["Row"];

export interface DynamicHealthScore {
  tenant_id: number;
  score: number;
  status: "Excellent" | "Stable" | "Warning" | "Critical";
  trendStatus: "up" | "down" | "flat";
  trendChangeRate: number;
  trend: {
    status: "up" | "down" | "flat";
    changePercent: number;
    currentTotal: number;
    previousTotal: number;
    hasFeatureDrop: boolean;
    droppedFeatures: string[];
  };
  displayPriority: "max" | "normal";
  period_date: string;
  period_type: "weekly" | "monthly";
  company: Company;
  breakdown: {
    loginUsed: boolean;
    usedFeatureCount: number;
    totalFeatureCount: number;
    scorePerItem: number;
    rawScore: number;
    finalScore: number;
  };
  learningPeriodAlert?: {
    hasAlert: boolean;
    message: string;
  };
}

function normalizeRawData(rawData: UsageLog["raw_data"]): Record<string, number> {
  if (!rawData) return {};
  if (typeof rawData === "string") {
    try {
      const parsed = JSON.parse(rawData);
      return typeof parsed === "object" && parsed ? (parsed as Record<string, any>) : {};
    } catch {
      return {};
    }
  }
  return rawData as Record<string, any>;
}

function extractFeatureCounts(log: UsageLog): Record<string, number> {
  const counts: Record<string, number> = {};
  const rawData = normalizeRawData(log.raw_data);
  for (const [key, value] of Object.entries(rawData)) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      counts[key] = numeric;
    }
  }

  const estCount = Number(log["見積作成数"] ?? 0);
  const constCount = Number(log["工事登録数"] ?? 0);
  if (estCount > 0) counts["見積"] = estCount;
  if (constCount > 0) counts["工事"] = constCount;

  return counts;
}

function getDroppedFeatures(
  current: Record<string, number>,
  previous?: Record<string, number>
): string[] {
  if (!previous) return [];
  return Object.keys(previous).filter(
    (key) => (Number(previous[key]) || 0) > 0 && (Number(current[key]) || 0) === 0
  );
}

/**
 * 最新の期間のスコアを動的に計算
 */
export async function getLatestDynamicHealthScores(): Promise<DynamicHealthScore[]> {
  // すべての企業を取得
  const companies = (await getCompanies()) as Company[];
  
  // すべての利用ログを取得
  const usageLogs = await getUsageLogs();
  
  if (!usageLogs || usageLogs.length === 0) {
    return [];
  }

  // period_dateで降順ソートして最新データを特定
  // period_dateがnullの場合は対象月または対象週から計算
  const logsWithPeriodDate = (usageLogs as any[]).map((log) => {
    let periodDate: Date | null = null;
    if (log.period_date) {
      periodDate = new Date(log.period_date);
    } else if (log.対象月) {
      periodDate = new Date(log.対象月);
    } else if (log.対象週) {
      periodDate = new Date(log.対象週);
    }
    return { ...log, _periodDate: periodDate };
  }).filter((log) => log._periodDate !== null);

  if (logsWithPeriodDate.length === 0) {
    return [];
  }

  // period_dateで降順ソート
  logsWithPeriodDate.sort((a, b) => {
    if (!a._periodDate || !b._periodDate) return 0;
    return b._periodDate.getTime() - a._periodDate.getTime();
  });

  // 最新のperiod_dateを取得
  const latestPeriodDate = logsWithPeriodDate[0]._periodDate!;
  const latestPeriodDateStr = format(latestPeriodDate, "yyyy-MM-dd");
  
  // 企業ごとにスコアを計算
  const scores: DynamicHealthScore[] = [];
  
  for (const company of companies) {
    // 最新期間の利用ログを取得（period_dateで降順ソート済みのリストから）
    const companyId = Number(company.id);
    const companyLogs = logsWithPeriodDate.filter(
      (log: any) => log.会社ID === String(companyId)
    );

    if (companyLogs.length === 0) {
      continue; // 利用ログがない場合はスキップ
    }

    // 最新のperiod_dateを持つレコードを取得
    const currentLog = companyLogs[0] as UsageLog;
    const currentPeriodDate = companyLogs[0]._periodDate!;
    
    // 期間タイプを判定（対象週があれば週次、なければ月次）
    const periodType: "weekly" | "monthly" = currentLog.対象週 ? "weekly" : "monthly";
    
    // 前期間の利用ログを取得（最新のperiod_dateより小さい最大のperiod_dateを持つレコード）
    const previousLogs = companyLogs.filter(
      (log) => log._periodDate && log._periodDate < currentPeriodDate
    );

    // period_dateで降順ソートして、最新の過去データを取得
    previousLogs.sort((a, b) => {
      if (!a._periodDate || !b._periodDate) return 0;
      return b._periodDate.getTime() - a._periodDate.getTime();
    });

    const previousLog = previousLogs.length > 0 ? (previousLogs[0] as UsageLog) : null;
    
    const currentPeriod = {
      login_count: Number(currentLog["ログイン回数"] ?? 0),
      feature_counts: extractFeatureCounts(currentLog),
    };
    const previousPeriod = previousLog
      ? {
          login_count: Number(previousLog["ログイン回数"] ?? 0),
          feature_counts: extractFeatureCounts(previousLog),
        }
      : undefined;

    const mrcValue = Number(company.mrc_ltv ?? 0);
    const scoreResult = calculateHealthScore({
      currentPeriod,
      previousPeriod,
      mrc: mrcValue,
    });

    const droppedFeatures = getDroppedFeatures(
      currentPeriod.feature_counts,
      previousPeriod?.feature_counts
    );
    const trend = {
      status: scoreResult.trendStatus,
      changePercent: scoreResult.trendChangePct,
      currentTotal: scoreResult.totalActions,
      previousTotal: scoreResult.previousTotalActions,
      hasFeatureDrop: droppedFeatures.length > 0,
      droppedFeatures,
    };
    const isHighImpact = mrcValue >= 55000;
    const displayPriority: "max" | "normal" =
      isHighImpact && scoreResult.trendStatus === "down" ? "max" : "normal";
    
    // 学習期間アラートをチェック
    let learningPeriodAlert = { hasAlert: false, message: "" };
    try {
      const alert = await checkLearningPeriodAlert(company.id);
      learningPeriodAlert = {
        hasAlert: alert.hasAlert,
        message: alert.message,
      };
    } catch (error) {
      console.warn(`学習期間アラートのチェックに失敗しました（企業ID: ${company.id}）:`, error);
    }

    scores.push({
      tenant_id: company.id,
      score: scoreResult.score,
      status: scoreResult.status,
      trendStatus: scoreResult.trendStatus,
      trendChangeRate: scoreResult.trendChangePct,
      trend,
      displayPriority,
      period_date: latestPeriodDateStr,
      period_type: periodType,
      company,
      breakdown: {
        loginUsed: scoreResult.breakdown.loginActive,
        usedFeatureCount: scoreResult.breakdown.activeFeatures,
        totalFeatureCount: scoreResult.breakdown.totalFeatureSlots,
        scorePerItem: 0,
        rawScore: scoreResult.score,
        finalScore: scoreResult.score,
      },
      learningPeriodAlert,
    });
  }
  
  return scores.sort((a, b) => b.score - a.score);
}

