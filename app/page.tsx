"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CS Health Score Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            顧客の健康状態を可視化するダッシュボード
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>データインポート</CardTitle>
              <CardDescription>
                Excel/CSVファイルから利用ログデータをインポート
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/import">
                <Button className="w-full">インポート画面へ</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ダッシュボード</CardTitle>
              <CardDescription>
                スコア一覧、フィルタリング、統計情報を表示
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button className="w-full">ダッシュボードへ</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>トレンド分析</CardTitle>
              <CardDescription>
                企業別のスコア推移とアラート表示
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/trends">
                <Button className="w-full">トレンド分析へ</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link href="/test-connection">
            <Button variant="outline">🔍 Supabase接続テスト</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

