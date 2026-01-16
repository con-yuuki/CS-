/**
 * Active率の計算ロジック（学習期間方式）
 */

export interface FeatureUsage {
  [featureName: string]: boolean;
}

export interface AvailableFeatures {
  features: string[];
}

export interface UsedFeatures {
  features: string[];
  learning_period_end: string | null;
  last_updated: string | null;
}

/**
 * 利用可能な機能のリスト（デフォルト）
 */
export const DEFAULT_FEATURES = [
  "ログイン",
  "見積作成",
  "工事登録",
  "顧客登録",
  "業者登録",
  "請求書作成",
  "商品発注書作成",
  "外注発注書作成",
  "現場連絡表作成",
  "実行予算作成",
  "書類メール送信",
  "資料登録",
  "写真登録",
  "工程表作成",
  "タスク登録",
  "日報登録",
];

/**
 * 機能名と利用ログのカラム名のマッピング
 */
export const FEATURE_COLUMN_MAP: Record<string, string> = {
  "ログイン": "ログイン回数",
  "見積作成": "見積作成数",
  "工事登録": "工事登録数",
  "顧客登録": "顧客登録数",
  "業者登録": "業者登録数",
  "請求書作成": "請求書作成数",
  "商品発注書作成": "商品発注書作成数",
  "外注発注書作成": "外注発注書作成数",
  "現場連絡表作成": "現場連絡表作成数",
  "実行予算作成": "実行予算作成数",
  "書類メール送信": "書類メール送信数",
  "資料登録": "資料登録数",
  "写真登録": "写真登録数",
  "工程表作成": "工程表作成数",
  "タスク登録": "タスク登録数",
  "日報登録": "日報登録数",
};

/**
 * 利用ログから各機能の利用状況を自動判定
 */
export function calculateFeatureUsageFromLog(
  usageLog: any,
  availableFeatures: string[] = DEFAULT_FEATURES
): FeatureUsage {
  const featureUsage: FeatureUsage = {};

  for (const feature of availableFeatures) {
    const columnName = FEATURE_COLUMN_MAP[feature];
    if (columnName) {
      // カラム名から値を取得
      const value = usageLog[columnName];
      // 数値が0より大きい場合は使用したと判定
      featureUsage[feature] = Number(value || 0) > 0;
    } else {
      // マッピングがない場合はfalse
      featureUsage[feature] = false;
    }
  }

  return featureUsage;
}

/**
 * 利用ログから各機能の利用回数を取得
 */
export function getFeatureUsageCounts(
  usageLog: any,
  availableFeatures: string[] = DEFAULT_FEATURES
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const feature of availableFeatures) {
    const columnName = FEATURE_COLUMN_MAP[feature];
    if (columnName) {
      // カラム名から値を取得
      const value = usageLog[columnName];
      counts[feature] = Number(value || 0);
    } else {
      counts[feature] = 0;
    }
  }

  return counts;
}

/**
 * 機能利用状況からActive率を計算
 */
export function calculateActiveRate(
  featureUsage: FeatureUsage,
  availableFeatures: string[] = DEFAULT_FEATURES
): number {
  if (availableFeatures.length === 0) {
    return 0;
  }

  // 利用可能な機能のうち、実際に使用した機能の数をカウント
  const usedFeaturesCount = availableFeatures.filter(
    (feature) => featureUsage[feature] === true
  ).length;

  // Active率を計算（0-100の範囲）
  const activeRate = (usedFeaturesCount / availableFeatures.length) * 100;

  return Math.round(activeRate * 10) / 10; // 小数点第1位まで
}

/**
 * 利用可能機能リストを取得（企業マスタから、またはデフォルト）
 */
export function getAvailableFeatures(
  companyAvailableFeatures: AvailableFeatures | null | undefined
): string[] {
  if (
    companyAvailableFeatures &&
    companyAvailableFeatures.features &&
    companyAvailableFeatures.features.length > 0
  ) {
    return companyAvailableFeatures.features;
  }
  return DEFAULT_FEATURES;
}

/**
 * 利用可能機能リストを文字列からパース
 */
export function parseAvailableFeaturesFromString(
  featuresString: string
): string[] {
  if (!featuresString || featuresString.trim() === "") {
    return DEFAULT_FEATURES;
  }

  // カンマ区切りで分割
  const features = featuresString
    .split(",")
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

  return features.length > 0 ? features : DEFAULT_FEATURES;
}

/**
 * 使用機能リストを文字列からパース
 */
export function parseUsedFeaturesFromString(
  usedFeaturesString: string
): string[] {
  if (!usedFeaturesString || usedFeaturesString.trim() === "") {
    return [];
  }

  // カンマ区切りで分割
  const features = usedFeaturesString
    .split(",")
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

  return features;
}

/**
 * 使用機能リストからFeatureUsageオブジェクトを生成
 */
export function createFeatureUsageFromUsedFeatures(
  usedFeatures: string[],
  availableFeatures: string[] = DEFAULT_FEATURES
): FeatureUsage {
  const featureUsage: FeatureUsage = {};

  for (const feature of availableFeatures) {
    featureUsage[feature] = usedFeatures.includes(feature);
  }

  return featureUsage;
}

/**
 * 利用開始日から3ヶ月後の日付を計算
 */
export function calculateLearningPeriodEnd(startDate: Date): Date {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 3);
  return endDate;
}

/**
 * 現在が学習期間中かどうかを判定
 */
export function isInLearningPeriod(
  startDate: Date | null,
  currentDate: Date = new Date()
): boolean {
  if (!startDate) {
    return false;
  }

  const learningPeriodEnd = calculateLearningPeriodEnd(startDate);
  return currentDate < learningPeriodEnd;
}

/**
 * 学習期間中の利用ログから利用する機能を抽出
 */
export function extractUsedFeaturesFromLearningPeriod(
  usageLogs: any[]
): string[] {
  const featureUsageMap: Record<string, boolean> = {};

  // すべての機能を初期化
  for (const feature of DEFAULT_FEATURES) {
    featureUsageMap[feature] = false;
  }

  // 学習期間中の利用ログを分析
  for (const log of usageLogs) {
    for (const feature of DEFAULT_FEATURES) {
      const columnName = FEATURE_COLUMN_MAP[feature];
      if (columnName) {
        const value = log[columnName];
        // 1回以上使用されていれば、その機能を使用したと判定
        if (Number(value || 0) > 0) {
          featureUsageMap[feature] = true;
        }
      }
    }
  }

  // 使用された機能のリストを返す
  return DEFAULT_FEATURES.filter((feature) => featureUsageMap[feature]);
}

/**
 * 利用する機能リストに基づいてActive率を計算（合計100%になる方式）
 */
export function calculateActiveRateFromUsedFeatures(
  featureUsage: FeatureUsage,
  usedFeatures: string[] = DEFAULT_FEATURES,
  usageLog?: any
): number {
  if (usedFeatures.length === 0) {
    return 0;
  }

  // 利用回数ベースで計算する場合
  if (usageLog) {
    const usageCounts = getFeatureUsageCounts(usageLog, usedFeatures);
    
    // 利用する機能の利用回数の合計を計算
    const totalUsage = usedFeatures.reduce(
      (sum, feature) => sum + (usageCounts[feature] || 0),
      0
    );

    if (totalUsage === 0) {
      return 0;
    }

    // 各機能の利用回数をパーセンテージに変換（合計100%になるように正規化）
    // ただし、Active率は単一の値として返すため、使用した機能の割合を計算
    // または、利用回数の重み付き平均を使用
    
    // 方法1: 使用した機能の割合（従来の方法）
    const usedCount = usedFeatures.filter(
      (feature) => featureUsage[feature] === true
    ).length;
    const activeRate = (usedCount / usedFeatures.length) * 100;
    
    return Math.round(activeRate * 10) / 10; // 小数点第1位まで
  }

  // 利用する機能のうち、実際に使用した機能の数をカウント
  const usedCount = usedFeatures.filter(
    (feature) => featureUsage[feature] === true
  ).length;

  // Active率を計算（0-100の範囲）
  const activeRate = (usedCount / usedFeatures.length) * 100;

  return Math.round(activeRate * 10) / 10; // 小数点第1位まで
}

/**
 * 利用ログから各機能のActive率を計算（合計100%になる方式）
 * 各機能の利用回数を正規化して、合計が100%になるようにする
 */
export function calculateFeatureActiveRates(
  usageLog: any,
  usedFeatures: string[] = DEFAULT_FEATURES
): Record<string, number> {
  const usageCounts = getFeatureUsageCounts(usageLog, usedFeatures);
  
  // 利用する機能の利用回数の合計を計算
  const totalUsage = usedFeatures.reduce(
    (sum, feature) => sum + (usageCounts[feature] || 0),
    0
  );

  const rates: Record<string, number> = {};

  if (totalUsage === 0) {
    // 利用回数が0の場合、すべて0%を返す
    for (const feature of usedFeatures) {
      rates[feature] = 0;
    }
    return rates;
  }

  // 各機能の利用回数をパーセンテージに変換（割り算の結果をそのまま保持、丸め補正なし）
  for (const feature of usedFeatures) {
    const count = usageCounts[feature] || 0;
    // 割り算の結果をそのまま保持（小数点以下も含む）
    rates[feature] = (count / totalUsage) * 100;
  }

  return rates;
}

/**
 * 機能別Active率の合計を計算
 */
export function calculateTotalActiveRate(
  featureActiveRates: Record<string, number>
): number {
  return Object.values(featureActiveRates).reduce((sum, rate) => sum + rate, 0);
}

/**
 * 利用する機能リストを取得（企業マスタから、またはデフォルト）
 */
export function getUsedFeatures(
  companyUsedFeatures: UsedFeatures | null | undefined
): string[] {
  if (
    companyUsedFeatures &&
    companyUsedFeatures.features &&
    companyUsedFeatures.features.length > 0
  ) {
    return companyUsedFeatures.features;
  }
  return DEFAULT_FEATURES;
}

