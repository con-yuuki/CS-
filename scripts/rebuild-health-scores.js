const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const { parseISO, isValid, format, subDays, subMonths } = require("date-fns");

const env = fs
  .readFileSync(".env.local", "utf8")
  .split(/\n/)
  .reduce((acc, line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) acc[match[1].trim()] = match[2].trim();
    return acc;
  }, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const DEFAULT_FEATURE_SLOTS = 16;
const excludedKeys = new Set([
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
]);

const determineStatus = (score) =>
  score >= 90 ? "Excellent" : score >= 70 ? "Stable" : score >= 50 ? "Warning" : "Critical";
const sumActions = (counts) => Object.values(counts).reduce((sum, value) => sum + (Number(value) || 0), 0);
const calculateTrendChange = (currentTotal, previousTotal) => {
  if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
  return ((currentTotal - previousTotal) / previousTotal) * 100;
};
const detectZeroedFeature = (current, previous) => {
  if (!previous) return false;
  return Object.keys(previous).some(
    (key) => (Number(previous[key]) || 0) > 0 && (Number(current[key]) || 0) === 0
  );
};

const extractFeatureCounts = (log) => {
  const raw = log.raw_data;
  if (raw && typeof raw === "object") {
    const counts = {};
    for (const [key, value] of Object.entries(raw)) {
      if (excludedKeys.has(key)) continue;
      const num = Number(value);
      if (!Number.isNaN(num)) counts[key] = num;
    }
    if (Object.keys(counts).length > 0) return counts;
  }

  return {
    estimate: Number(log["見積作成数"] || 0),
    construction: Number(log["工事登録数"] || 0),
  };
};

const normalizePeriodType = (log) => (log["対象週"] ? "weekly" : "monthly");
const normalizePeriodDate = (log, periodType) => (periodType === "weekly" ? log["対象週"] : log["対象月"]);
const previousDateFor = (dateStr, periodType) => {
  const parsed = parseISO(dateStr);
  if (!isValid(parsed)) return null;
  return periodType === "weekly"
    ? format(subDays(parsed, 7), "yyyy-MM-dd")
    : format(subMonths(parsed, 1), "yyyy-MM-dd");
};

(async () => {
  let all = [];
  let from = 0;
  const page = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("usage_logs")
      .select("id,会社ID,対象月,対象週,ログイン回数,見積作成数,工事登録数,raw_data")
      .range(from, from + page - 1);
    if (error) {
      console.error(error);
      return;
    }
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < page) break;
    from += page;
  }

  const map = new Map();
  for (const log of all) {
    const tenantId = log["会社ID"];
    if (!tenantId) continue;
    const periodType = normalizePeriodType(log);
    const periodDate = normalizePeriodDate(log, periodType);
    if (!periodDate) continue;
    map.set(`${tenantId}|${periodType}|${periodDate}`, {
      tenantId: Number(tenantId),
      periodType,
      periodDate,
      log,
    });
  }

  let inserted = 0;
  for (const entry of map.values()) {
    const { tenantId, periodType, periodDate, log } = entry;
    const prevDate = previousDateFor(periodDate, periodType);
    const prevLog = prevDate ? map.get(`${tenantId}|${periodType}|${prevDate}`)?.log : null;

    const currentFeatures = extractFeatureCounts(log);
    const previousFeatures = prevLog ? extractFeatureCounts(prevLog) : {};
    const featureKeys = Array.from(new Set([...Object.keys(currentFeatures), ...Object.keys(previousFeatures)]));
    const totalFeatureSlots = Math.max(DEFAULT_FEATURE_SLOTS, featureKeys.length);
    const activeFeatures = featureKeys.filter((key) => (Number(currentFeatures[key]) || 0) > 0).length;
    const loginActive = Number(log["ログイン回数"] || 0) > 0;
    const score = Math.round(((activeFeatures + (loginActive ? 1 : 0)) / (totalFeatureSlots + 1)) * 100);

    const currentTotal = sumActions(currentFeatures) + Number(log["ログイン回数"] || 0);
    const previousTotal = prevLog
      ? sumActions(previousFeatures) + Number(prevLog["ログイン回数"] || 0)
      : 0;
    const trendChangePct = calculateTrendChange(currentTotal, previousTotal);
    const trendStatus = trendChangePct > 0 ? "up" : trendChangePct < 0 ? "down" : "flat";
    const zeroedFeatureAlert = detectZeroedFeature(currentFeatures, prevLog ? previousFeatures : null);

    const { error: upsertErr } = await supabase.from("health_scores").upsert(
      {
        tenant_id: tenantId,
        period_type: periodType,
        period_date: periodDate,
        score,
        status: determineStatus(score),
        trend_change_pct: trendChangePct,
        trend_status: trendStatus,
        zeroed_feature_alert: zeroedFeatureAlert,
      },
      { onConflict: "tenant_id,period_type,period_date" }
    );

    if (upsertErr) {
      console.error("upsert error", upsertErr, { tenantId, periodType, periodDate });
      return;
    }
    inserted += 1;
  }

  console.log("health_scores upserted:", inserted);
})();
