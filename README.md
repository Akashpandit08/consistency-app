# 🏋️ Consistency Online — Modern Fitness & Workout Platform

> A production-grade, offline-first, $0-cost baseline fitness and workout platform built with **Next.js**, **Supabase Free Tier**, **IndexedDB**, and **Vanilla CSS**.

---

## ⚡ Zero/Low-Cost Infrastructure Architecture

This application is engineered specifically to operate **100% on free tiers** during early-to-mid stage growth, requiring **$0/month in hosting costs** and **no dedicated VPS or always-running backend server**.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser / PWA                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   IndexedDB (idb) & LocalStorage (Offline Data)       │  │
│  │   Web Audio API (0-Byte Synthesized Audio Cues)       │  │
│  │   HTML5 Canvas (Client-Side WebP Compression)         │  │
│  │   Batched Analytics Queue (10s debounce / unload)     │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────────┬───────────────┘
               │ (Syncs when online)          │ (Edge Static CDN)
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Supabase Free Tier      │ │    Vercel Hobby Tier       │
│  - PostgreSQL (500MB)        │ │  - Next.js Edge / CDN      │
│  - Supabase Auth (50k MAU)   │ │  - Static Asset Delivery   │
│  - Storage (1GB WebP photos) │ │  - 100GB Bandwidth / month │
│  - Row Level Security (RLS)  │ │  - Zero VPS maintenance    │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## 📊 Free-Tier Limits & Scaling Reference

| Resource | Provider | Free Tier Limit | Real-World Capacity | Scale Trigger |
| :--- | :--- | :--- | :--- | :--- |
| **Hosting & CDN** | Vercel Hobby | 100 GB / month bandwidth | ~500,000 page views | Exceeding 100GB monthly egress |
| **Serverless Invocations** | Vercel Hobby | 100,000 executions / mo | Static routes cached via CDN | Heavy dynamic SSR requests |
| **Database Storage** | Supabase Free | 500 MB Postgres storage | ~250,000+ workout & set rows | Exceeding 500MB DB table size |
| **Active Users (Auth)** | Supabase Free | 50,000 MAU (Monthly Active) | 50,000 unique sign-ins / mo | Crossing 50k monthly active users |
| **Media / Storage** | Supabase Free | 1 GB file storage | ~5,000–8,000 compressed WebP photos | Crossing 1GB media files |
| **Database Egress** | Supabase Free | 2 GB / month | Optimized by IndexedDB offline-first | Continuous raw polling |

---

## 🛡️ Built-in Cost Control Safeguards

1. **Local-First & Offline Resilience (IndexedDB)**:
   - Workouts, drafts, exercise swaps, and biometrics save instantly to client-side IndexedDB (`lib/offline/store.ts`).
   - Syncs to Supabase only when online, eliminating continuous database read/write round-trips.

2. **Client-Side Image Compression (`lib/media/imageCompressor.ts`)**:
   - Resizes all user photos to max 1200px and converts to WebP format in the browser before upload.
   - Reduces photo file sizes by **85–95%** (e.g., 4MB raw photo → ~120KB WebP), preserving the 1GB free storage tier.

3. **0-Byte Web Audio Synthesizer (`lib/audio/workoutAudio.ts`)**:
   - Workout countdown ticks, rest finish beeps, PR celebration chimes, and fanfare are generated dynamically using the browser's Web Audio API oscillators.
   - Consumes **0 bytes of server bandwidth** and incurs $0 audio asset hosting costs.

4. **Batched & Rate-Limited Analytics (`lib/analytics/events.ts`)**:
   - Gathers UI events in memory and flushes them in a single multi-row SQL insert every 10 seconds or on tab close (`visibilitychange`).
   - Rate limits requests to max 30 events/minute per client, preventing runaway API calls.

5. **Client Rate Limiting Guards (`lib/security/rateLimit.ts`)**:
   - Guards expensive endpoints (photo uploads, metrics submission, account resets) against rapid-fire submission.

6. **Paginated & Indexed Database Queries**:
   - Queries restrict payload size (`.limit(30)`, `.limit(60)`) and leverage composite B-Tree indexes on `user_id` and timestamp columns.

---

## 💰 How to Monitor Usage & Prevent Unexpected Costs

### In Supabase:
1. Go to your **Supabase Dashboard → Organization Settings → Billing**.
2. Ensure the project is on the **Free Plan**.
3. By default, Supabase pauses resources when free limits are reached rather than billing your credit card.
4. Set up usage notification emails under **Project Settings → Usage**.

### In Vercel:
1. Navigate to **Vercel Dashboard → Project Settings → Billing**.
2. Verify **Spend Management** notifications are enabled to receive email alerts when bandwidth reaches 75% and 100% of the free tier.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (for production deployment)

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3. Initialize the Database
1. Open your Supabase project dashboard.
2. Go to **SQL Editor** → **New Query**.
3. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
4. This sets up all tables, indexes, security triggers, and Row Level Security (RLS) policies.

### 4. Configure Authentication URLs
In **Supabase Dashboard → Authentication → URL Configuration**:
- **Site URL**: `http://localhost:3000` (or your production Vercel URL)
- **Redirect URLs**: Add `http://localhost:3000/**` and `https://your-domain.vercel.app/**`

### 5. Run Locally
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Deployment (Vercel $0)

1. Push your repository to GitHub.
2. Import the repository into **Vercel**.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel Environment Variables.
4. Click **Deploy**. Vercel will automatically build and serve the optimized static assets via global CDN.

---

## 📱 Features

- **Multi-Equipment 7-Day Workout Engine**: Full Gym, Home Gym, Dumbbells Only, and Calisthenics splits.
- **Universal Exercise Library**: 100+ master exercises categorized by muscle group, mechanics, and difficulty with animated exercise motion guides.
- **Interactive Workout Logger**: Set tracking, RPE, live rest timer with synthesized Web Audio sound cues.
- **Offline-First Resilience**: Full IndexedDB sync queue for uninterrupted offline gym sessions.
- **Health & Biometrics**: Track calories, macros, daily steps, heart rate, water intake, sleep, and body measurements.
- **Private Progress Photos**: Client-side compressed WebP photo tracking.
- **Community Challenges & Badges**: 7-Day, 14-Day, and 30-Day streak challenges with celebratory achievements.
