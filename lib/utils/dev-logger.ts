/**
 * 開発環境用のロガー
 * 本番環境では何も出力しません
 */

const isDev = process.env.NODE_ENV === "development";

export const devLog = {
  /**
   * 通常のログ
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log("🔵 [DEV]", ...args);
    }
  },

  /**
   * データのログ
   */
  data: (label: string, data: any) => {
    if (isDev) {
      console.log(`📊 [DATA] ${label}:`, data);
    }
  },

  /**
   * エラーのログ
   */
  error: (...args: any[]) => {
    if (isDev) {
      console.error("❌ [ERROR]", ...args);
    }
  },

  /**
   * 警告のログ
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn("⚠️ [WARN]", ...args);
    }
  },

  /**
   * 成功のログ
   */
  success: (...args: any[]) => {
    if (isDev) {
      console.log("✅ [SUCCESS]", ...args);
    }
  },

  /**
   * API呼び出しのログ
   */
  api: (method: string, url: string, data?: any) => {
    if (isDev) {
      console.log(`🔍 [API] ${method} ${url}`, data ? { data } : "");
    }
  },

  /**
   * パフォーマンス測定
   */
  performance: (label: string, startTime: number) => {
    if (isDev) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`⏱️ [PERF] ${label}: ${duration.toFixed(2)}ms`);
    }
  },
};

/**
 * パフォーマンス測定用のヘルパー
 */
export function measurePerformance<T>(
  label: string,
  fn: () => T
): T {
  if (!isDev) {
    return fn();
  }

  const startTime = performance.now();
  const result = fn();
  const endTime = performance.now();
  const duration = endTime - startTime;

  console.log(`⏱️ [PERF] ${label}: ${duration.toFixed(2)}ms`);

  return result;
}

/**
 * 非同期処理のパフォーマンス測定
 */
export async function measurePerformanceAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!isDev) {
    return fn();
  }

  const startTime = performance.now();
  const result = await fn();
  const endTime = performance.now();
  const duration = endTime - startTime;

  console.log(`⏱️ [PERF] ${label}: ${duration.toFixed(2)}ms`);

  return result;
}

