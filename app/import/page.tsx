"use client";

import { useState, useCallback } from "react";
import { format, isValid, parseISO, subDays, subMonths } from "date-fns";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseExcelFile, validateParsedData, type ParsedRow } from "@/lib/utils/excel-parser";
import { getCompanyById } from "@/lib/services/company-service";
import { Database } from "@/lib/supabase/database.types";

type Company = Database["public"]["Tables"]["ユーザー基礎情報"]["Row"];
import { upsertUsageLog } from "@/lib/services/usage-log-service";
import { calculateAndSaveHealthScore } from "@/lib/services/health-score-service";
import Link from "next/link";
import { Upload, FileCheck, AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react";

export default function ImportPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<{
    success: boolean;
    message: string;
    details?: string[];
    unregisteredCompanies?: Array<{
      tenantId?: number | string;
      companyName?: string;
      rowNumber: number;
      fileName?: string;
    }>;
  } | null>(null);
  const [periodType, setPeriodType] = useState<"weekly" | "monthly">("monthly");
  const [periodDate, setPeriodDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [detectedHeaders, setDetectedHeaders] = useState<
    Array<{ fileName: string; headers: string[] }>
  >([]);

  const extractDateFromFileName = (fileName?: string) => {
    if (!fileName) return undefined;
    const fullMatch = fileName.match(
      /(20\d{2})[.\-_/]?(0[1-9]|1[0-2])[.\-_/]?(0[1-9]|[12]\d|3[01])/
    );
    if (fullMatch) {
      const [, year, month, day] = fullMatch;
      return `${year}-${month}-${day}`;
    }
    const monthMatch = fileName.match(/(20\d{2})[.\-_/]?(0[1-9]|1[0-2])/);
    if (!monthMatch) return undefined;
    const [, year, month] = monthMatch;
    return `${year}-${month}-01`;
  };

  const detectPeriodTypeFromFileName = (fileName?: string) => {
    if (!fileName) return undefined;
    const lower = fileName.toLowerCase();
    if (lower.includes("monthly")) return "monthly" as const;
    if (lower.includes("weekly")) return "weekly" as const;
    return undefined;
  };

  const normalizePeriodDate = (value?: string) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) return trimmed.replaceAll("/", "-");
    if (/^\d{4}-\d{2}$/.test(trimmed)) return `${trimmed}-01`;
    if (/^\d{4}\/\d{2}$/.test(trimmed)) return `${trimmed.replaceAll("/", "-")}-01`;
    if (/^\d{6}$/.test(trimmed)) return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 6)}-01`;
    if (/^\d{8}$/.test(trimmed)) {
      return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 6)}-${trimmed.slice(6, 8)}`;
    }
    return trimmed;
  };

  const normalizeMonthlyDate = (value: string) => {
    const normalized = normalizePeriodDate(value) ?? value;
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return `${normalized.slice(0, 7)}-01`;
    }
    if (/^\d{4}-\d{2}$/.test(normalized)) {
      return `${normalized}-01`;
    }
    return normalized;
  };

  const shiftFileDateToPreviousMonth = (value?: string) => {
    if (!value) return value;
    const parsed = parseISO(value);
    if (!isValid(parsed)) return value;
    return format(subMonths(parsed, 1), "yyyy-MM-dd");
  };

  const shiftFileDateToPreviousWeek = (value?: string) => {
    if (!value) return value;
    const parsed = parseISO(value);
    if (!isValid(parsed)) return value;
    return format(subDays(parsed, 7), "yyyy-MM-dd");
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setFiles(acceptedFiles);
    setValidationErrors([]);
    setProcessResult(null);
    setDetectedHeaders([]);

    const allData: ParsedRow[] = [];
    const allHeaders: Array<{ fileName: string; headers: string[] }> = [];
    const allErrors: string[] = [];

    for (const selectedFile of acceptedFiles) {
      try {
        const data = await parseExcelFile(selectedFile, periodType);

        const enriched = data.map((row, index) => ({
          ...row,
          _sourceFile: selectedFile.name,
          _sourceRowNumber: index + 2,
        }));
        allData.push(...enriched);

        if (data.length > 0) {
          const headers = Object.keys(data[0]).filter((key) => !key.startsWith("_"));
          allHeaders.push({ fileName: selectedFile.name, headers });
        }

        const validation = validateParsedData(data);
        if (!validation.valid) {
          validation.errors.forEach((error) => {
            allErrors.push(`${selectedFile.name}: ${error}`);
          });
        }
      } catch (error) {
        allErrors.push(
          `${selectedFile.name}: ファイルの読み込みに失敗しました: ${
            error instanceof Error ? error.message : "不明なエラー"
          }`
        );
      }
    }

    setParsedData(allData);
    setDetectedHeaders(allHeaders);
    setValidationErrors(allErrors);
  }, [periodType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    multiple: true,
  });

  const handleImport = async () => {
    if (parsedData.length === 0 || validationErrors.length > 0) {
      return;
    }

    setIsProcessing(true);
    setProcessResult(null);

    const results: string[] = [];
    let successCount = 0;
    let errorCount = 0;
    const unregisteredCompanies: Array<{
      tenantId?: number | string;
      companyName?: string;
      rowNumber: number;
      fileName?: string;
    }> = [];

    try {
      for (const row of parsedData) {
        const sourceFile = row._sourceFile as string | undefined;
        const sourceRowNumber = row._sourceRowNumber as number | undefined;
        const rowNumber = sourceRowNumber ?? parsedData.indexOf(row) + 2; // Excelの行番号（ヘッダー行を考慮）
        const rawFileDate = extractDateFromFileName(sourceFile);
        const filePeriodType = detectPeriodTypeFromFileName(sourceFile);
        const fileDate =
          filePeriodType === "weekly"
            ? shiftFileDateToPreviousWeek(rawFileDate)
            : shiftFileDateToPreviousMonth(rawFileDate);
        const normalizedRowDate = normalizePeriodDate(row.periodDate ? String(row.periodDate) : undefined);
        let effectivePeriodDate = filePeriodType
          ? fileDate || normalizedRowDate || periodDate
          : normalizedRowDate || fileDate || periodDate;
        const effectivePeriodType = filePeriodType || periodType;

        if (effectivePeriodType === "monthly") {
          effectivePeriodDate = normalizeMonthlyDate(effectivePeriodDate);
        }
        
        try {
          // 登録済み企業のみでデータを反映（新規作成は行わない）
          if (!row.tenantId) {
            // テナントIDが指定されていない場合は未登録企業リストに追加してスキップ
            unregisteredCompanies.push({
              tenantId: undefined,
              companyName: row.companyName,
              rowNumber,
              fileName: sourceFile,
            });
            results.push(
              `⚠ 行 ${rowNumber}${sourceFile ? ` (${sourceFile})` : ""}: テナントIDが指定されていません (企業名: ${
                row.companyName || "不明"
              })`
            );
            continue;
          }

          // テナントIDが指定されている場合、そのIDが存在するか確認
          let companyId: number;
          let company: Company | null = null;
          try {
            const tenantIdNum = Number(row.tenantId);
            if (isNaN(tenantIdNum)) {
              throw new Error(`テナントIDが数値ではありません: ${row.tenantId}`);
            }
            
            console.log(`🔍 行 ${rowNumber}: テナントID ${tenantIdNum} の企業を検索中...`);
            const fetchedCompany: Company = await getCompanyById(tenantIdNum);
            
            if (!fetchedCompany) {
              throw new Error(`企業が見つかりませんでした`);
            }
            
            company = fetchedCompany;
            companyId = fetchedCompany.id;
            console.log(`✅ 行 ${rowNumber}: 企業が見つかりました - ID: ${companyId}, 名前: ${company.name || "不明"}`);
          } catch (error) {
            // エラーの詳細をログに出力
            console.error(`❌ 行 ${rowNumber}: 企業検索エラー`, {
              tenantId: row.tenantId,
              tenantIdType: typeof row.tenantId,
              error: error instanceof Error ? error.message : String(error),
            });
            
            // 企業が存在しない場合は未登録企業リストに追加してスキップ
            unregisteredCompanies.push({
              tenantId: row.tenantId,
              companyName: row.companyName,
              rowNumber,
              fileName: sourceFile,
            });
            const errorMsg = error instanceof Error ? error.message : "不明なエラー";
            results.push(
              `⚠ 行 ${rowNumber}${sourceFile ? ` (${sourceFile})` : ""}: テナントID ${
                row.tenantId
              } は登録されていません (企業名: ${row.companyName || "不明"}) - ${errorMsg}`
            );
            continue;
          }

          // 利用ログの作成または更新（数値型を確実に変換）
          try {
            console.log(`📝 行 ${rowNumber}: 利用ログを保存中... (テナントID: ${companyId})`);
            await upsertUsageLog({
              tenant_id: companyId,
              period_type: effectivePeriodType,
              period_date: effectivePeriodDate,
              login_count: Number(row.loginCount) || 0,
              est_count: Number(row.estCount) || 0,
              const_count: Number(row.constCount) || 0,
              active_rate: Number(row.activeRate) || 0,
              raw_data: row,
              companyName: row.companyName || (company ? company.name : undefined) || undefined,
            });
            console.log(`✅ 行 ${rowNumber}: 利用ログを保存しました`);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "不明なエラー";
            const errorCode = error instanceof Error && 'code' in error ? (error as any).code : undefined;
            console.error(`❌ 行 ${rowNumber}: 利用ログの保存に失敗`, {
              tenantId: companyId,
              error: errorMsg,
              errorCode: errorCode,
              errorDetails: error,
            });
            
            // 406エラー（Not Acceptable）の場合は、日本語カラム名の問題の可能性がある
            if (errorCode === 'PGRST204' || errorMsg.includes('406') || errorMsg.includes('Not Acceptable')) {
              console.warn(`⚠️ 行 ${rowNumber}: usage_logsテーブルへのアクセスが拒否されました。日本語カラム名の問題の可能性があります。`);
              // この場合は警告として記録するが、処理は続行
              results.push(
                `⚠ 行 ${rowNumber}${sourceFile ? ` (${sourceFile})` : ""}: 利用ログの保存に失敗しました（テーブルアクセスエラー）。データは保存されませんでした。`
              );
              // 利用ログの保存に失敗した場合は、ヘルススコアの計算もスキップ
              continue;
            }
            
            throw new Error(`利用ログの保存に失敗: ${errorMsg}`);
          }

          // ヘルススコアの計算と保存
          try {
            console.log(`📊 行 ${rowNumber}: ヘルススコアを計算中... (テナントID: ${companyId})`);
            await calculateAndSaveHealthScore(companyId, effectivePeriodType, effectivePeriodDate);
            console.log(`✅ 行 ${rowNumber}: ヘルススコアを保存しました`);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "不明なエラー";
            console.error(`❌ 行 ${rowNumber}: ヘルススコアの計算・保存に失敗`, {
              tenantId: companyId,
              error: errorMsg,
              errorDetails: error,
            });
            // ヘルススコアのエラーは警告として記録するが、処理は続行
            results.push(
              `⚠ 行 ${rowNumber}${sourceFile ? ` (${sourceFile})` : ""}: ヘルススコアの計算に失敗しました (${errorMsg})`
            );
          }

          successCount++;
          results.push(
            `✓ 行 ${rowNumber}${sourceFile ? ` (${sourceFile})` : ""}: テナントID ${companyId} のデータをインポートしました`
          );
        } catch (error) {
          errorCount++;
          const errorMsg = error instanceof Error ? error.message : "不明なエラー";
          const errorStack = error instanceof Error ? error.stack : undefined;
          console.error(`❌ 行 ${rowNumber} のエラー:`, {
            error: errorMsg,
            stack: errorStack,
            fullError: error,
          });
          results.push(
            `✗ 行 ${rowNumber}${sourceFile ? ` (${sourceFile})` : ""}: ${errorMsg}`
          );
        }
      }

      setProcessResult({
        success: errorCount === 0,
        message: `${successCount}件のデータをインポートしました${errorCount > 0 ? `（エラー: ${errorCount}件）` : ""}${unregisteredCompanies.length > 0 ? `（未登録企業: ${unregisteredCompanies.length}件）` : ""}`,
        details: results,
        unregisteredCompanies: unregisteredCompanies.length > 0 ? unregisteredCompanies : undefined,
      });

      // 成功時はデータをクリア
      if (errorCount === 0) {
        setFiles([]);
        setParsedData([]);
        setDetectedHeaders([]);
      }
    } catch (error) {
      setProcessResult({
        success: false,
        message: `インポート中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost">← ホームに戻る</Button>
        </Link>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>データインポート</CardTitle>
          <CardDescription>
            Excel/CSVファイルをドラッグ&ドロップして、利用ログデータをインポートします（複数ファイル対応）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 期間設定 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">期間タイプ</label>
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as "weekly" | "monthly")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="weekly">週次</option>
                <option value="monthly">月次</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                ファイル名に <span className="font-semibold">monthly</span> / <span className="font-semibold">weekly</span> を含む場合は自動判定されます。
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">期間日</label>
              <input
                type="date"
                value={periodDate}
                onChange={(e) => setPeriodDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* ファイルドロップゾーン */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {files.length > 0 ? (
              <div>
                <FileCheck className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm font-medium">{files.length}件のファイルを選択中</p>
                <ul className="mt-2 space-y-1 text-xs text-gray-500">
                  {files.map((selectedFile) => (
                    <li key={selectedFile.name}>
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  ファイルをドラッグ&ドロップするか、クリックして選択
                </p>
                <p className="text-xs text-gray-500">
                  Excel (.xlsx, .xls) または CSV (.csv) 形式
                </p>
              </div>
            )}
          </div>

          {/* 検出されたヘッダー名の表示 */}
          {detectedHeaders.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium text-blue-800">検出されたヘッダー名</h3>
              </div>
              <p className="text-sm text-blue-700 mb-2">
                ファイルごとに以下のヘッダー名が検出されました：
              </p>
              <div className="space-y-3">
                {detectedHeaders.map((item) => (
                  <div key={item.fileName}>
                    <div className="text-xs font-medium text-blue-700 mb-1">{item.fileName}</div>
                    <div className="flex flex-wrap gap-2">
                      {item.headers.map((header, index) => (
                        <span
                          key={`${item.fileName}-${index}`}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          {header}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                💡 ヒント: マッピングが失敗する場合、ヘッダー名を確認してください。
                対応しているヘッダー名の例: 「ログイン回数」「見積作成数」「工事登録数」など
              </p>
            </div>
          )}

          {/* バリデーションエラー */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h3 className="font-medium text-red-800">バリデーションエラー</h3>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
              {detectedHeaders.length > 0 && (
                <div className="mt-3 p-3 bg-red-100 rounded text-xs text-red-800">
                  <p className="font-medium mb-1">💡 解決方法:</p>
                  <p>
                    エクセルファイルのヘッダー名を以下のいずれかに変更してください：
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>ログイン回数: 「ログイン回数」「ログイン数」「login_count」など</li>
                    <li>見積作成数: 「見積作成数」「見積数」「est_count」など</li>
                    <li>工事登録数: 「工事登録数」「工事数」「const_count」など</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* パース結果 */}
          {parsedData.length > 0 && validationErrors.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h3 className="font-medium text-green-800">
                  {parsedData.length} 行のデータを読み込みました
                </h3>
              </div>
            </div>
          )}

          {/* インポートボタン */}
          <Button
            onClick={handleImport}
            disabled={parsedData.length === 0 || validationErrors.length > 0 || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                インポート中...
              </>
            ) : (
              "インポート実行"
            )}
          </Button>

          {/* 処理結果 */}
          {processResult && (
            <div className="space-y-4">
              <div
                className={`border rounded-lg p-4 ${
                  processResult.success
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {processResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <h3 className="font-medium">{processResult.message}</h3>
                </div>
                {processResult.details && (
                  <div className="mt-2 max-h-60 overflow-y-auto">
                    <ul className="text-sm space-y-1">
                      {processResult.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 未登録企業リスト */}
              {processResult.unregisteredCompanies && processResult.unregisteredCompanies.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <h3 className="font-medium text-orange-800">
                      未登録企業リスト ({processResult.unregisteredCompanies.length}件)
                    </h3>
                  </div>
                  <p className="text-sm text-orange-700 mb-3">
                    以下の企業は企業マスタに登録されていないため、データが反映されませんでした。
                    企業マスタに登録してから再度インポートしてください。
                  </p>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-orange-300">
                          <th className="text-left py-2 px-3 font-medium text-orange-800">ファイル</th>
                          <th className="text-left py-2 px-3 font-medium text-orange-800">行番号</th>
                          <th className="text-left py-2 px-3 font-medium text-orange-800">テナントID</th>
                          <th className="text-left py-2 px-3 font-medium text-orange-800">企業名</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processResult.unregisteredCompanies.map((company, index) => (
                          <tr key={index} className="border-b border-orange-200">
                            <td className="py-2 px-3 text-orange-700">
                              {company.fileName || "-"}
                            </td>
                            <td className="py-2 px-3 text-orange-700">{company.rowNumber}</td>
                            <td className="py-2 px-3 text-orange-700">
                              {company.tenantId !== undefined ? company.tenantId : "未指定"}
                            </td>
                            <td className="py-2 px-3 text-orange-700">
                              {company.companyName || "不明"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
