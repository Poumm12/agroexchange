# 🌾 AgroExchange — Production-Ready Web Platform

Η ψηφιακή αγορά αγροτικών προϊόντων για παραγωγούς, αγοραστές και μεταφορείς στην Ελλάδα.

---

## ⚡ Γρήγορη Εκκίνηση

```bash
# 1. Clone ή unzip
cd agroexchange

# 2. Συμπλήρωσε credentials
cp .env.example .env.local
nano .env.local          # βάλε τα Supabase keys

# 3. Install + dev
npm install
npm run dev              # → http://localhost:3000

# 4. Seed demo data (νέο terminal)
curl -X POST http://localhost:3000/api/seed
```

---

## 🔧 Πλήρης Εγκατάσταση

### 1. Supabase Setup (υποχρεωτικό)

1. Πήγαινε στο [supabase.com](https://supabase.com) → New Project
2. **SQL Editor** → εκτέλεσε `supabase/migrations/001_initial_schema.sql`
3. **SQL Editor** → εκτέλεσε `supabase/migrations/002_seed_data.sql`
3b. **SQL Editor** → εκτέλεσε `supabase/migrations/003_phase_b_users_messaging.sql`
3c. **SQL Editor** → εκτέλεσε `supabase/migrations/004_phase_c_transport_map_support.sql`
3d. **SQL Editor** → εκτέλεσε `supabase/migrations/005_measurement_units_and_moderation.sql`
4. **Storage** → New Bucket → Name: `avatars` → Public: ✅
5. **Settings → API** → αντέγραψε `URL`, `anon key`, `service_role key`

### 2. Authentication Setup (Supabase Dashboard)

**Authentication → Settings:**
- **"Confirm email"** → **OFF** ← ΚΡΙΣΙΜΟ (χωρίς αυτό η εγγραφή δεν δουλεύει)
- Site URL: `https://yourdomain.gr`
- Redirect URLs: `https://yourdomain.gr/auth/reset-password`

**Authentication → Email Templates → Reset Password:**
- Αντικατέστησε με το template στο `supabase/EMAIL_TEMPLATES.md`

Δες `supabase/EMAIL_TEMPLATES.md` για πλήρεις οδηγίες.

### 3. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Welcome email — Resend (resend.com, δωρεάν 3000/μήνα)
RESEND_API_KEY=                    # χωρίς key: εμφανίζεται μόνο στο console

# Προαιρετικά (demo fallback χωρίς αυτά)
NEXT_PUBLIC_OPENWEATHER_API_KEY=   # openweathermap.org/appid (δωρεάν)
NEXT_PUBLIC_NEWS_API_KEY=          # newsapi.org (δωρεάν dev)
NEXT_PUBLIC_COMMODITIES_API_KEY=   # commodities-api.com (δωρεάν)

# Production
NEXT_PUBLIC_SITE_URL=https://yourdomain.gr
```

---

## 🔌 API Keys — Πλήρης Ανάλυση

| Service | URL | Δωρεάν Tier | Χρήση |
|---------|-----|------------|-------|
| **Supabase** | supabase.com | 500MB, 50K req | DB + Auth (ΥΠΟΧΡΕΩΤΙΚΟ) |
| **OpenWeatherMap** | openweathermap.org | 1000 req/ημέρα | Καιρός |
| **NewsAPI** | newsapi.org | 100 req/ημέρα (dev) | Αγροτικά νέα |
| **Commodities API** | commodities-api.com | 100 req/μήνα | Τιμές αγοράς |

> **Χωρίς API keys**: η πλατφόρμα τρέχει πλήρως με demo/cached δεδομένα. Μόλις βάλεις key, τα πραγματικά δεδομένα εμφανίζονται αυτόματα χωρίς καμία αλλαγή κώδικα.

---

## 🚀 Production Deploy

```bash
# Vercel (συνιστάται)
npm i -g vercel
vercel --prod

# ή Docker
docker build -t agroexchange .
docker run -p 3000:3000 agroexchange
```

Βάλε τα env variables στο Vercel Dashboard → Settings → Environment Variables.

---

## 📁 Αρχιτεκτονική

```
src/
├── app/                          # Next.js 14 App Router
│   ├── page.tsx                  # Landing + Dashboard SPA
│   ├── layout.tsx                # Root layout + AuthProvider + SEO
│   ├── not-found.tsx             # Custom 404
│   ├── sitemap.ts                # Auto-generated sitemap
│   ├── robots.ts                 # robots.txt
│   ├── about|contact|help|...    # Static pages
│   ├── auth/reset-password/      # Password reset callback
│   ├── email-confirmed/          # Email confirmation success
│   └── api/market|weather|news|seed/  # API routes (server-only)
├── components/
│   ├── auth/AuthModal.tsx        # Login/Register/Forgot
│   ├── dashboard/
│   │   ├── tabs/                 # 10 dashboard tabs
│   │   ├── ListingCard.tsx       # Category-aware images
│   │   ├── OfferModal.tsx        # Offer submission
│   │   └── ReviewModal.tsx       # Transporter reviews
│   ├── landing/                  # Hero, Features, Stats, Footer
│   ├── layout/Navbar.tsx         # Full user menu
│   └── ui/                       # Button, Card, Input, Icons (35 SVGs)
├── context/AuthContext.tsx       # Single auth source of truth
├── hooks/                        # useAuth, useListings, useOffers, etc.
├── lib/
│   ├── supabase-client.ts        # Browser singleton (safe for 'use client')
│   └── supabase-admin.ts         # Server-only (API routes only)
├── services/                     # Weather, Market, News API wrappers
└── types/index.ts                # Full TypeScript types
```

---

## Demo Credentials (μετά το seed)

| Email | Password | Ρόλος |
|-------|----------|-------|
| kostas@demo.gr | demo1234 | Παραγωγός |
| maria@demo.gr | demo1234 | Αγοραστής |
| giorgos@demo.gr | demo1234 | Μεταφορέας |

---

## ✅ Features

- Authentication: Login, Register, Forgot Password, Email Confirmation
- Protected Dashboard με 10 tabs
- Αγγελίες: δημιουργία, αναζήτηση (τίτλος/κατηγορία/τοποθεσία), category images
- Προσφορές: αποστολή, αποδοχή→deal, άρνηση
- Μεταφορές: αναζήτηση διαδρομής, booking, αξιολογήσεις
- Ειδοποιήσεις: realtime via Supabase
- Trust Score: αυτόματος υπολογισμός via DB triggers
- Κατάταξη: real DB data, podium, sub-leaderboards
- Καιρός: OpenWeatherMap + demo fallback
- Νέα: NewsAPI + Supabase cache
- Τιμές: Commodities API + demo fallback
- Προφίλ: avatar upload, edit, password change, delete account
- 8 Static pages + 404 + sitemap + robots.txt
- Full SEO metadata + OpenGraph
- **Πολυρολικοί χρήστες** (Παραγωγός/Αγοραστής/Μεταφορέας/Ασφαλιστική) + δημόσια προφίλ
- **Μηνύματα** μεταξύ χρηστών (realtime) + ειδοποιήσεις
- **AI Assistant** (floating) με admin handoff → support tickets
- **Χάρτης** αγροτικών σημείων (6 κατηγορίες, φίλτρα)
- **Αγορά Μεταφορών** + ζητήσεις διαδρομής + ειδοποίηση μεταφορέων
- **Content moderation**: φίλτρο ακατάλληλου λόγου (EL/EN) σε όλα τα κείμενα χρηστών
- **Σύστημα μονάδων μέτρησης**: κιλά / τόνοι / γραμμάρια με σωστή εμφάνιση τιμών (€/μονάδα)
- **Moderation-ready DB**: content_reports, moderation_logs, flagged columns

Built with: **Next.js 14** · **Supabase** · **Tailwind CSS** · **TypeScript**
