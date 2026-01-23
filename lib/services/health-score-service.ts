import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/database.types";
import { calculateHealthScore, type FeatureCounts } from "@/lib/score-calculator";
import { getUsageLogByPeriod, getUsageLogs } from "./usage-log-service";
import { getCompanyById } from "./company-service";
import { subWeeks, subMonths, format } from "date-fns";

type HealthScore = Database["public"]["Tables"]["health_scores"]["Row"];
type HealthScoreInsert = Database["public"]["Tables"]["health_scores"]["Insert"];
type UsageLog = Database["public"]["Tables"]["usage_logs"]["Row"];
type CompanyRow = Database["public"]["Tables"]["ユーザー基礎情報"]["Row"];

export async function getHealthScores(
  tenantId?: number,
  periodDate?: string,
  periodType?: "weekly" | "monthly"
) {
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

  if (periodType) {
    query = query.eq("period_type", periodType);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getLatestHealthScores(
  periodType: "weekly" | "monthly" = "monthly"
): Promise<HealthScore[]> {
  // 最新の期間のスコアを取得
  const { data: latestScores, error: scoreError } = await supabase
    .from("health_scores")
    .select("period_date")
    .eq("period_type", periodType)
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
    .eq("period_type", periodType)
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

  const extractFeatureCounts = (log: UsageLog | null): FeatureCounts => {
    if (!log) return {};
    const rawData = (log as any).raw_data ?? (log as any).rawData;
    const excludedKeys = [
      "id",
      "ID",
      "テナントID",
      "tenant_id",
      "tenantId",
      "会社ID",
      "会社名",
      "企業名",
      "name",
      "period",
      "period_date",
      "periodDate",
      "日付",
      "対象月",
      "対象週",
      "ログイン回数",
      "login_count",
      "見積作成数",
      "est_count",
      "工事登録数",
      "const_count",
      "Active率",
      "active_rate",
    ];

    if (rawData && typeof rawData === "object") {
      const counts: FeatureCounts = {};
      Object.entries(rawData as Record<string, unknown>).forEach(([key, value]) => {
        if (excludedKeys.includes(key)) return;
        const num = Number(value);
        if (!Number.isNaN(num)) {
          counts[key] = num;
        }
      });
      if (Object.keys(counts).length > 0) {
        return counts;
      }
    }

    return {
      estimate: Number(log.見積作成数 || 0),
      construction: Number(log.工事登録数 || 0),
    };
  };

  const currentLoginCount = Number(currentLog.ログイン回数 || 0);
  const previousLoginCount = previousLog ? Number(previousLog.ログイン回数 || 0) : 0;

  const scoreResult = calculateHealthScore({
    currentPeriod: {
      login_count: currentLoginCount,
      feature_counts: extractFeatureCounts(currentLog),
    },
    previousPeriod: previousLog
      ? {
          login_count: previousLoginCount,
          feature_counts: extractFeatureCounts(previousLog),
        }
      : undefined,
    mrc: Number(company.mrc_ltv || 0),
  });

  // データベースに保存
  const healthScore: HealthScoreInsert = {
    tenant_id: tenantId,
    score: scoreResult.score,
    status: scoreResult.status,
    period_date: periodDate,
    period_type: periodType,
    trend_change_pct: scoreResult.trendChangePct,
    trend_status: scoreResult.trendStatus,
    zeroed_feature_alert: scoreResult.zeroedFeatureAlert,
  };

  const { data, error } = await (supabase as any)
    .from("health_scores")
    .upsert(healthScore, {
      onConflict: "tenant_id,period_type,period_date",
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

export async function getHealthScoreHistory(
  tenantId: number,
  periodType: "weekly" | "monthly"
) {
  const { data, error } = await supabase
    .from("health_scores")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("period_type", periodType)
    .order("period_date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getHealthScoreHistoryAll(periodType: "weekly" | "monthly") {
  const { data, error } = await supabase
    .from("health_scores")
    .select("*")
    .eq("period_type", periodType)
    .order("period_date", { ascending: true });

  if (error) throw error;
  return data;
}

