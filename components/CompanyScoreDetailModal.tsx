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
import { supabase } from "@/lib/supabase/client";

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
        console.log("🔍 モーダルデータ取得開始:", {
          tenant_id: healthScore.tenant_id,
          period_type: healthScore.period_type,
          period_date: healthScore.period_date,
        });

        // healthScoreから直接スコア詳細を取得
        const scoreResult = {
          score: healthScore.score,
          status: healthScore.status,
          breakdown: healthScore.breakdown,
        };

        // 利用ログの詳細を取得（raw_data用）
        let currentLog = await getUsageLogByPeriod(
          healthScore.tenant_id,
          healthScore.period_type,
          healthScore.period_date
        );

        console.log("📊 現在期間の利用ログ:", currentLog ? "取得成功" : "取得失敗");

        if (!currentLog) {
          // 別の期間タイプで試行
          console.log("🔄 別の期間タイプで再試行");
          currentLog = await getUsageLogByPeriod(
            healthScore.tenant_id,
            healthScore.period_type === "weekly" ? "monthly" : "weekly",
            healthScore.period_date
          );
          console.log("📊 再試行結果:", currentLog ? "取得成功" : "取得失敗");
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

        console.log("✅ スコア詳細を設定:", {
          hasCurrentLog: !!currentLog,
          hasPreviousLog: !!previousLog,
          scoreDetails: {
            currentLog: currentLog ? {
              loginCount: currentLoginCount,
              estCount: currentEstCount,
              constCount: currentConstCount,
            } : null,
          },
        });

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
        console.error("❌ スコア詳細の取得エラー:", error);
        // エラーが発生しても、healthScoreから取得できる情報は表示する
        setScoreDetails({
          currentLog: {
            loginCount: 0,
            estCount: 0,
            constCount: 0,
            activeRate: 0,
            customerCount: 0,
            vendorCount: 0,
            invoiceCount: 0,
            productOrderCount: 0,
            subcontractOrderCount: 0,
            siteContactCount: 0,
            budgetCount: 0,
            documentEmailCount: 0,
            documentCount: 0,
            photoCount: 0,
            scheduleCount: 0,
            taskCount: 0,
            dailyReportCount: 0,
          },
          previousLog: null,
          scoreResult: {
            score: healthScore.score,
            status: healthScore.status,
            breakdown: healthScore.breakdown,
          },
          periodType: healthScore.period_type,
        });
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

  const formatPoints = (value: number) => {
    if (Number.isInteger(value)) return `${value}`;
    return value.toFixed(2);
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
                      <div className="text-sm text-gray-600">素点</div>
                      <div className="text-2xl font-semibold">
                        {formatPoints(scoreDetails.scoreResult.breakdown.rawScore)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">継続利用</div>
                      <div className="text-2xl font-semibold">
                        {formatPoints(scoreDetails.scoreResult.breakdown.continuation)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">コア業務</div>
                      <div className="text-2xl font-semibold">
                        {formatPoints(scoreDetails.scoreResult.breakdown.core)}
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-sm text-gray-600 mb-1">計算概要</div>
                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                      継続利用: {formatPoints(scoreDetails.scoreResult.breakdown.continuation)}点
                      <br />
                      コア業務: {formatPoints(scoreDetails.scoreResult.breakdown.core)}点
                      <br />
                      周辺活用: {formatPoints(scoreDetails.scoreResult.breakdown.peripheral)}点
                      <br />
                      素点: {formatPoints(scoreDetails.scoreResult.breakdown.rawScore)}点
                      <br />
                      インパクト係数: {scoreDetails.scoreResult.breakdown.impactMultiplier}x
                      {scoreDetails.scoreResult.breakdown.impactApplied && (
                        <>
                          <br />
                          減少幅: {formatPoints(scoreDetails.scoreResult.breakdown.impactDrop)}点
                          <br />
                          調整後スコア: {formatPoints(scoreDetails.scoreResult.breakdown.adjustedScore)}点
                        </>
                      )}
                      <br />
                      最終スコア: {scoreDetails.scoreResult.score}
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

            {/* スコア詳細（カテゴリ別） */}
            <Card>
              <CardHeader>
                <CardTitle>スコア詳細（カテゴリ別）</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">継続利用</div>
                      <div className="text-sm text-gray-600">ログイン日数の達成度</div>
                    </div>
                    <div className="text-xl font-bold text-gray-600">
                      {formatPoints(scoreDetails.scoreResult.breakdown.continuation)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">コア業務</div>
                      <div className="text-sm text-gray-600">主要7機能の利用</div>
                    </div>
                    <div className="text-xl font-bold text-gray-600">
                      {formatPoints(scoreDetails.scoreResult.breakdown.core)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">周辺活用</div>
                      <div className="text-sm text-gray-600">周辺9機能の利用</div>
                    </div>
                    <div className="text-xl font-bold text-gray-600">
                      {formatPoints(scoreDetails.scoreResult.breakdown.peripheral)}
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

