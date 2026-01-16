/**
 * 機能利用状況のヘルパー関数
 */

/**
 * ログイン以外の15機能の合計利用回数を計算
 */
export function calculateOtherFeaturesTotal(usageLog: any): number {
  // 見積作成と工事登録を除いた13機能の利用回数を合計
  const otherFeatures = [
    "顧客登録数",
    "業者登録数",
    "請求書作成数",
    "商品発注書作成数",
    "外注発注書作成数",
    "現場連絡表作成数",
    "実行予算作成数",
    "書類メール送信数",
    "資料登録数",
    "写真登録数",
    "工程表作成数",
    "タスク登録数",
    "日報登録数",
  ];

  let total = 0;
  for (const feature of otherFeatures) {
    const value = usageLog[feature];
    total += Number(value || 0);
  }

  // 見積作成と工事登録も含める（ログイン以外の15機能）
  total += Number(usageLog["見積作成数"] || 0);
  total += Number(usageLog["工事登録数"] || 0);

  return total;
}

/**
 * raw_dataから機能の利用回数を取得
 */
export function getFeatureCountFromRawData(
  rawData: any,
  featureName: string
): number {
  if (!rawData) return 0;

  // 直接キーで取得を試行
  if (rawData[featureName] !== undefined) {
    return Number(rawData[featureName]) || 0;
  }

  // 部分一致で検索
  for (const key in rawData) {
    if (key.includes(featureName) || featureName.includes(key)) {
      return Number(rawData[key]) || 0;
    }
  }

  return 0;
}

/**
 * raw_dataからログイン以外の15機能の合計利用回数を計算
 */
export function calculateOtherFeaturesTotalFromRawData(rawData: any): number {
  if (!rawData) return 0;

  const otherFeatures = [
    "顧客登録数",
    "業者登録数",
    "請求書作成数",
    "商品発注書作成数",
    "外注発注書作成数",
    "現場連絡表作成数",
    "実行予算作成数",
    "書類メール送信数",
    "資料登録数",
    "写真登録数",
    "工程表作成数",
    "タスク登録数",
    "日報登録数",
  ];

  let total = 0;
  for (const feature of otherFeatures) {
    total += getFeatureCountFromRawData(rawData, feature);
  }

  // 見積作成と工事登録も含める
  total += getFeatureCountFromRawData(rawData, "見積作成数");
  total += getFeatureCountFromRawData(rawData, "工事登録数");

  return total;
}

