"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "@/lib/services/company-service";
import { getHealthScoreHistory } from "@/lib/services/health-score-service";
import { getDecliningCompanies } from "@/lib/services/declining-companies-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Database } from "@/lib/supabase/database.types";

type HealthScore = Database["public"]["Tables"]["health_scores"]["Row"];
type Company = Database["public"]["Tables"]["ユーザー基礎情報"]["Row"];

export default function TrendsPage() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const { data: scoreHistory = [] } = useQuery<HealthScore[]>({
    queryKey: ["healthScoreHistory", selectedCompanyId],
    queryFn: () => {
      if (!selectedCompanyId) return Promise.resolve([]);
      return getHealthScoreHistory(selectedCompanyId);
    },
    enabled: !!selectedCompanyId,
  });

  // グラフ用データの準備
  const chartData = scoreHistory.map((item) => ({
    date: format(parseISO(item.period_date), "yyyy-MM-dd"),
    score: item.score,
    status: item.status,
  }));

  // 急落企業の検出（前月比で20点以上減少）
  const { data: decliningCompanies = [] } = useQuery({
    queryKey: ["decliningCompanies"],
    queryFn: getDecliningCompanies,
  });

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

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
          <select
            value={selectedCompanyId ?? ""}
            onChange={(e) => setSelectedCompanyId(e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">企業を選択...</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name} (ID: {company.id})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* スコア推移グラフ */}
      {selectedCompanyId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{selectedCompany?.name} のスコア推移</CardTitle>
            <CardDescription>期間別のヘルススコアの変化</CardDescription>
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

      {/* 急落企業アラート */}
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
                    <h3 className="font-semibold">{item.companyName}</h3>
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
    </div>
  );
}

