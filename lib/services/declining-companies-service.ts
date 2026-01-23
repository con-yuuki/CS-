import { getLatestHealthScores, getHealthScoreHistory } from "./health-score-service";
import { getCompanies } from "./company-service";
import { Database } from "@/lib/supabase/database.types";

type Company = Database["public"]["Tables"]["ユーザー基礎情報"]["Row"];
type HealthScore = Database["public"]["Tables"]["health_scores"]["Row"];

export interface DecliningCompany {
  companyId: number;
  companyName: string;
  currentScore: number;
  previousScore: number;
  drop: number;
  priority: "max" | "normal";
}

/**
 * 急落企業を検出（前期間比で20点以上減少）
 */
export async function getDecliningCompanies(
  periodType: "weekly" | "monthly" = "monthly"
): Promise<DecliningCompany[]> {
  // 最新のスコアを取得
  const latestScores: HealthScore[] = await getLatestHealthScores(periodType);
  
  // 企業データを取得
  const companies: Company[] = await getCompanies();
  const companyMap = new Map<number, Company>(companies.map((c) => [c.id, c]));

  // 各企業の最新2期間のスコアを比較
  const decliningCompanies: DecliningCompany[] = [];

  for (const latestScore of latestScores) {
    const company = companyMap.get(latestScore.tenant_id);
    if (!company) continue;

    // スコア履歴を取得
    const history: HealthScore[] = await getHealthScoreHistory(latestScore.tenant_id, periodType);
    
    // 最新とその前の期間のスコアを取得
    if (history.length >= 2) {
      const current = history[history.length - 1];
      const previous = history[history.length - 2];
      
      const drop = previous.score - current.score;
      
      // 20点以上減少している場合
      if (drop >= 20) {
        const priority =
          Number(company.mrc_ltv || 0) >= 55000 && Number(current.trend_change_pct || 0) < 0
            ? "max"
            : "normal";
        decliningCompanies.push({
          companyId: company.id,
          companyName: company.name || "不明",
          currentScore: current.score,
          previousScore: previous.score,
          drop,
          priority,
        });
      }
    }
  }

  // 減少幅が大きい順にソート
  return decliningCompanies.sort((a, b) => b.drop - a.drop);
}

