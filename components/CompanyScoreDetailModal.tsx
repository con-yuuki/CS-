"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { Database } from "@/lib/supabase/database.types";
import { getUsageLogByPeriod } from "@/lib/services/usage-log-service";
import { calculateHealthScore } from "@/lib/score-calculator";
import { subWeeks, subMonths, format } from "date-fns";
import { Loader2 } from "lucide-react";
import { DynamicHealthScore } from "@/lib/services/dynamic-health-score-service";

type UsageLog = Database["public"]["Tables"]["usage_logs"]["Row"];

interface CompanyScoreDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  healthScore: DynamicHealthScore;
}

export function CompanyScoreDetailModal({
  open,
  onOpenChange,
  healthScore,
}: CompanyScoreDetailModalProps) {
  const company = healthScore.company;
  const [scoreDetails, setScoreDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // スコア詳細を設定（healthScoreから直接取得）
  useEffect(() => {
    if (!open || !healthScore) return;

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        // healthScoreから直接スコア詳細を取得
        const scoreResult = {
          score: healthScore.score,
          status: healthScore.status,
          breakdown: healthScore.breakdown,
          details: healthScore.details,
        };

        // 利用ログの詳細を取得（raw_data用）
        let currentLog = await getUsageLogByPeriod(
          healthScore.tenant_id,
          healthScore.period_type,
          healthScore.period_date
        );

        if (!currentLog) {
          // 別の期間タイプで試行
          currentLog = await getUsageLogByPeriod(
            healthScore.tenant_id,
            healthScore.period_type === "weekly" ? "monthly" : "weekly",
            healthScore.period_date
          );
        }

        // 前期間の利用ログを取得
        const currentDate = new Date(healthScore.period_date);
        const previousDate =
          healthScore.period_type === "weekly"
            ? format(subWeeks(currentDate, 1), "yyyy-MM-dd")
            : format(subMonths(currentDate, 1), "yyyy-MM-dd");

        const previousLog = await getUsageLogByPeriod(
          healthScore.tenant_id,
          healthScore.period_type,
          previousDate
        );

        const currentLoginCount = currentLog ? (currentLog.ログイン回数 || 0) : 0;
        const currentEstCount = currentLog ? (currentLog.見積作成数 || 0) : 0;
        const currentConstCount = currentLog ? (currentLog.工事登録数 || 0) : 0;
        const currentActiveRate = currentLog ? (currentLog.Active率 ? Number(currentLog.Active率) : 0) : 0;

        const previousLoginCount = previousLog ? (previousLog.ログイン回数 || 0) : 0;
        const previousEstCount = previousLog ? (previousLog.見積作成数 || 0) : 0;
        const previousConstCount = previousLog ? (previousLog.工事登録数 || 0) : 0;
        const previousActiveRate = previousLog
          ? previousLog.Active率
            ? Number(previousLog.Active率)
            : 0
          : 0;

        // raw_dataから詳細項目を取得
        const currentRawData = currentLog ? ((currentLog as any).raw_data || (currentLog as any)._original || {}) : {};
        const previousRawData = previousLog ? ((previousLog as any).raw_data || (previousLog as any)._original || {}) : null;

        // 詳細項目のマッピング関数
        const getDetailValue = (rawData: any, keyPatterns: string[]): number => {
          if (!rawData) return 0;
          for (const pattern of keyPatterns) {
            // 完全一致を試す
            if (rawData[pattern] !== undefined) {
              return Number(rawData[pattern]) || 0;
            }
            // 部分一致を試す
            for (const key in rawData) {
              if (key.includes(pattern) || pattern.includes(key)) {
                return Number(rawData[key]) || 0;
              }
            }
          }
          return 0;
        };

        setScoreDetails({
          currentLog: {
            loginCount: currentLoginCount,
            estCount: currentEstCount,
            constCount: currentConstCount,
            activeRate: currentActiveRate,
            // 詳細項目
            customerCount: getDetailValue(currentRawData, ["顧客登録数", "顧客数", "顧客登録"]),
            vendorCount: getDetailValue(currentRawData, ["業者登録数", "業者数", "業者登録"]),
            invoiceCount: getDetailValue(currentRawData, ["請求書作成数", "請求書", "請求書作成"]),
            productOrderCount: getDetailValue(currentRawData, ["商品発注書作成数", "商品発注書", "商品発注"]),
            subcontractOrderCount: getDetailValue(currentRawData, ["外注発注書作成数", "外注発注書", "外注発注"]),
            siteContactCount: getDetailValue(currentRawData, ["現場連絡表作成数", "現場連絡表", "現場連絡"]),
            budgetCount: getDetailValue(currentRawData, ["実行予算作成数", "実行予算", "予算作成"]),
            documentEmailCount: getDetailValue(currentRawData, ["書類メール送信数", "書類メール", "メール送信"]),
            documentCount: getDetailValue(currentRawData, ["資料登録数", "資料登録", "資料"]),
            photoCount: getDetailValue(currentRawData, ["写真登録数", "写真登録", "写真"]),
            scheduleCount: getDetailValue(currentRawData, ["工程表作成数", "工程表", "工程表作成"]),
            taskCount: getDetailValue(currentRawData, ["タスク登録数", "タスク登録", "タスク"]),
            dailyReportCount: getDetailValue(currentRawData, ["日報登録数", "日報登録", "日報"]),
          },
          previousLog: previousLog
            ? {
                loginCount: previousLoginCount || 0,
                estCount: previousEstCount || 0,
                constCount: previousConstCount || 0,
                activeRate: previousActiveRate || 0,
                // 詳細項目
                customerCount: getDetailValue(previousRawData, ["顧客登録数", "顧客数", "顧客登録"]),
                vendorCount: getDetailValue(previousRawData, ["業者登録数", "業者数", "業者登録"]),
                invoiceCount: getDetailValue(previousRawData, ["請求書作成数", "請求書", "請求書作成"]),
                productOrderCount: getDetailValue(previousRawData, ["商品発注書作成数", "商品発注書", "商品発注"]),
                subcontractOrderCount: getDetailValue(previousRawData, ["外注発注書作成数", "外注発注書", "外注発注"]),
                siteContactCount: getDetailValue(previousRawData, ["現場連絡表作成数", "現場連絡表", "現場連絡"]),
                budgetCount: getDetailValue(previousRawData, ["実行予算作成数", "実行予算", "予算作成"]),
                documentEmailCount: getDetailValue(previousRawData, ["書類メール送信数", "書類メール", "メール送信"]),
                documentCount: getDetailValue(previousRawData, ["資料登録数", "資料登録", "資料"]),
                photoCount: getDetailValue(previousRawData, ["写真登録数", "写真登録", "写真"]),
                scheduleCount: getDetailValue(previousRawData, ["工程表作成数", "工程表", "工程表作成"]),
                taskCount: getDetailValue(previousRawData, ["タスク登録数", "タスク登録", "タスク"]),
                dailyReportCount: getDetailValue(previousRawData, ["日報登録数", "日報登録", "日報"]),
              }
            : null,
          scoreResult,
          periodType: healthScore.period_type,
        });
      } catch (error) {
        console.error("スコア詳細の取得エラー:", error);
        setScoreDetails(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [open, healthScore]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Excellent":
        return "bg-green-100 text-green-800";
      case "Stable":
        return "bg-blue-100 text-blue-800";
      case "Warning":
        return "bg-yellow-100 text-yellow-800";
      case "Critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatVariation = (value: number) => {
    if (value === 0) return "±0";
    return value > 0 ? `+${value}` : `${value}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{company.name}</DialogTitle>
          <DialogDescription>
            企業ID: {company.id} | 月額契約額: ¥{Number(company.mrc_ltv || 0).toLocaleString()} |
            期間: {healthScore.period_date}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">読み込み中...</span>
          </div>
        ) : scoreDetails ? (
          <div className="space-y-4">
            {/* スコア概要 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>スコア概要</span>
                  <Badge className={getStatusColor(healthScore.status)}>
                    {healthScore.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              {healthScore.learningPeriodAlert?.hasAlert && (
                <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
                  <div className="flex items-center gap-2 text-sm text-yellow-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{healthScore.learningPeriodAlert.message}</span>
                  </div>
                </div>
              )}
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">最終スコア</div>
                      <div className="text-3xl font-bold">{healthScore.score}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">ベーススコア</div>
                      <div className="text-2xl font-semibold">
                        {scoreDetails.scoreResult.breakdown.baseScore}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">変動値合計（係数適用前）</div>
                      <div className="text-2xl font-semibold">
                        {formatVariation(scoreDetails.scoreResult.breakdown.variationTotal)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">インパクト係数</div>
                      <div className="text-2xl font-semibold">
                        {scoreDetails.scoreResult.breakdown.impactMultiplier}x
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-sm text-gray-600 mb-1">計算式</div>
                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                      変動値合計（係数適用前）: {formatVariation(scoreDetails.scoreResult.breakdown.variationTotal)}
                      <br />
                      インパクト係数: {scoreDetails.scoreResult.breakdown.impactMultiplier}x
                      <br />
                      調整後変動値: {formatVariation(scoreDetails.scoreResult.breakdown.adjustedVariation || (scoreDetails.scoreResult.breakdown.variationTotal * scoreDetails.scoreResult.breakdown.impactMultiplier))}
                      <br />
                      最終スコア = max(0, min(100, ベーススコア + 調整後変動値))
                      <br />
                      = max(0, min(100, {scoreDetails.scoreResult.breakdown.baseScore} + {formatVariation(scoreDetails.scoreResult.breakdown.adjustedVariation || (scoreDetails.scoreResult.breakdown.variationTotal * scoreDetails.scoreResult.breakdown.impactMultiplier))}))
                      <br />
                      = max(0, min(100, {scoreDetails.scoreResult.breakdown.baseScore + (scoreDetails.scoreResult.breakdown.adjustedVariation || (scoreDetails.scoreResult.breakdown.variationTotal * scoreDetails.scoreResult.breakdown.impactMultiplier))}))
                      <br />
                      = {scoreDetails.scoreResult.score}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 利用状況 */}
            <Card>
              <CardHeader>
                <CardTitle>利用状況</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">現在期間</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">ログイン回数</div>
                        <div className="text-lg font-semibold">
                          {scoreDetails.currentLog.loginCount}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">週間工事登録数</div>
                        <div className="text-lg font-semibold">
                          {scoreDetails.currentLog.constCount}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">顧客登録数</div>
                        <div className="text-lg font-semibold">
                          {scoreDetails.currentLog.customerCount || 0}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">業者登録数</div>
                        <div className="text-lg font-semibold">
                          {scoreDetails.currentLog.vendorCount || 0}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">見積書作成数</div>
                        <div className="text-lg font-semibold">
                          {scoreDetails.currentLog.estCount}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">請求書作成数</div>
                        <div className="text-lg font-semibold">
                          {scoreDetails.currentLog.invoiceCount || 0}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">商品発注書作成数</div>
                        <div className="text-lg font-semibold">
                          {scoreDetails.currentLog.productOrderCount || 0}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">外注発注書作成数</div>
                        <div className="text-lg font-semibold">
                          {scoreDetails.currentLog.subcontractOrderCount || 0}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">現場連絡表作成数</div>
                        <div className="text-lg font-semibold">
                          {scoreDetails.currentLog.siteContactCount || 0}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">実行予算作成数</div>
                        <div className="text-lg font-semibold">
                          {scoreDetails.currentLog.budgetCount || 0}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">書類メール送信数</div>
                        <div className="text-lg font-semibold">
                          {scoreDetails.currentLog.documentEmailCount || 0}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">資料登録数</div>
                        <div className="text-lg font-semibold">
                          {scoreDetails.currentLog.documentCount || 0}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">写真登録数</div>
                        <div className="text-lg font-semibold">
                          {scoreDetails.currentLog.photoCount || 0}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">工程表作成数</div>
                        <div className="text-lg font-semibold">
                          {scoreDetails.currentLog.scheduleCount || 0}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">タスク登録数</div>
                        <div className="text-lg font-semibold">
                          {scoreDetails.currentLog.taskCount || 0}
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">日報登録数</div>
                        <div className="text-lg font-semibold">
                          {scoreDetails.currentLog.dailyReportCount || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                  {scoreDetails.previousLog && (
                    <div>
                      <h4 className="font-semibold mb-3">前期間（比較用）</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">ログイン回数</div>
                          <div className="text-lg font-semibold">
                            {scoreDetails.previousLog.loginCount}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">週間工事登録数</div>
                          <div className="text-lg font-semibold">
                            {scoreDetails.previousLog.constCount}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">顧客登録数</div>
                          <div className="text-lg font-semibold">
                            {scoreDetails.previousLog.customerCount || 0}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">業者登録数</div>
                          <div className="text-lg font-semibold">
                            {scoreDetails.previousLog.vendorCount || 0}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">見積書作成数</div>
                          <div className="text-lg font-semibold">
                            {scoreDetails.previousLog.estCount}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">請求書作成数</div>
                          <div className="text-lg font-semibold">
                            {scoreDetails.previousLog.invoiceCount || 0}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">商品発注書作成数</div>
                          <div className="text-lg font-semibold">
                            {scoreDetails.previousLog.productOrderCount || 0}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">外注発注書作成数</div>
                          <div className="text-lg font-semibold">
                            {scoreDetails.previousLog.subcontractOrderCount || 0}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">現場連絡表作成数</div>
                          <div className="text-lg font-semibold">
                            {scoreDetails.previousLog.siteContactCount || 0}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">実行予算作成数</div>
                          <div className="text-lg font-semibold">
                            {scoreDetails.previousLog.budgetCount || 0}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">書類メール送信数</div>
                          <div className="text-lg font-semibold">
                            {scoreDetails.previousLog.documentEmailCount || 0}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">資料登録数</div>
                          <div className="text-lg font-semibold">
                            {scoreDetails.previousLog.documentCount || 0}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">写真登録数</div>
                          <div className="text-lg font-semibold">
                            {scoreDetails.previousLog.photoCount || 0}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">工程表作成数</div>
                          <div className="text-lg font-semibold">
                            {scoreDetails.previousLog.scheduleCount || 0}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">タスク登録数</div>
                          <div className="text-lg font-semibold">
                            {scoreDetails.previousLog.taskCount || 0}
                          </div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">日報登録数</div>
                          <div className="text-lg font-semibold">
                            {scoreDetails.previousLog.dailyReportCount || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* スコア詳細（変動値） */}
            <Card>
              <CardHeader>
                <CardTitle>スコア詳細（変動値）</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">基本利用（ログイン）</div>
                      <div className="text-sm text-gray-600">
                        {scoreDetails.currentLog.loginCount === 0
                          ? "ログインなし"
                          : `${scoreDetails.currentLog.loginCount}回`}
                      </div>
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        scoreDetails.scoreResult.details.basicUsage < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {formatVariation(scoreDetails.scoreResult.details.basicUsage)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">見積未利用</div>
                      <div className="text-sm text-gray-600">
                        {scoreDetails.currentLog.estCount === 0
                          ? "見積未作成"
                          : `${scoreDetails.currentLog.estCount}件作成`}
                      </div>
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        scoreDetails.scoreResult.details.estimateUsage < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {formatVariation(scoreDetails.scoreResult.details.estimateUsage)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">工事未利用</div>
                      <div className="text-sm text-gray-600">
                        {scoreDetails.currentLog.constCount === 0
                          ? "工事未登録"
                          : `${scoreDetails.currentLog.constCount}件登録`}
                      </div>
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        scoreDetails.scoreResult.details.constructionUsage < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {formatVariation(scoreDetails.scoreResult.details.constructionUsage)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">Active率</div>
                      <div className="text-sm text-gray-600">
                        {scoreDetails.currentLog.activeRate.toFixed(1)}%
                        {scoreDetails.currentLog.activeRate < 10
                          ? " (低Active)"
                          : scoreDetails.currentLog.activeRate > 50
                          ? " (高Active)"
                          : ""}
                      </div>
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        scoreDetails.scoreResult.details.activeRate < 0
                          ? "text-red-600"
                          : scoreDetails.scoreResult.details.activeRate > 0
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {formatVariation(scoreDetails.scoreResult.details.activeRate)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">トレンド（前期間比）</div>
                      <div className="text-sm text-gray-600">
                        {scoreDetails.previousLog
                          ? `前期: ${scoreDetails.previousLog.loginCount}回 → 当期: ${scoreDetails.currentLog.loginCount}回`
                          : "前期データなし"}
                      </div>
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        scoreDetails.scoreResult.details.trend < 0
                          ? "text-red-600"
                          : scoreDetails.scoreResult.details.trend > 0
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {formatVariation(scoreDetails.scoreResult.details.trend)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            詳細情報を取得できませんでした
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

