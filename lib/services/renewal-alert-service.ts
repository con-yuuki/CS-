import { addMonths, differenceInCalendarDays, format, isValid, parseISO, startOfMonth } from "date-fns";
import { Database } from "@/lib/supabase/database.types";

type SupabaseAdminClient = any;

type Company = Database["public"]["Tables"]["ユーザー基礎情報"]["Row"];
type HealthScore = Database["public"]["Tables"]["health_scores"]["Row"];
type RenewalAlert = Database["public"]["Tables"]["renewal_alerts"]["Row"];

export interface RenewalAlertItem {
  company: Company;
  renewalMonth: string;
  healthScore: HealthScore | null;
}

const SCORE_EMOJI = (score?: number | null) => {
  if (score === null || score === undefined) return "⚪️";
  if (score >= 80) return "🟢";
  if (score >= 40) return "🟡";
  return "🔴";
};

const buildIssueText = (healthScore: HealthScore | null) => {
  if (!healthScore) return "ヘルススコア未取得";
  if (healthScore.zeroed_feature_alert) return "利用停止の兆候あり";
  if (healthScore.trend_status === "down") return "利用減少傾向";
  if (healthScore.score < 40) return "低スコア";
  return healthScore.status;
};

const toDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
};

export const getTargetMonth = (baseDate: Date, monthsAhead: number) => {
  return startOfMonth(addMonths(baseDate, monthsAhead));
};

export const isWithinTargetWindow = (renewalDate: Date, targetDate: Date) => {
  const sameMonth =
    renewalDate.getFullYear() === targetDate.getFullYear() &&
    renewalDate.getMonth() === targetDate.getMonth();
  if (sameMonth) return true;
  const diff = Math.abs(differenceInCalendarDays(renewalDate, targetDate));
  return diff <= 3;
};

const getLatestHealthScores = async (
  supabase: SupabaseAdminClient,
  tenantIds: number[]
) => {
  if (tenantIds.length === 0) return new Map<number, HealthScore>();

  const { data, error } = await supabase
    .from("health_scores")
    .select("*")
    .in("tenant_id", tenantIds)
    .order("period_date", { ascending: false });

  if (error) {
    throw error;
  }

  const latestByTenant = new Map<number, HealthScore>();
  for (const score of (data ?? []) as HealthScore[]) {
    if (!latestByTenant.has(score.tenant_id)) {
      latestByTenant.set(score.tenant_id, score);
    }
  }

  return latestByTenant;
};

export const collectRenewalAlertItems = async (
  supabase: SupabaseAdminClient,
  baseDate: Date,
  monthsAhead = 5
): Promise<RenewalAlertItem[]> => {
  const targetDate = getTargetMonth(baseDate, monthsAhead);

  const { data: companies, error } = await supabase
    .from("ユーザー基礎情報")
    .select("id,name,next_renewal_month,mrc_ltv,churn_status");

  if (error) {
    throw error;
  }

  const candidates = ((companies ?? []) as Company[]).filter((company) => {
    const renewalDate = toDate(company.next_renewal_month);
    if (!renewalDate) return false;
    return isWithinTargetWindow(renewalDate, targetDate);
  });

  const latestScores = await getLatestHealthScores(
    supabase,
    candidates.map((company) => company.id)
  );

  return candidates.map((company) => ({
    company,
    renewalMonth: format(
      toDate(company.next_renewal_month) ?? targetDate,
      "yyyy/MM/dd"
    ),
    healthScore: latestScores.get(company.id) ?? null,
  }));
};

export const upsertRenewalAlerts = async (
  supabase: SupabaseAdminClient,
  items: RenewalAlertItem[],
  baseDate: Date,
  monthsAhead = 5
): Promise<RenewalAlert[]> => {
  if (items.length === 0) return [];
  const targetDate = getTargetMonth(baseDate, monthsAhead);

  const payload = items.map((item) => ({
    tenant_id: item.company.id,
    renewal_month: item.company.next_renewal_month,
    target_month: format(targetDate, "yyyy-MM-01"),
    status: "open" as const,
  }));

  const { data, error } = await supabase
    .from("renewal_alerts")
    .upsert(payload, {
      onConflict: "tenant_id,renewal_month",
    })
    .select("*");

  if (error) {
    throw error;
  }

  return (data ?? []) as RenewalAlert[];
};

export const fetchOpenAlerts = async (
  supabase: SupabaseAdminClient
): Promise<RenewalAlert[]> => {
  const { data, error } = await supabase
    .from("renewal_alerts")
    .select("*")
    .eq("status", "open");

  if (error) {
    throw error;
  }

  return (data ?? []) as RenewalAlert[];
};

export const markNotified = async (
  supabase: SupabaseAdminClient,
  alertIds: string[],
  notifiedAt: string
) => {
  if (alertIds.length === 0) return;
  const { error } = await supabase
    .from("renewal_alerts")
    .update({ last_notified_at: notifiedAt })
    .in("id", alertIds);

  if (error) {
    throw error;
  }
};

export const buildSlackBlocks = (items: RenewalAlertItem[]) => {
  const blocks: Array<Record<string, unknown>> = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🔔 【契約更新5ヶ月前】CSアラート",
      },
    },
  ];

  for (const item of items) {
    const score = item.healthScore?.score ?? null;
    const emoji = SCORE_EMOJI(score);
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${emoji} ${item.company.name ?? "名称不明"}*\n主要課題: ${buildIssueText(
          item.healthScore
        )}\n更新予定日: ${item.renewalMonth}`,
      },
    });
    blocks.push({ type: "divider" });
  }

  return blocks;
};

export const buildSlackPayload = (items: RenewalAlertItem[], dashboardUrl: string) => {
  const blocks = buildSlackBlocks(items);
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `📊 <${dashboardUrl}|ヘルススコア・ダッシュボードを開く>`,
      },
    ],
  });

  return { blocks };
};

