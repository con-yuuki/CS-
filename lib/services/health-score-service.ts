import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/database.types";
import { calculateHealthScore } from "@/lib/score-calculator";
import { getUsageLogByPeriod, getUsageLogs } from "./usage-log-service";
import { getCompanyById } from "./company-service";
import { subWeeks, subMonths, format } from "date-fns";

type HealthScore = Database["public"]["Tables"]["health_scores"]["Row"];
type HealthScoreInsert = Database["public"]["Tables"]["health_scores"]["Insert"];
type UsageLog = Database["public"]["Tables"]["usage_logs"]["Row"];
type CompanyRow = Database["public"]["Tables"]["ユーザー基礎情報"]["Row"];

export async function getHealthScores(tenantId?: number, periodDate?: string) {
  let query = supabase
    .from("health_scores")
    .select("*")
    .order("period_date", { ascending: false });

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  if (periodDate) {
    query = query.eq("period_date", periodDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getLatestHealthScores(): Promise<HealthScore[]> {
  // 最新の期間のスコアを取得
  const { data: latestScores, error: scoreError } = await supabase
    .from("health_scores")
    .select("period_date")
    .order("period_date", { ascending: false })
    .limit(1);

  if (scoreError) throw scoreError;

  if (!latestScores || latestScores.length === 0) {
    return [];
  }

  const latestDate = (latestScores[0] as { period_date: string }).period_date;

  const { data, error } = await supabase
    .from("health_scores")
    .select("*")
    .eq("period_date", latestDate)
    .order("score", { ascending: false });

  if (error) throw error;
  return data;
}

export async function calculateAndSaveHealthScore(
  tenantId: number,
  periodType: "weekly" | "monthly",
  periodDate: string
) {
  // デバッグログ
  if (typeof window !== "undefined") {
    console.log("🔍 calculateAndSaveHealthScore 呼び出し:", {
      tenantId,
      periodType,
      periodDate,
    });
  }

  // 企業情報を取得
  const company: CompanyRow = await getCompanyById(tenantId);
  if (!company) {
    const errorMsg = `企業ID ${tenantId} が見つかりません`;
    console.error("❌", errorMsg);
    throw new Error(errorMsg);
  }

  // 現在期間の利用ログを取得
  const currentLog: UsageLog | null = await getUsageLogByPeriod(tenantId, periodType, periodDate);
  if (!currentLog) {
    const errorMsg = `利用ログが見つかりません: テナントID ${tenantId}, 期間 ${periodDate}`;
    console.error("❌", errorMsg);
    console.error("   検索条件:", {
      tenantId: String(tenantId),
      periodType,
      periodDate,
      searchColumn: periodType === "weekly" ? "対象週" : "対象月",
    });
    throw new Error(errorMsg);
  }

  // デバッグログ: 取得した利用ログを確認
  if (typeof window !== "undefined") {
    console.log("📊 取得した利用ログ:", currentLog);
  }

  // 前期間の利用ログを取得
  const currentDate = new Date(periodDate);
  const previousDate =
    periodType === "weekly"
      ? format(subWeeks(currentDate, 1), "yyyy-MM-dd")
      : format(subMonths(currentDate, 1), "yyyy-MM-dd");

  const previousLog: UsageLog | null = await getUsageLogByPeriod(
    tenantId,
    periodType,
    previousDate
  );

  // スコアを計算（既存のテーブル構造に合わせてカラム名を変更）
  const currentLoginCount = currentLog.ログイン回数 || 0;
  const currentEstCount = currentLog.見積作成数 || 0;
  const currentConstCount = currentLog.工事登録数 || 0;
  const currentActiveRate = currentLog.Active率 ? Number(currentLog.Active率) : 0;

  const previousLoginCount = previousLog ? (previousLog.ログイン回数 || 0) : undefined;
  const previousEstCount = previousLog ? (previousLog.見積作成数 || 0) : undefined;
  const previousConstCount = previousLog ? (previousLog.工事登録数 || 0) : undefined;
  const previousActiveRate = previousLog ? (previousLog.Active率 ? Number(previousLog.Active率) : 0) : undefined;

  const scoreResult = calculateHealthScore({
    currentPeriod: {
      login_count: currentLoginCount,
      est_count: currentEstCount,
      const_count: currentConstCount,
      active_rate: currentActiveRate,
    },
    previousPeriod: previousLog
      ? {
          login_count: previousLoginCount || 0,
          est_count: previousEstCount || 0,
          const_count: previousConstCount || 0,
          active_rate: previousActiveRate || 0,
        }
      : undefined,
    mrc: Number(company.mrc_ltv || 0),
    periodType,
  });

  // データベースに保存
  const healthScore: HealthScoreInsert = {
    tenant_id: tenantId,
    score: scoreResult.score,
    status: scoreResult.status,
    period_date: periodDate,
  };

  const { data, error } = await (supabase as any)
    .from("health_scores")
    .upsert(healthScore, {
      onConflict: "tenant_id,period_date",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createHealthScore(score: HealthScoreInsert) {
  const { data, error } = await (supabase as any)
    .from("health_scores")
    .insert(score)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getHealthScoreHistory(tenantId: number) {
  const { data, error } = await supabase
    .from("health_scores")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("period_date", { ascending: true });

  if (error) throw error;
  return data;
}

