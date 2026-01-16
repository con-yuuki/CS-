import { getCompanyById } from "./company-service";
import { getUsageLogs } from "./usage-log-service";
import { calculateOtherFeaturesTotal, calculateOtherFeaturesTotalFromRawData } from "@/lib/utils/feature-usage-helper";
import { calculateLearningPeriodEnd, isInLearningPeriod } from "@/lib/utils/active-rate-calculator";
import { parseISO, format } from "date-fns";

/**
 * 学習期間アラートの判定結果
 */
export interface LearningPeriodAlert {
  hasAlert: boolean;
  message: string;
  learningPeriodEnd: Date | null;
  otherFeaturesTotal: number;
}

/**
 * 企業の学習期間アラートを判定
 * 契約開始日から3ヶ月経過後、ログイン以外の15機能の累計利用回数が0の場合にアラートを返す
 */
export async function checkLearningPeriodAlert(
  tenantId: number
): Promise<LearningPeriodAlert> {
  // 企業情報を取得
  const company = await getCompanyById(tenantId);
  if (!company) {
    return {
      hasAlert: false,
      message: "",
      learningPeriodEnd: null,
      otherFeaturesTotal: 0,
    };
  }

  // 利用開始日を取得
  const usageStartDate = (company as any).usage_start_date
    ? parseISO((company as any).usage_start_date)
    : null;

  if (!usageStartDate) {
    // 利用開始日が設定されていない場合はアラートなし
    return {
      hasAlert: false,
      message: "",
      learningPeriodEnd: null,
      otherFeaturesTotal: 0,
    };
  }

  // 学習期間の終了日を計算
  const learningPeriodEnd = calculateLearningPeriodEnd(usageStartDate);
  const currentDate = new Date();

  // 学習期間が終了しているかチェック
  if (isInLearningPeriod(usageStartDate)) {
    // 学習期間中はアラートなし
    return {
      hasAlert: false,
      message: "",
      learningPeriodEnd,
      otherFeaturesTotal: 0,
    };
  }

  // 学習期間終了後、ログイン以外の15機能の累計利用回数を計算
  const allLogs = await getUsageLogs(tenantId);
  
  // 学習期間中の利用ログを取得
  const learningPeriodLogs = (allLogs as any[]).filter((log) => {
    let logDate: Date | null = null;
    if (log.period_date) {
      logDate = new Date(log.period_date);
    } else if (log.対象月) {
      logDate = new Date(log.対象月);
    } else if (log.対象週) {
      logDate = new Date(log.対象週);
    }

    if (!logDate) return false;

    return logDate >= usageStartDate && logDate < learningPeriodEnd;
  });

  // ログイン以外の15機能の累計利用回数を計算
  let otherFeaturesTotal = 0;
  for (const log of learningPeriodLogs) {
    const logTotal = calculateOtherFeaturesTotal(log);
    // raw_dataからも取得を試行
    if (logTotal === 0 && log.raw_data) {
      const rawDataTotal = calculateOtherFeaturesTotalFromRawData(log.raw_data);
      otherFeaturesTotal += rawDataTotal;
    } else {
      otherFeaturesTotal += logTotal;
    }
  }

  // 累計利用回数が0の場合、アラートを返す
  if (otherFeaturesTotal === 0) {
    return {
      hasAlert: true,
      message: "Active率の設定ができません（十分な利用データがありません）",
      learningPeriodEnd,
      otherFeaturesTotal: 0,
    };
  }

  return {
    hasAlert: false,
    message: "",
    learningPeriodEnd,
    otherFeaturesTotal,
  };
}

