"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "@/lib/services/company-service";
import { getLatestDynamicHealthScores, DynamicHealthScore } from "@/lib/services/dynamic-health-score-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search, Download, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { exportToExcel } from "@/lib/utils/excel-exporter";
import { Database } from "@/lib/supabase/database.types";
import { CompanyScoreDetailModal } from "@/components/CompanyScoreDetailModal";

type Company = Database["public"]["Tables"]["ユーザー基礎情報"]["Row"];

interface HealthScoreWithCompany extends DynamicHealthScore {}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Excellent" | "Stable" | "Warning" | "Critical"
  >("all");
  const [showHighImpactOnly, setShowHighImpactOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HealthScoreWithCompany | null>(null);

  // ヘルススコアデータの取得（動的に計算）
  const { data: healthScores = [], isLoading: scoresLoading } = useQuery<DynamicHealthScore[]>({
    queryKey: ["healthScores", "latest", "dynamic"],
    queryFn: getLatestDynamicHealthScores,
  });

  // データの結合とフィルタリング
  const filteredData = useMemo(() => {
    // healthScoresには既にcompanyが含まれている
    let combined: HealthScoreWithCompany[] = healthScores.map((score) => ({
      ...score,
    }));

    // 検索フィルタ
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      combined = combined.filter(
        (item) =>
          (item.company.name?.toLowerCase().includes(query) ?? false) ||
          item.company.id.toString().includes(query)
      );
    }

    // ステータスフィルタ
    if (statusFilter !== "all") {
      combined = combined.filter((item) => item.status === statusFilter);
    }

    // インパクト企業フィルタ
    if (showHighImpactOnly) {
      combined = combined.filter((item) => Number(item.company.mrc_ltv || 0) >= 55000);
    }

    return combined.sort((a, b) => {
      if (a.displayPriority !== b.displayPriority) {
        return a.displayPriority === "max" ? -1 : 1;
      }
      return b.score - a.score;
    });
  }, [healthScores, searchQuery, statusFilter, showHighImpactOnly]);

  // 統計情報の計算
  const stats = useMemo(() => {
    const averageScore =
      healthScores.length > 0
        ? healthScores.reduce((sum, item) => sum + item.score, 0) / healthScores.length
        : 0;

    const statusCounts = {
      Excellent: healthScores.filter((item) => item.status === "Excellent").length,
      Stable: healthScores.filter((item) => item.status === "Stable").length,
      Warning: healthScores.filter((item) => item.status === "Warning").length,
      Critical: healthScores.filter((item) => item.status === "Critical").length,
    };

    const highImpactCount = healthScores.filter(
      (item) => item.company && Number(item.company.mrc_ltv || 0) >= 55000
    ).length;

    return {
      averageScore: Math.round(averageScore),
      statusCounts,
      highImpactCount,
      totalCount: healthScores.length,
    };
  }, [healthScores]);

  const handleExport = () => {
    const exportData = filteredData.map((item) => ({
      healthScore: {
        ...item,
        period_date: item.period_date,
        created_at: new Date().toISOString(), // 動的計算のため現在時刻を使用
      } as any,
      company: item.company,
    }));
    exportToExcel(exportData, `health_scores_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const isLoading = scoresLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost">← ホームに戻る</Button>
        </Link>
        <Button onClick={handleExport} disabled={filteredData.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          エクスポート
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-6">CS Health Score Dashboard</h1>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>平均スコア</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageScore}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>総企業数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>インパクト企業</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.highImpactCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Critical</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats.statusCounts.Critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* ステータス分布 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>ステータス分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.statusCounts.Excellent}</div>
              <div className="text-sm text-gray-600">Excellent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.statusCounts.Stable}</div>
              <div className="text-sm text-gray-600">Stable</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats.statusCounts.Warning}</div>
              <div className="text-sm text-gray-600">Warning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.statusCounts.Critical}</div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* フィルタ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>フィルタ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="企業名またはIDで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "Excellent" | "Stable" | "Warning" | "Critical"
                )
              }
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">すべてのステータス</option>
              <option value="Excellent">Excellent</option>
              <option value="Stable">Stable</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showHighImpactOnly}
                onChange={(e) => setShowHighImpactOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">インパクト企業のみ</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* スコア一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>スコア一覧 ({filteredData.length}件)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">データがありません</div>
          ) : (
            <div className="space-y-2">
              {filteredData.map((item) => {
                const isHighImpact = Number(item.company.mrc_ltv || 0) >= 55000;
                const isPriorityMax = item.displayPriority === "max";
                return (
                  <div
                    key={item.tenant_id}
                    onClick={() => setSelectedItem(item)}
                    className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      isPriorityMax
                        ? "border-red-300 bg-red-50/40"
                        : isHighImpact
                        ? "border-yellow-300 bg-yellow-50/30"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{item.company.name}</h3>
                          {isPriorityMax && (
                            <Badge variant="outline" className="bg-red-100 text-red-800">
                              優先対応
                            </Badge>
                          )}
                          {isHighImpact && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                              インパクト企業
                            </Badge>
                          )}
                          <Badge
                            variant={
                              item.status === "Excellent"
                                ? "excellent"
                                : item.status === "Stable"
                                ? "stable"
                                : item.status === "Warning"
                                ? "warning"
                                : "critical"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>企業ID: {item.company.id}</span>
                          <span>月額契約額: ¥{Number(item.company.mrc_ltv || 0).toLocaleString()}</span>
                          <span>期間: {item.period_date}</span>
                          <span>
                            トレンド:{" "}
                            {item.trendStatus === "up"
                              ? "上昇"
                              : item.trendStatus === "down"
                              ? "下降"
                              : "横ばい"}
                          </span>
                          <span>
                            前月比: {item.trendChangeRate > 0 ? "+" : ""}
                            {item.trendChangeRate}%
                          </span>
                        </div>
                        {item.learningPeriodAlert?.hasAlert && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                            <AlertTriangle className="inline h-4 w-4 mr-1" />
                            {item.learningPeriodAlert.message}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">{item.score}</div>
                        <div className="text-xs text-gray-500">スコア</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 詳細モーダル */}
      {selectedItem && (
        <CompanyScoreDetailModal
          open={!!selectedItem}
          onOpenChange={(open) => {
            if (!open) setSelectedItem(null);
          }}
          healthScore={selectedItem}
        />
      )}
    </div>
  );
}

