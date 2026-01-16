import { getCompanies } from "./company-service";
import { getUsageLogs } from "./usage-log-service";
import { calculateHealthScore } from "@/lib/score-calculator";
import { Database } from "@/lib/supabase/database.types";
import { subWeeks, subMonths, format } from "date-fns";
import { calculateActiveRateForLog } from "./active-rate-service";
import { calculateOtherFeaturesTotal, calculateOtherFeaturesTotalFromRawData } from "@/lib/utils/feature-usage-helper";
import { checkLearningPeriodAlert } from "./learning-period-alert-service";

type UsageLog = Database["public"]["Tables"]["usage_logs"]["Row"];
type Company = Database["public"]["Tables"]["ユーザー基礎情報"]["Row"];

export interface DynamicHealthScore {
  tenant_id: number;
  score: number;
  status: "Excellent" | "Stable" | "Warning" | "Critical";
  period_date: string;
  period_type: "weekly" | "monthly";
  company: Company;
  breakdown: {
    baseScore: number;
    variationTotal: number;
    adjustedVariation: number;
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
    
    // スコアを計算
    const currentLoginCount = currentLog.ログイン回数 || 0;
    const currentEstCount = currentLog.見積作成数 || 0;
    const currentConstCount = currentLog.工事登録数 || 0;
    
    // ログイン以外の15機能の合計利用回数を計算
    let otherFeaturesTotal = calculateOtherFeaturesTotal(currentLog as any);
    // raw_dataからも取得を試行（カラムにない場合）
    if (otherFeaturesTotal === 0 && (currentLog as any).raw_data) {
      otherFeaturesTotal = calculateOtherFeaturesTotalFromRawData((currentLog as any).raw_data);
    }
    
    // Active率を自動計算（既に計算済みの場合はそれを使用、なければ再計算）
    let currentActiveRate = currentLog.Active率 ? Number(currentLog.Active率) : 0;
    if (currentActiveRate === 0 || !currentLog.Active率) {
      try {
        currentActiveRate = await calculateActiveRateForLog(company.id, currentLog);
      } catch (error) {
        console.warn(`Active率の計算に失敗しました（企業ID: ${company.id}）:`, error);
        currentActiveRate = 0;
      }
    }
    
    const previousLoginCount = previousLog ? (previousLog.ログイン回数 || 0) : 0;
    const previousEstCount = previousLog ? (previousLog.見積作成数 || 0) : 0;
    const previousConstCount = previousLog ? (previousLog.工事登録数 || 0) : 0;
    
    // 前期間のActive率を取得（既に計算済みの場合はそれを使用）
    let previousActiveRate = previousLog
      ? previousLog.Active率
        ? Number(previousLog.Active率)
        : 0
      : 0;
    
    // 前期間のActive率が0または未設定の場合、計算を試行
    if (previousLog && (previousActiveRate === 0 || !previousLog.Active率)) {
      try {
        previousActiveRate = await calculateActiveRateForLog(company.id, previousLog);
      } catch (error) {
        console.warn(`前期間のActive率の計算に失敗しました（企業ID: ${company.id}）:`, error);
        previousActiveRate = 0;
      }
    }
    
    const scoreResult = calculateHealthScore({
      currentPeriod: {
        login_count: currentLoginCount,
        est_count: currentEstCount,
        const_count: currentConstCount,
        active_rate: currentActiveRate,
        other_features_total: otherFeaturesTotal,
      },
      previousPeriod: previousLog
        ? {
            login_count: previousLoginCount,
            est_count: previousEstCount,
            const_count: previousConstCount,
            active_rate: previousActiveRate,
          }
        : undefined,
      mrc: Number(company.mrc_ltv || 0),
      periodType,
    });
    
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
      period_date: latestPeriodDateStr,
      period_type: periodType,
      company,
      breakdown: scoreResult.breakdown,
      details: scoreResult.details,
      learningPeriodAlert,
    });
  }
  
  return scores.sort((a, b) => b.score - a.score);
}

