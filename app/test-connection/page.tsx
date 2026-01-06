"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";

export default function TestConnectionPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    env: boolean;
    connection: boolean;
    tables: { [key: string]: boolean };
    error?: string;
  } | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResults(null);

    const newResults: {
      env: boolean;
      connection: boolean;
      tables: { [key: string]: boolean };
      error?: string;
    } = {
      env: false,
      connection: false,
      tables: {},
    };

    try {
      // 環境変数の確認
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // デバッグ情報をコンソールに出力
      console.log("🔍 環境変数の確認:", {
        supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "未設定",
        supabaseAnonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "未設定",
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
      });

      if (!supabaseUrl || !supabaseAnonKey) {
        const missingVars = [];
        if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
        if (!supabaseAnonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
        
        newResults.error = `環境変数が設定されていません: ${missingVars.join(", ")}。Vercelの環境変数を確認し、再デプロイを実行してください。`;
        setResults(newResults);
        setTesting(false);
        return;
      }

      newResults.env = true;

      // テーブルの存在確認
      const tables = ["ユーザー基礎情報", "usage_logs", "health_scores"];
      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select("count").limit(1);
          newResults.tables[table] = !error || error.code !== "42P01";
        } catch (e) {
          newResults.tables[table] = false;
        }
      }

      // 接続テスト
      const { error } = await supabase.from("ユーザー基礎情報").select("count").limit(1);
      if (error) {
        newResults.error = error.message;
        if (error.code === "42501") {
          newResults.error += " (RLSポリシーの問題の可能性があります)";
        }
      } else {
        newResults.connection = true;
      }
    } catch (error) {
      newResults.error = error instanceof Error ? error.message : "不明なエラー";
    }

    setResults(newResults);
    setTesting(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Supabase接続テスト</CardTitle>
          <CardDescription>
            Supabaseの設定とデータベーススキーマを確認します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={testConnection} disabled={testing} className="w-full">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                テスト中...
              </>
            ) : (
              "接続テストを実行"
            )}
          </Button>

          {results && (
            <div className="space-y-4">
              {/* 環境変数 */}
              <div className="flex items-center gap-2">
                {results.env ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  環境変数の設定: {results.env ? "✅ 正常" : "❌ エラー"}
                </span>
              </div>

              {/* 接続 */}
              <div className="flex items-center gap-2">
                {results.connection ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  Supabase接続: {results.connection ? "✅ 成功" : "❌ 失敗"}
                </span>
              </div>

              {/* テーブル */}
              <div className="space-y-2">
                <div className="font-medium">データベーステーブル:</div>
                {Object.entries(results.tables).map(([table, exists]) => (
                  <div key={table} className="flex items-center gap-2 ml-4">
                    {exists ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {table}: {exists ? "✅ 存在" : "❌ 存在しません"}
                    </span>
                  </div>
                ))}
              </div>

              {/* エラー */}
              {results.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-800">エラー</span>
                  </div>
                  <p className="text-sm text-red-700">{results.error}</p>
                </div>
              )}

              {/* 成功メッセージ */}
              {results.connection && Object.values(results.tables).every((v) => v) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-800">
                      🎉 すべての設定が正しく完了しています！
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    開発サーバーを起動して、アプリケーションを使用できます。
                  </p>
                </div>
              )}

              {/* テーブルが存在しない場合の案内 */}
              {!Object.values(results.tables).every((v) => v) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-yellow-800">テーブルが見つかりません</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Supabase の SQL Editor で以下のファイルの内容を実行してください:
                  </p>
                  <code className="text-xs bg-yellow-100 px-2 py-1 rounded mt-2 block">
                    lib/supabase/migrations/001_initial_schema.sql
                  </code>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

