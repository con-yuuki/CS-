import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/database.types";
import { calculateHealthScore } from "@/lib/score-calculator";

type UsageLog = Database["public"]["Tables"]["usage_logs"]["Row"];
type UsageLogInsert = Database["public"]["Tables"]["usage_logs"]["Insert"];

export async function getUsageLogs(tenantId?: number, periodType?: "weekly" | "monthly") {
  let query = supabase.from("usage_logs").select("*").order("created_at", { ascending: false });

  if (tenantId) {
    query = query.eq("会社ID", String(tenantId));
  }

  // periodTypeに応じて対象月または対象週でフィルタリング
  // 注意: 既存のテーブル構造では period_type カラムがないため、対象月/対象週で判断

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getUsageLogByPeriod(
  tenantId: number,
  periodType: "weekly" | "monthly",
  periodDate: string
): Promise<UsageLog | null> {
  let query = supabase
    .from("usage_logs")
    .select("*")
    .eq("会社ID", String(tenantId));

  // periodTypeに応じて対象月または対象週でフィルタリング
  if (periodType === "weekly") {
    query = query.eq("対象週", periodDate);
  } else {
    query = query.eq("対象月", periodDate);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("❌ getUsageLogByPeriod エラー:", {
      tenantId,
      periodType,
      periodDate,
      error,
    });
    throw error;
  }
  
  return data || null;
}

export async function createUsageLog(log: UsageLogInsert) {
  const { data, error } = await (supabase as any)
    .from("usage_logs")
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function upsertUsageLog(log: {
  tenant_id: number;
  period_type: "weekly" | "monthly";
  period_date: string;
  login_count: number;
  est_count: number;
  const_count: number;
  active_rate: number;
  raw_data?: any;
  companyName?: string;
}) {
  // デバッグログ: 入力データを確認
  if (typeof window !== "undefined") {
    console.log("🔍 upsertUsageLog 呼び出し:", {
      tenant_id: log.tenant_id,
      period_type: log.period_type,
      period_date: log.period_date,
      login_count: log.login_count,
      est_count: log.est_count,
      const_count: log.const_count,
      active_rate: log.active_rate,
      companyName: log.companyName,
    });
  }

  // 既存のテーブル構造に合わせてデータを変換
  const tenantIdStr = String(log.tenant_id);
  const cleanedLog: UsageLogInsert = {
    会社ID: tenantIdStr,
    会社名: log.companyName || null,
    ログイン回数: Math.floor(Number(log.login_count) || 0),
    見積作成数: Math.floor(Number(log.est_count) || 0),
    工事登録数: Math.floor(Number(log.const_count) || 0),
    Active率: log.active_rate ? String(log.active_rate) : null,
    見積金額: 0,
    請求金額: 0,
    社員数: null,
    顧客数: null,
    取り込み元ファイル名: null,
  };

  // periodTypeに応じて対象月または対象週を設定
  if (log.period_type === "weekly") {
    cleanedLog.対象週 = log.period_date;
    cleanedLog.対象月 = null;
  } else {
    cleanedLog.対象月 = log.period_date;
    cleanedLog.対象週 = null;
  }

  // デバッグログ: 変換後のデータを確認
  if (typeof window !== "undefined") {
    console.log("📝 変換後のデータ:", cleanedLog);
  }

  // バリデーション
  if (!log.tenant_id || isNaN(log.tenant_id) || log.tenant_id <= 0) {
    throw new Error(`テナントIDが無効です: ${log.tenant_id}`);
  }
  if (!log.period_type || !["weekly", "monthly"].includes(log.period_type)) {
    throw new Error(`期間タイプが無効です: ${log.period_type}`);
  }
  if (!log.period_date) {
    throw new Error(`期間日が無効です: ${log.period_date}`);
  }

  // period_date の形式を確認（YYYY-MM-DD）
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(log.period_date)) {
    throw new Error(`期間日の形式が無効です。YYYY-MM-DD形式である必要があります: ${log.period_date}`);
  }

  // 既存レコードを確認
  let existingQuery = supabase
    .from("usage_logs")
    .select("id")
    .eq("会社ID", tenantIdStr);

  if (log.period_type === "weekly") {
    existingQuery = existingQuery.eq("対象週", log.period_date);
  } else {
    existingQuery = existingQuery.eq("対象月", log.period_date);
  }

  const { data: existing, error: existingError } = await existingQuery.maybeSingle();
  
  if (existingError) {
    // PGRST116は「レコードが見つからない」エラーなので、これは正常
    if (existingError.code === "PGRST116") {
      // レコードが見つからない場合は新規作成
      if (typeof window !== "undefined") {
        console.log("ℹ️ 既存レコードが見つかりませんでした。新規作成します。");
      }
    } else {
      // その他のエラーは問題
      console.error("❌ 既存レコード検索エラー:", {
        error: existingError,
        errorCode: existingError.code,
        errorMessage: existingError.message,
        errorDetails: existingError.details,
        errorHint: existingError.hint,
        tenantId: tenantIdStr,
        periodType: log.period_type,
        periodDate: log.period_date,
      });
      throw new Error(`既存レコードの検索に失敗しました: ${existingError.message} (コード: ${existingError.code})`);
    }
  }

  // デバッグログ: 既存レコードの有無を確認
  if (typeof window !== "undefined") {
    console.log(existing ? "🔄 既存レコードが見つかりました。更新します。" : "➕ 新規レコードを作成します。");
  }

  let data, error;

  if (existing) {
    // 更新
    let updateQuery = (supabase as any)
      .from("usage_logs")
      .update(cleanedLog)
      .eq("会社ID", tenantIdStr);

    if (log.period_type === "weekly") {
      updateQuery = updateQuery.eq("対象週", log.period_date);
    } else {
      updateQuery = updateQuery.eq("対象月", log.period_date);
    }

    ({ data, error } = await updateQuery.select().single());
    
    if (typeof window !== "undefined") {
      if (error) {
        console.error("❌ 更新エラー:", error);
      } else {
        console.log("✅ 更新成功:", data);
      }
    }
  } else {
    // 新規作成
    ({ data, error } = await (supabase as any)
      .from("usage_logs")
      .insert(cleanedLog)
      .select()
      .single());
    
    if (typeof window !== "undefined") {
      if (error) {
        console.error("❌ 挿入エラー:", error);
      } else {
        console.log("✅ 挿入成功:", data);
      }
    }
  }

  if (error) {
    const errorMessage = `データの保存に失敗しました: ${error.message || "不明なエラー"} (コード: ${error.code || "不明"})`;
    console.error("❌ usage_logs upsert error:", {
      error,
      errorCode: error.code,
      errorMessage: error.message,
      errorDetails: error.details,
      errorHint: error.hint,
      sentData: cleanedLog,
      fullError: JSON.stringify(error, null, 2),
    });
    throw new Error(errorMessage);
  }
  
  return data;
}

