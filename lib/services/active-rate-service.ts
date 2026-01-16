import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/database.types";
import {
  extractUsedFeaturesFromLearningPeriod,
  calculateLearningPeriodEnd,
  isInLearningPeriod,
  getUsedFeatures,
  calculateFeatureUsageFromLog,
  calculateActiveRateFromUsedFeatures,
  calculateFeatureActiveRates,
  calculateTotalActiveRate,
  UsedFeatures,
} from "@/lib/utils/active-rate-calculator";
import { getUsageLogs } from "./usage-log-service";
import { getCompanyById, updateCompany } from "./company-service";
import { format, addMonths, parseISO } from "date-fns";

type UsageLog = Database["public"]["Tables"]["usage_logs"]["Row"];
type Company = Database["public"]["Tables"]["ユーザー基礎情報"]["Row"];

/**
 * 企業の利用開始日を取得（最初の利用ログの日付）
 */
export async function getCompanyUsageStartDate(
  tenantId: number
): Promise<Date | null> {
  const usageLogs = await getUsageLogs(tenantId);

  if (!usageLogs || usageLogs.length === 0) {
    return null;
  }

  // すべての期間日を取得
  const dates: Date[] = [];
  for (const log of usageLogs as any[]) {
    if (log.対象月) {
      dates.push(parseISO(log.対象月));
    }
    if (log.対象週) {
      dates.push(parseISO(log.対象週));
    }
  }

  if (dates.length === 0) {
    return null;
  }

  // 最も古い日付を返す
  return new Date(Math.min(...dates.map((d) => d.getTime())));
}

/**
 * 企業の利用開始日を設定
 */
export async function setCompanyUsageStartDate(
  tenantId: number,
  startDate: Date
): Promise<void> {
  await updateCompany(tenantId, {
    usage_start_date: format(startDate, "yyyy-MM-dd"),
  } as any);
}

/**
 * 学習期間中の利用ログから利用する機能を抽出して更新
 */
export async function updateUsedFeaturesFromLearningPeriod(
  tenantId: number
): Promise<string[]> {
  // 企業情報を取得
  const company = await getCompanyById(tenantId);
  if (!company) {
    throw new Error(`企業ID ${tenantId} が見つかりません`);
  }

  // 利用開始日を取得
  let startDate: Date | null = null;
  if ((company as any).usage_start_date) {
    startDate = parseISO((company as any).usage_start_date);
  } else {
    // 利用開始日が設定されていない場合、最初の利用ログの日付を使用
    startDate = await getCompanyUsageStartDate(tenantId);
    if (!startDate) {
      throw new Error(`企業ID ${tenantId} の利用ログが見つかりません`);
    }
    // 利用開始日を設定
    await setCompanyUsageStartDate(tenantId, startDate);
  }

  // 学習期間の終了日を計算
  const learningPeriodEnd = calculateLearningPeriodEnd(startDate);

  // 学習期間中の利用ログを取得
  const allLogs = await getUsageLogs(tenantId);
  const learningPeriodLogs = (allLogs as any[]).filter((log) => {
    const logDate = log.対象月
      ? parseISO(log.対象月)
      : log.対象週
      ? parseISO(log.対象週)
      : null;

    if (!logDate) return false;

    return logDate >= startDate && logDate < learningPeriodEnd;
  });

  // 利用する機能を抽出
  const usedFeatures = extractUsedFeaturesFromLearningPeriod(learningPeriodLogs);

  // 企業マスタに保存
  const usedFeaturesData: UsedFeatures = {
    features: usedFeatures,
    learning_period_end: format(learningPeriodEnd, "yyyy-MM-dd"),
    last_updated: new Date().toISOString(),
  };

  await updateCompany(tenantId, {
    used_features: usedFeaturesData as any,
  } as any);

  return usedFeatures;
}

/**
 * 利用ログからActive率を計算
 */
export async function calculateActiveRateForLog(
  tenantId: number,
  usageLog: UsageLog
): Promise<number> {
  // 企業情報を取得
  const company = await getCompanyById(tenantId);
  if (!company) {
    return 0;
  }

  // 利用開始日を取得
  let startDate: Date | null = null;
  if ((company as any).usage_start_date) {
    startDate = parseISO((company as any).usage_start_date);
  } else {
    // 利用開始日が設定されていない場合、最初の利用ログの日付を使用
    startDate = await getCompanyUsageStartDate(tenantId);
    if (startDate) {
      await setCompanyUsageStartDate(tenantId, startDate);
    }
  }

  // 学習期間中の場合、全機能を基準に計算（または0を返す）
  if (startDate && isInLearningPeriod(startDate)) {
    // 学習期間中は、全機能を基準に計算
    const allFeatures = [
      "ログイン",
      "見積作成",
      "工事登録",
      "顧客登録",
      "業者登録",
      "請求書作成",
      "商品発注書作成",
      "外注発注書作成",
      "現場連絡表作成",
      "実行予算作成",
      "書類メール送信",
      "資料登録",
      "写真登録",
      "工程表作成",
      "タスク登録",
      "日報登録",
    ];
    // 各機能のActive率を計算（割り算の結果をそのまま保持、丸め補正なし）
    const featureActiveRates = calculateFeatureActiveRates(usageLog, allFeatures);
    const totalActiveRate = calculateTotalActiveRate(featureActiveRates);
    // 使用した機能の割合を返す
    const featureUsage = calculateFeatureUsageFromLog(usageLog, allFeatures);
    const usedCount = allFeatures.filter((feature) => featureUsage[feature] === true).length;
    const activeRatePercentage = (usedCount / allFeatures.length) * 100;
    return activeRatePercentage;
  }

  // 学習期間終了後、利用する機能リストを取得
  const companyUsedFeatures = (company as any).used_features as
    | UsedFeatures
    | null
    | undefined;

  // 利用する機能が設定されていない場合、学習期間から抽出
  let usedFeatures: string[] = [];
  if (
    !companyUsedFeatures ||
    !companyUsedFeatures.features ||
    companyUsedFeatures.features.length === 0
  ) {
    // 利用する機能を更新
    usedFeatures = await updateUsedFeaturesFromLearningPeriod(tenantId);
  } else {
    usedFeatures = getUsedFeatures(companyUsedFeatures);
  }

  // 現在期間の機能利用状況を取得
  const featureUsage = calculateFeatureUsageFromLog(usageLog, usedFeatures);

  // Active率を計算（割り算の結果をそのまま保持、丸め補正なし）
  // 各機能の利用回数を正規化して計算
  // 使用する機能は16個の機能リストから、学習期間中に使用された機能のみ
  const featureActiveRates = calculateFeatureActiveRates(usageLog, usedFeatures);
  
  // 合計Active率を計算（各機能のActive率の合計）
  const totalActiveRate = calculateTotalActiveRate(featureActiveRates);
  
  // スコア計算用のActive率を計算
  // 使用した機能の割合を返す（合計Active率ではない）
  const usedCount = usedFeatures.filter(
    (feature) => featureUsage[feature] === true
  ).length;
  const activeRatePercentage = usedFeatures.length > 0 
    ? (usedCount / usedFeatures.length) * 100 
    : 0;
  
  // 割り算の結果をそのまま返す（丸め補正なし）
  return activeRatePercentage;
}

