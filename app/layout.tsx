import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CS Health Score Dashboard",
  description: "顧客の健康状態を可視化するダッシュボード",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        {/* 開発環境でのみ表示されるデバッグ情報 */}
        {process.env.NODE_ENV === "development" && (
          <div className="fixed bottom-4 left-4 z-50 bg-blue-500 text-white px-3 py-1 rounded text-xs shadow-lg">
            🔧 開発モード
          </div>
        )}
      </body>
    </html>
  );
}

