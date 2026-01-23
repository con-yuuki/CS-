import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: Request) {
  if (CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = (await request.json()) as {
    alertId?: string;
    tenantId?: number;
    renewalMonth?: string;
  };

  if (!body.alertId && !(body.tenantId && body.renewalMonth)) {
    return NextResponse.json(
      { error: "alertId or tenantId + renewalMonth is required." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin() as any;
  const update = {
    status: "acknowledged",
    acknowledged_at: new Date().toISOString(),
  };

  if (body.alertId) {
    const { error } = await supabase
      .from("renewal_alerts")
      .update(update)
      .eq("id", body.alertId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase
      .from("renewal_alerts")
      .update(update)
      .eq("tenant_id", body.tenantId!)
      .eq("renewal_month", body.renewalMonth!);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ status: "ok" });
}

