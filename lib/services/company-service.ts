import { supabase } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/database.types";

type Company = Database["public"]["Tables"]["ユーザー基礎情報"]["Row"];
type CompanyInsert = Database["public"]["Tables"]["ユーザー基礎情報"]["Insert"];
type CompanyUpdate = Database["public"]["Tables"]["ユーザー基礎情報"]["Update"];

export async function getCompanies() {
  const { data, error } = await supabase
    .from("ユーザー基礎情報")
    .select("*")
    .order("name");

  if (error) throw error;
  return data || [];
}

export async function getCompanyById(id: number) {
  // IDを数値に変換（bigint対応のため）
  const numericId = Number(id);
  
  // デバッグログ
  if (typeof window !== "undefined") {
    console.log(`🔍 getCompanyById 呼び出し: id=${id}, numericId=${numericId}`);
  }

  const { data, error } = await supabase
    .from("ユーザー基礎情報")
    .select("*")
    .eq("id", numericId)
    .single();

  if (error) {
    // デバッグログ
    if (typeof window !== "undefined") {
      console.error(`❌ getCompanyById エラー:`, {
        id,
        numericId,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error,
      });
    }
    
    // PGRST116 は「レコードが見つからない」エラー
    if (error.code === "PGRST116") {
      throw new Error(`企業ID ${id} が見つかりません`);
    }
    throw error;
  }

  // デバッグログ
  if (typeof window !== "undefined") {
    console.log(`✅ getCompanyById 成功:`, data);
  }

  return data;
}

// 注意: これらの関数は現在使用されていませんが、将来の拡張のために残しています
// Supabase型定義の問題（日本語テーブル名）により、型エラーが発生しますが、実行時には問題ありません
export async function createCompany(company: CompanyInsert) {
  const { data, error } = await (supabase as any)
    .from("ユーザー基礎情報")
    .insert([company])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCompany(id: number, company: CompanyUpdate) {
  const { data, error } = await (supabase as any)
    .from("ユーザー基礎情報")
    .update(company)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCompany(id: number) {
  const { error } = await supabase.from("ユーザー基礎情報").delete().eq("id", id);

  if (error) throw error;
}

