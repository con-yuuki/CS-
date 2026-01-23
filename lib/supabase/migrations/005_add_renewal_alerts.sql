create table if not exists public.renewal_alerts (
  id uuid primary key default gen_random_uuid(),
  tenant_id integer not null,
  renewal_month date not null,
  target_month date not null,
  status text not null default 'open' check (status in ('open', 'acknowledged')),
  last_notified_at timestamptz,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists renewal_alerts_tenant_renewal_month_idx
  on public.renewal_alerts (tenant_id, renewal_month);

create index if not exists renewal_alerts_status_idx
  on public.renewal_alerts (status);

create index if not exists renewal_alerts_target_month_idx
  on public.renewal_alerts (target_month);

