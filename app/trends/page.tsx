"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "@/lib/services/company-service";
import { getHealthScoreHistory, getHealthScoreHistoryAll } from "@/lib/services/health-score-service";
import { getDecliningCompanies } from "@/lib/services/declining-companies-service";
import { getUsageLogHistory, getUsageLogHistoryAll } from "@/lib/services/usage-log-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { Database } from "@/lib/supabase/database.types";

type HealthScore = Database["public"]["Tables"]["health_scores"]["Row"];
type Company = Database["public"]["Tables"]["ユーザー基礎情報"]["Row"];
type UsageLog = Database["public"]["Tables"]["usage_logs"]["Row"];

export default function TrendsPage() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [companySearch, setCompanySearch] = useState("");
  const [periodType, setPeriodType] = useState<"weekly" | "monthly">("monthly");

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const { data: scoreHistory = [] } = useQuery<HealthScore[]>({
    queryKey: ["healthScoreHistory", selectedCompanyId, periodType],
    queryFn: () => {
      if (!selectedCompanyId) return Promise.resolve([]);
      return getHealthScoreHistory(selectedCompanyId, periodType);
    },
    enabled: !!selectedCompanyId,
  });

  const { data: scoreHistoryAll = [] } = useQuery<HealthScore[]>({
    queryKey: ["healthScoreHistoryAll", periodType],
    queryFn: () => getHealthScoreHistoryAll(periodType),
    enabled: !selectedCompanyId,
  });

  const { data: usageHistory = [] } = useQuery<UsageLog[]>({
    queryKey: ["usageHistory", selectedCompanyId, periodType],
    queryFn: () => {
      if (!selectedCompanyId) return Promise.resolve([]);
      return getUsageLogHistory(selectedCompanyId, periodType);
    },
    enabled: !!selectedCompanyId,
  });

  const { data: usageHistoryAll = [] } = useQuery<UsageLog[]>({
    queryKey: ["usageHistoryAll", periodType],
    queryFn: () => getUsageLogHistoryAll(periodType),
    enabled: !selectedCompanyId,
  });

  const formatPeriodLabel = (value?: string | null) => {
    if (!value) return "不明";
    const parsed = parseISO(value);
    if (!isValid(parsed)) return String(value);
    return periodType === "weekly" ? format(parsed, "yyyy-MM-dd") : format(parsed, "yyyy-MM");
  };

  const activeScoreHistory = selectedCompanyId ? scoreHistory : scoreHistoryAll;
  const activeUsageHistory = selectedCompanyId ? usageHistory : usageHistoryAll;

  // グラフ用データの準備
  const chartData = useMemo(() => {
    if (selectedCompanyId) {
      return activeScoreHistory.map((item) => ({
        date: formatPeriodLabel(item.period_date),
        score: item.score,
        status: item.status,
      }));
    }

    const aggregate = new Map<string, { sum: number; count: number }>();
    activeScoreHistory.forEach((item) => {
      const key = item.period_date;
      if (!key) return;
      const current = aggregate.get(key) || { sum: 0, count: 0 };
      aggregate.set(key, { sum: current.sum + item.score, count: current.count + 1 });
    });

    return Array.from(aggregate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        date: formatPeriodLabel(date),
        score: Math.round(value.sum / value.count),
        status: undefined,
      }));
  }, [activeScoreHistory, selectedCompanyId, formatPeriodLabel]);

  const usageChartData = useMemo(() => {
    if (selectedCompanyId) {
      return activeUsageHistory.map((item) => {
        const rawDate = periodType === "weekly" ? item.対象週 : item.対象月;
        const dateLabel = formatPeriodLabel(rawDate ?? undefined);
        return {
          date: dateLabel,
          loginCount: Number(item.ログイン回数 || 0),
          estCount: Number(item.見積作成数 || 0),
          constCount: Number(item.工事登録数 || 0),
        };
      });
    }

    const aggregate = new Map<string, { login: number; est: number; cons: number }>();
    activeUsageHistory.forEach((item) => {
      const rawDate = periodType === "weekly" ? item.対象週 : item.対象月;
      if (!rawDate) return;
      const key = rawDate;
      const current = aggregate.get(key) || { login: 0, est: 0, cons: 0 };
      aggregate.set(key, {
        login: current.login + Number(item.ログイン回数 || 0),
        est: current.est + Number(item.見積作成数 || 0),
        cons: current.cons + Number(item.工事登録数 || 0),
      });
    });

    return Array.from(aggregate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        date: formatPeriodLabel(date),
        loginCount: value.login,
        estCount: value.est,
        constCount: value.cons,
      }));
  }, [activeUsageHistory, selectedCompanyId, formatPeriodLabel, periodType]);

  // 急落企業の検出（前月比で20点以上減少）
  const { data: decliningCompanies = [] } = useQuery({
    queryKey: ["decliningCompanies", periodType],
    queryFn: () => getDecliningCompanies(periodType),
  });

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const filteredCompanies = useMemo(() => {
    const query = companySearch.trim().toLowerCase();
    if (!query) return companies;
    return companies.filter((company) => {
      const nameMatch = company.name?.toLowerCase().includes(query) ?? false;
      const idMatch = company.id.toString().includes(query);
      return nameMatch || idMatch;
    });
  }, [companies, companySearch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost">← ホームに戻る</Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">トレンド分析</h1>

      {/* 企業選択 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>企業選択</CardTitle>
          <CardDescription>スコア推移を表示する企業を選択してください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant={periodType === "monthly" ? "default" : "outline"}
              onClick={() => setPeriodType("monthly")}
            >
              月次
            </Button>
            <Button
              type="button"
              variant={periodType === "weekly" ? "default" : "outline"}
              onClick={() => setPeriodType("weekly")}
            >
              週次
            </Button>
          </div>
          <div className="mb-4">
            <Input
              value={companySearch}
              onChange={(event) => setCompanySearch(event.target.value)}
              placeholder="企業名 / 企業IDで検索"
            />
          </div>
          <select
            value={selectedCompanyId ?? ""}
            onChange={(e) => setSelectedCompanyId(e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">企業を選択...</option>
            {filteredCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name} (ID: {company.id})
              </option>
            ))}
          </select>
          {filteredCompanies.length === 0 && (
            <p className="mt-2 text-sm text-muted-foreground">該当する企業がありません</p>
          )}
        </CardContent>
      </Card>

      {/* スコア推移グラフ */}
      {(selectedCompanyId || chartData.length > 0) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{selectedCompanyId ? `${selectedCompany?.name} のスコア推移` : "全企業のスコア推移"}</CardTitle>
            <CardDescription>
              {selectedCompanyId ? "期間別のヘルススコアの変化" : "期間別の平均スコアの変化"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                データがありません
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="スコア"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* 機能ごとの利用数推移グラフ */}
      {(selectedCompanyId || usageChartData.length > 0) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {selectedCompanyId ? `${selectedCompany?.name} の機能別利用数推移` : "全企業の機能別利用数推移"}
            </CardTitle>
            <CardDescription>ログイン / 見積 / 工事の利用数推移</CardDescription>
          </CardHeader>
          <CardContent>
            {usageChartData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                データがありません
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={usageChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="loginCount" stroke="#2563eb" name="ログイン回数" />
                  <Line type="monotone" dataKey="estCount" stroke="#16a34a" name="見積作成数" />
                  <Line type="monotone" dataKey="constCount" stroke="#f97316" name="工事登録数" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* 急落企業アラート */}
      {!selectedCompanyId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              急落企業アラート
            </CardTitle>
            <CardDescription>
              前期間比で20点以上スコアが減少した企業
            </CardDescription>
          </CardHeader>
          <CardContent>
            {decliningCompanies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                急落企業はありません
              </div>
            ) : (
              <div className="space-y-2">
                {decliningCompanies.map((item) => (
                  <div
                    key={item.companyId}
                    className="border border-yellow-300 bg-yellow-50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.companyName}</h3>
                        {item.priority === "max" && (
                          <Badge variant="destructive">優先</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        企業ID: {item.companyId} | 前回: {item.previousScore}点 → 今回: {item.currentScore}点
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                      <span className="text-lg font-bold text-red-500">
                        -{item.drop}点
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

