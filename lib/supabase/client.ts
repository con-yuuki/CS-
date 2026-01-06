import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数が設定されていない場合の警告
if (typeof window !== "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    "⚠️ Supabase環境変数が設定されていません。",
    "Vercelの環境変数を設定し、再デプロイを実行してください。",
    "詳細: https://vercel.com/con-yuukis-projects/alert/settings/environment-variables"
  );
}

// ダミー値でクライアントを作成（環境変数が設定されていない場合）
// 実際の使用時にはエラーが発生しますが、サーバーは起動します
export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

