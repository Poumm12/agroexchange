#!/bin/bash
# ═══════════════════════════════════════════════════════════
# AgroExchange – Quick Start Script
# ═══════════════════════════════════════════════════════════

echo "🌾 AgroExchange – Starting setup..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org (v18+)"
  exit 1
fi

echo "✅ Node.js $(node -v) found"

# Check .env.local
if grep -q "your_supabase_url_here" .env.local 2>/dev/null; then
  echo ""
  echo "⚠️  ΣΗΜΑΝΤΙΚΟ: Πρέπει να ορίσεις τα Supabase credentials στο .env.local"
  echo "   1. Πήγαινε στο https://supabase.com"
  echo "   2. Δημιούργησε νέο project"
  echo "   3. Αντέγραψε τα keys στο .env.local"
  echo "   4. Εκτέλεσε τα SQL migrations από το φάκελο supabase/migrations/"
  echo ""
fi

# Install
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🚀 Starting development server..."
echo "   → http://localhost:3000"
echo ""
echo "Μετά την εκκίνηση, για να φορτώσεις demo data:"
echo "   curl -X POST http://localhost:3000/api/seed"
echo ""

npm run dev
