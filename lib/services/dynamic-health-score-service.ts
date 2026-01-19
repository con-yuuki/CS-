import { getCompanies } from "./company-service";
import { getUsageLogs } from "./usage-log-service";
import { calculateHealthScore, calculateTrend, TrendResult, TrendStatus } from "@/lib/score-calculator";
import { Database } from "@/lib/supabase/database.types";
import { format } from "date-fns";
import { checkLearningPeriodAlert } from "./learning-period-alert-service";
import { buildActivityDataFromUsageLog, buildLoginStatsFromUsageLog } from "@/lib/utils/health-score-data";

type UsageLog = Database["public"]["Tables"]["usage_logs"]["Row"];
type Company = Database["public"]["Tables"]["ユーザー基礎情報"]["Row"];

export interface DynamicHealthScore {
  tenant_id: number;
  score: number;
  status: "Excellent" | "Stable" | "Warning" | "Critical";
  trendStatus: TrendStatus;
  trendChangeRate: number;
  trend: TrendResult;
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
    
    const activityData = buildActivityDataFromUsageLog(currentLog);
    const loginStats = buildLoginStatsFromUsageLog(currentLog, periodType);

    const scoreResult = calculateHealthScore({
      activityData,
      loginStats,
    });

    const previousActivityData = previousLog ? buildActivityDataFromUsageLog(previousLog) : undefined;
    const trend = calculateTrend(activityData, previousActivityData);
    const isHighImpact = Number(company.mrc_ltv || 0) >= 55000;
    const displayPriority: "max" | "normal" =
      isHighImpact && trend.status === "down" ? "max" : "normal";
    
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
      trendStatus: trend.status,
      trendChangeRate: trend.changePercent,
      trend,
      displayPriority,
      period_date: latestPeriodDateStr,
      period_type: periodType,
      company,
      breakdown: scoreResult.breakdown,
      learningPeriodAlert,
    });
  }
  
  return scores.sort((a, b) => b.score - a.score);
}

