import * as XLSX from "xlsx";

export interface ParsedRow {
  tenantId?: number;
  companyName?: string;
  periodDate?: string;
  loginCount?: number;
  estCount?: number;
  constCount?: number;
  activeRate?: number;
  [key: string]: any;
}

/**
 * Excel/CSVファイルをパースして、利用ログデータを抽出
 * @param file ファイル
 * @param periodType 期間タイプ（'weekly' | 'monthly'）- ヘッダー名のマッピングに使用
 */
export function parseExcelFile(file: File, periodType?: "weekly" | "monthly"): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("ファイルの読み込みに失敗しました"));
          return;
        }

        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // シートをJSONに変換（ヘッダー行を明示的に指定）
        // header: 1 は最初の行をヘッダーとして使用
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1, // 最初の行をヘッダーとして使用
          defval: "", // 空セルのデフォルト値
        });

        // ヘッダー行を取得（最初の行）
        const headerRow = jsonData[0] as any[];
        if (!headerRow || headerRow.length === 0) {
          reject(new Error("ヘッダー行が見つかりません"));
          return;
        }

        // ヘッダー名を正規化（空白を除去、統一）
        const normalizedHeaders = headerRow.map((h: any) => 
          String(h || "").trim()
        );

        // デバッグ: 検出されたヘッダー名を表示
        if (typeof window !== "undefined") {
          console.log("📋 検出されたヘッダー名（生データ）:", normalizedHeaders);
        }

        // データ行をオブジェクトに変換（2行目以降）
        const dataRows: any[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;
          
          const rowObj: any = {};
          normalizedHeaders.forEach((header, index) => {
            if (header) {
              rowObj[header] = row[index] !== undefined ? row[index] : "";
            }
          });
          dataRows.push(rowObj);
        }

        // デバッグ: 変換後のデータを表示
        if (typeof window !== "undefined" && dataRows.length > 0) {
          console.log("📋 変換後のヘッダー名:", Object.keys(dataRows[0]));
          console.log("📋 最初の行のデータ:", dataRows[0]);
        }

        // ヘッダー名のマッピング（柔軟に対応）
        const mappedData: ParsedRow[] = dataRows.map((row: any) => {
          const mapped: ParsedRow = {};

          // テナントIDのマッピング（id を優先）
          const tenantIdValue = findValueByKeyPattern(
            row,
            ["id", "ID", "テナントID", "tenant_id", "tenantId", "企業ID", "テナントid"]
          );
          mapped.tenantId = tenantIdValue !== undefined ? Number(tenantIdValue) : undefined;

          // 企業名のマッピング（文字列フィールドなので専用の関数を使用）
          mapped.companyName = findStringValueByKeyPattern(
            row,
            ["テナント名", "企業名", "company_name", "companyName", "name", "会社名", "テナント名", "テナント"]
          );

          // 期間日のマッピング
          const periodDateValue = findValueByKeyPattern(
            row,
            ["期間", "period_date", "periodDate", "日付", "date", "Date"]
          );
          mapped.periodDate = periodDateValue !== undefined ? String(periodDateValue) : undefined;

          // ログイン回数のマッピング（期間タイプに応じて優先順位を変更）
          const loginPatterns = periodType === "weekly" 
            ? [
                "週間ログイン回数", // 最優先
                "週間ログイン",
                "週間ログ",
                "週間ログイ", // ユーザー提供のヘッダー名
                "ログイン回数",
                "ログイン数",
                "ログイン",
                "ログイン回",
                "前週ログイン",
                "月間ログイン回数",
                "月間ログイン",
                "月間ログ",
                "前月ログイン",
                "login_count",
                "loginCount",
                "login",
                "Login",
                "ログイン回数（当週）",
                "ログイン回数（当月）",
              ]
            : [
                "月間ログイン回数", // 最優先
                "月間ログイン",
                "月間ログ",
                "月間ログイ", // ユーザー提供のヘッダー名
                "ログイン回数",
                "ログイン数",
                "ログイン",
                "ログイン回",
                "前月ログイン",
                "週間ログイン回数",
                "週間ログイン",
                "週間ログ",
                "前週ログイン",
                "login_count",
                "loginCount",
                "login",
                "Login",
                "ログイン回数（当月）",
                "ログイン回数（当週）",
              ];
          const loginValue = findValueByKeyPattern(row, loginPatterns);
          mapped.loginCount = loginValue !== undefined ? Number(loginValue) || 0 : 0;

          // 見積作成数のマッピング（期間タイプに応じて優先順位を変更）
          const estPatterns = periodType === "weekly"
            ? [
                "週間見積書作成数", // 最優先
                "週間見積書",
                "週間見積",
                "見積書", // ユーザー提供のヘッダー名（短縮形）
                "見積作成数",
                "見積数",
                "見積",
                "見積作成",
                "前週見積",
                "月間見積書作成数",
                "月間見積書",
                "月間見積",
                "前月見積",
                "est_count",
                "estCount",
                "estimate",
                "Estimate",
                "見積作成数（当週）",
                "見積作成数（当月）",
              ]
            : [
                "月間見積書作成数", // 最優先
                "月間見積書",
                "月間見積",
                "見積書", // ユーザー提供のヘッダー名（短縮形）
                "見積作成数",
                "見積数",
                "見積",
                "見積作成",
                "前月見積",
                "週間見積書作成数",
                "週間見積書",
                "週間見積",
                "前週見積",
                "est_count",
                "estCount",
                "estimate",
                "Estimate",
                "見積作成数（当月）",
                "見積作成数（当週）",
              ];
          const estValue = findValueByKeyPattern(row, estPatterns);
          mapped.estCount = estValue !== undefined ? Number(estValue) || 0 : 0;

          // 工事登録数のマッピング（期間タイプに応じて優先順位を変更）
          const constPatterns = periodType === "weekly"
            ? [
                "週間工事登録数", // 最優先
                "週間工事",
                "工事", // ユーザー提供のヘッダー名（短縮形）
                "工事登録数",
                "工事数",
                "工事登録",
                "前週工事",
                "月間工事登録数",
                "月間工事",
                "前月工事",
                "const_count",
                "constCount",
                "construction",
                "Construction",
                "工事登録数（当週）",
                "工事登録数（当月）",
              ]
            : [
                "月間工事登録数", // 最優先
                "月間工事",
                "工事", // ユーザー提供のヘッダー名（短縮形）
                "工事登録数",
                "工事数",
                "工事登録",
                "前月工事",
                "週間工事登録数",
                "週間工事",
                "前週工事",
                "const_count",
                "constCount",
                "construction",
                "Construction",
                "工事登録数（当月）",
                "工事登録数（当週）",
              ];
          const constValue = findValueByKeyPattern(row, constPatterns);
          mapped.constCount = constValue !== undefined ? Number(constValue) || 0 : 0;

          // Active率のマッピング
          const activeRateValue = findValueByKeyPattern(
            row,
            [
              "Active率",
              "active_rate",
              "activeRate",
              "Active",
              "active",
              "アクティブ率",
            ]
          );
          mapped.activeRate = activeRateValue !== undefined ? Number(activeRateValue) || 0 : 0;

          // 元のデータも保持（デバッグ用）
          Object.assign(mapped, { _original: row });

          // デバッグ: マッピング結果を表示（開発環境のみ）
          if (typeof window !== "undefined" && dataRows.indexOf(row) === 0) {
            console.log("🔍 マッピング結果（最初の行）:", {
              tenantId: mapped.tenantId,
              companyName: mapped.companyName,
              loginCount: mapped.loginCount,
              estCount: mapped.estCount,
              constCount: mapped.constCount,
              activeRate: mapped.activeRate,
            });
            
            // 企業名のマッピングが失敗した場合の詳細情報
            if (!mapped.companyName) {
              console.warn("⚠️ 企業名のマッピング失敗");
              console.warn("   利用可能なヘッダー名:", Object.keys(row));
              console.warn("   期待されるヘッダー名: テナント名, 企業名, 会社名");
              // テナント名に関連する可能性のあるヘッダーを探す
              const nameRelatedHeaders = Object.keys(row).filter(h => 
                h.includes("名") || h.includes("テナント") || h.includes("企業") || h.includes("会社")
              );
              if (nameRelatedHeaders.length > 0) {
                console.warn("   💡 企業名に関連する可能性のあるヘッダー:", nameRelatedHeaders);
              }
            }
            
            // マッピングが失敗した場合の詳細情報
            if (!mapped.loginCount && !mapped.estCount && !mapped.constCount) {
              console.warn("⚠️ マッピング失敗: 利用データが見つかりませんでした");
              console.warn("   利用可能なヘッダー名:", Object.keys(row));
              console.warn("   期待されるヘッダー名: 週間ログイン回数, 週間見積書作成数, 週間工事登録数");
            }
          }

          return mapped;
        });

        resolve(mappedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("ファイルの読み込みに失敗しました"));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * キーのパターンリストから値を検索
 */
function findValueByKeyPattern(
  row: any,
  patterns: string[]
): string | number | undefined {
  // まず完全一致を試す
  for (const pattern of patterns) {
    if (row[pattern] !== undefined) {
      return convertToNumberIfPossible(row[pattern]);
    }
  }

  // 大文字小文字を無視した完全一致
  for (const pattern of patterns) {
    const lowerPattern = pattern.toLowerCase();
    for (const key in row) {
      if (key.toLowerCase() === lowerPattern) {
        return convertToNumberIfPossible(row[key]);
      }
    }
  }

  // 部分一致を試す（より柔軟なマッピング）
  for (const pattern of patterns) {
    const lowerPattern = pattern.toLowerCase().replace(/\s+/g, ""); // スペースを除去
    for (const key in row) {
      const lowerKey = key.toLowerCase().replace(/\s+/g, "");
      
      // パターンがキーに含まれる、またはキーがパターンに含まれる
      if (
        lowerKey.includes(lowerPattern) ||
        lowerPattern.includes(lowerKey)
      ) {
        // より確実なマッチングのため、キーワードを抽出して比較
        const patternKeywords = extractKeywords(lowerPattern);
        const keyKeywords = extractKeywords(lowerKey);
        
        // キーワードが一致する場合、またはパターンの主要キーワードがキーに含まれる場合
        const hasMatchingKeywords = patternKeywords.some(pk => 
          keyKeywords.some(kk => kk.includes(pk) || pk.includes(kk))
        ) || patternKeywords.some(pk => lowerKey.includes(pk));
        
        if (hasMatchingKeywords) {
          // 短すぎるキーは除外（誤検出を防ぐ）
          // ただし、「ログ」「見積」「工事」などの主要キーワードがある場合は許可
          const hasImportantKeyword = 
            lowerPattern.includes("ログ") || lowerKey.includes("ログ") ||
            lowerPattern.includes("見積") || lowerKey.includes("見積") ||
            lowerPattern.includes("工事") || lowerKey.includes("工事");
          
          if (
            hasImportantKeyword ||
            (lowerPattern.length >= 3 && lowerKey.length >= 3)
          ) {
            return convertToNumberIfPossible(row[key]);
          }
        }
      }
    }
  }

  return undefined;
}

/**
 * 文字列フィールド用のキーパターン検索（企業名など）
 */
function findStringValueByKeyPattern(
  row: any,
  patterns: string[]
): string | undefined {
  // まず完全一致を試す
  for (const pattern of patterns) {
    if (row[pattern] !== undefined && row[pattern] !== null && row[pattern] !== "") {
      const value = String(row[pattern]).trim();
      if (value) {
        return value;
      }
    }
  }

  // 大文字小文字を無視した完全一致
  for (const pattern of patterns) {
    const lowerPattern = pattern.toLowerCase();
    for (const key in row) {
      if (key.toLowerCase() === lowerPattern) {
        const value = String(row[key] || "").trim();
        if (value) {
          return value;
        }
      }
    }
  }

  // 部分一致を試す（企業名などは柔軟にマッチング）
  for (const pattern of patterns) {
    const lowerPattern = pattern.toLowerCase().replace(/\s+/g, "");
    for (const key in row) {
      const lowerKey = key.toLowerCase().replace(/\s+/g, "");
      
      // パターンがキーに含まれる、またはキーがパターンに含まれる
      if (
        lowerKey.includes(lowerPattern) ||
        lowerPattern.includes(lowerKey)
      ) {
        const value = String(row[key] || "").trim();
        if (value) {
          return value;
        }
      }
    }
  }

  return undefined;
}

/**
 * キーワードを抽出（日本語と英語の主要な単語を抽出）
 */
function extractKeywords(text: string): string[] {
  // 日本語の主要キーワード
  const japaneseKeywords = ["ログ", "見積", "工事", "週間", "月間", "回数", "作成", "登録"];
  // 英語の主要キーワード
  const englishKeywords = ["login", "estimate", "construction", "weekly", "monthly", "count"];
  
  const keywords: string[] = [];
  
  // 日本語キーワードを検索
  japaneseKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  // 英語キーワードを検索
  englishKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  return keywords;
}

/**
 * 数値に変換可能な場合は数値に変換
 * 空白セルは0として扱う
 */
function convertToNumberIfPossible(value: any): string | number | undefined {
  // 空白セルは0として扱う
  if (value === undefined || value === null || value === "" || value === " ") {
    return 0;
  }

  if (typeof value === "number") {
    // NaNの場合は0を返す
    if (isNaN(value)) {
      return 0;
    }
    return value;
  }

  if (typeof value === "string") {
    // 空白文字列は0として扱う
    const trimmed = value.trim();
    if (trimmed === "" || trimmed === "-" || trimmed === "—") {
      return 0;
    }

    // 日付形式の場合はそのまま返す
    if (trimmed.match(/^\d{4}-\d{2}-\d{2}/)) {
      return trimmed;
    }

    // 数値に変換を試みる
    const num = parseFloat(trimmed.replace(/,/g, ""));
    if (!isNaN(num)) {
      return num;
    }
    
    // 変換できない場合は0を返す（数値フィールドの場合）
    return 0;
  }

  return value;
}

/**
 * パースされたデータのバリデーション
 */
export function validateParsedData(data: ParsedRow[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  data.forEach((row, index) => {
    if (!row.tenantId && !row.companyName) {
      errors.push(`行 ${index + 2}: テナントIDまたは企業名が必要です`);
    }

    // 空白セルは0として扱うため、このチェックは削除
    // ただし、すべてが0の場合でもデータとして有効とする
    // if (row.loginCount === undefined && row.estCount === undefined && row.constCount === undefined) {
    //   errors.push(`行 ${index + 2}: 利用データ（ログイン、見積、工事のいずれか）が必要です`);
    // }

    if (row.loginCount !== undefined && (isNaN(Number(row.loginCount)) || Number(row.loginCount) < 0)) {
      errors.push(`行 ${index + 2}: ログイン回数が無効です`);
    }

    if (row.estCount !== undefined && (isNaN(Number(row.estCount)) || Number(row.estCount) < 0)) {
      errors.push(`行 ${index + 2}: 見積作成数が無効です`);
    }

    if (row.constCount !== undefined && (isNaN(Number(row.constCount)) || Number(row.constCount) < 0)) {
      errors.push(`行 ${index + 2}: 工事登録数が無効です`);
    }

    if (row.activeRate !== undefined && (isNaN(Number(row.activeRate)) || Number(row.activeRate) < 0 || Number(row.activeRate) > 100)) {
      errors.push(`行 ${index + 2}: Active率が無効です（0-100の範囲）`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

