import * as XLSX from "xlsx";
import { Database } from "@/lib/supabase/database.types";
import { DynamicHealthScore } from "@/lib/services/dynamic-health-score-service";

type HealthScore = Database["public"]["Tables"]["health_scores"]["Row"];
type Company = Database["public"]["Tables"]["ユーザー基礎情報"]["Row"];

export interface ExportData {
  healthScore: HealthScore | DynamicHealthScore;
  company: Company;
}

/**
 * ヘルススコアデータをExcel形式でエクスポート
 */
export function exportToExcel(data: ExportData[], filename: string = "health_scores.xlsx") {
  // データを整形
  const worksheetData = data.map((item) => ({
    企業ID: item.company.id,
    企業名: item.company.name || "",
    月額契約額: item.company.mrc_ltv || 0,
    スコア: item.healthScore.score,
    ステータス: item.healthScore.status,
    期間: "period_date" in item.healthScore ? item.healthScore.period_date : 
          "periodDate" in item.healthScore ? (item.healthScore as any).periodDate : "",
    作成日時: "created_at" in item.healthScore ? item.healthScore.created_at : new Date().toISOString(),
  }));

  // ワークブックを作成
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Health Scores");

  // 列幅を調整
  worksheet["!cols"] = [
    { wch: 10 }, // 企業ID
    { wch: 30 }, // 企業名
    { wch: 15 }, // 月額契約額
    { wch: 10 }, // スコア
    { wch: 15 }, // ステータス
    { wch: 15 }, // 期間
    { wch: 20 }, // 作成日時
  ];

  // ファイルをダウンロード
  XLSX.writeFile(workbook, filename);
}

