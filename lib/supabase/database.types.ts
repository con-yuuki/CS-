export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      "ユーザー基礎情報": {
        Row: {
          id: number;
          name: string | null;
          mrc_ltv: number | null;
          next_renewal_month: string | null;
          churn_status: string | null;
        };
        Insert: {
          id: number;
          name?: string | null;
          mrc_ltv?: number | null;
          next_renewal_month?: string | null;
          churn_status?: string | null;
        };
        Update: {
          id?: number;
          name?: string | null;
          mrc_ltv?: number | null;
          next_renewal_month?: string | null;
          churn_status?: string | null;
        };
      };
      companies: {
        Row: {
          id: number;
          name: string;
          mrc: number;
          is_excluded: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          mrc: number;
          is_excluded?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          mrc?: number;
          is_excluded?: boolean;
          created_at?: string;
        };
      };
      usage_logs: {
        Row: {
          id: number;
          会社ID: string | null;
          会社名: string | null;
          対象月: string | null;
          対象週: string | null;
          ログイン回数: number | null;
          見積作成数: number | null;
          工事登録数: number | null;
          見積金額: number | null;
          請求金額: number | null;
          Active率: string | null;
          社員数: number | null;
          顧客数: number | null;
          取り込み元ファイル名: string | null;
          raw_data: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          会社ID?: string | null;
          会社名?: string | null;
          対象月?: string | null;
          対象週?: string | null;
          ログイン回数?: number | null;
          見積作成数?: number | null;
          工事登録数?: number | null;
          見積金額?: number | null;
          請求金額?: number | null;
          Active率?: string | null;
          社員数?: number | null;
          顧客数?: number | null;
          取り込み元ファイル名?: string | null;
          raw_data?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          会社ID?: string | null;
          会社名?: string | null;
          対象月?: string | null;
          対象週?: string | null;
          ログイン回数?: number | null;
          見積作成数?: number | null;
          工事登録数?: number | null;
          見積金額?: number | null;
          請求金額?: number | null;
          Active率?: string | null;
          社員数?: number | null;
          顧客数?: number | null;
          取り込み元ファイル名?: string | null;
          raw_data?: Json | null;
          created_at?: string | null;
        };
      };
      health_scores: {
        Row: {
          id: string;
          tenant_id: number;
          score: number;
          status: "Excellent" | "Stable" | "Warning" | "Critical";
          period_type: "weekly" | "monthly";
          period_date: string;
          trend_status: string | null;
          trend_change_pct: number | null;
          zeroed_feature_alert: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: number;
          score: number;
          status: "Excellent" | "Stable" | "Warning" | "Critical";
          period_type: "weekly" | "monthly";
          period_date: string;
          trend_status?: string | null;
          trend_change_pct?: number | null;
          zeroed_feature_alert?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: number;
          score?: number;
          status?: "Excellent" | "Stable" | "Warning" | "Critical";
          period_type?: "weekly" | "monthly";
          period_date?: string;
          trend_status?: string | null;
          trend_change_pct?: number | null;
          zeroed_feature_alert?: boolean | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

