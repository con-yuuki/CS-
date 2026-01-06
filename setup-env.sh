#!/bin/bash
echo "Vercel環境変数の設定を開始します..."
echo ""
echo "ステップ1: Vercel CLIにログイン"
npx vercel login
echo ""
echo "ステップ2: 環境変数を追加"
echo "NEXT_PUBLIC_SUPABASE_URL を追加します..."
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
echo ""
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY を追加します..."
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
echo ""
echo "ステップ3: 再デプロイ"
npx vercel --prod
echo ""
echo "完了しました！"
