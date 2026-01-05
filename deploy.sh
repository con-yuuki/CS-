#!/bin/bash

# Vercelデプロイスクリプト

echo "🚀 Vercelへのデプロイを開始します..."

# 環境変数を設定
export NEXT_PUBLIC_SUPABASE_URL="https://hcceyhmisbmclqrgfedr.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2V5aG1pc2JtY2xxcmdmZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTczMTgsImV4cCI6MjA4MjQ5MzMxOH0.rXc6FJqe9ji-Q9TQ_xeMXvuNP1_0zIzOwCeNc93AROw"

# Vercelにデプロイ（本番環境）
npx vercel --prod --yes \
  -e NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"

echo "✅ デプロイが完了しました！"

