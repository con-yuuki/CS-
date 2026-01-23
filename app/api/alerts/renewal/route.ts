import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  buildSlackPayload,
  collectRenewalAlertItems,
  fetchOpenAlerts,
  markNotified,
  upsertRenewalAlerts,
} from "@/lib/services/renewal-alert-service";

export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const DASHBOARD_URL = process.env.ALERT_DASHBOARD_URL;

const getJstNow = () => {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: Number(getPart("year")),
    month: Number(getPart("month")),
    day: Number(getPart("day")),
    hour: Number(getPart("hour")),
    dateKey: `${getPart("year")}-${getPart("month")}-${getPart("day")}`,
  };
};

const isSameJstDate = (value?: string | null, jstDateKey?: string) => {
  if (!value || !jstDateKey) return false;
  return value.startsWith(jstDateKey);
};

export async function GET(request: Request) {
  if (CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!SLACK_WEBHOOK_URL || !DASHBOARD_URL) {
    return NextResponse.json(
      { error: "Slack webhook or dashboard URL not configured." },
      { status: 500 }
    );
  }

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
  const jstNow = getJstNow();
  const now = new Date();

  if (jstNow.day === 1) {
    const items = await collectRenewalAlertItems(supabase, now, 5);
    await upsertRenewalAlerts(supabase, items, now, 5);
  }

  if (jstNow.hour < 9) {
    return NextResponse.json({ status: "skipped", reason: "before 9AM JST" });
  }

  const openAlerts = await fetchOpenAlerts(supabase);
  const notNotifiedToday = openAlerts.filter(
    (alert) => !isSameJstDate(alert.last_notified_at, jstNow.dateKey)
  );

  if (notNotifiedToday.length === 0) {
    return NextResponse.json({ status: "ok", notified: 0 });
  }

  const tenantIds = notNotifiedToday.map((alert) => alert.tenant_id);
  const items = await collectRenewalAlertItems(supabase, now, 5);
  const targetItems = items.filter((item) => tenantIds.includes(item.company.id));

  if (targetItems.length === 0) {
    return NextResponse.json({ status: "ok", notified: 0 });
  }

  const payload = buildSlackPayload(targetItems, DASHBOARD_URL);
  const response = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    return NextResponse.json(
      { error: "Slack webhook failed", detail: body },
      { status: 502 }
    );
  }

  await markNotified(
    supabase,
    notNotifiedToday.map((alert) => alert.id),
    new Date().toISOString()
  );

  return NextResponse.json({ status: "ok", notified: targetItems.length });
}

