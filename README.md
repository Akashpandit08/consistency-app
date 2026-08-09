# Consistency — The Offline-First Fitness Superapp

Consistency is a modern, zero-cost, offline-first health and fitness superapp. Designed to work flawlessly in the deepest basement gyms without internet, it tracks your workouts, diet, body metrics, and progress seamlessly.

## 🚀 Features

- **Offline-First Architecture**: Built using IndexedDB and Service Workers. Log workouts, take progress photos, and view your diet without any internet connection. It automatically syncs with the cloud when you're back online.
- **Zero-Cost Cloud Architecture**: Runs on Vercel and Supabase Free Tiers with zero custom backend servers. Heavy media is optimized locally in the browser.
- **Client-Side Image Compression**: Progress photos are resized and WebP-compressed entirely within the browser using HTML5 Canvas before saving, protecting your storage quotas and mobile bandwidth.
- **Visual Progress Calendar**: A highly interactive calendar that visually maps your workout days (🔥), weigh-in days (⚖️), and progress photo thumbnails. Includes a slider to compare "Before & After" photos side-by-side.
- **7-Day Diet Programs**: Fully customizable, day-wise, and hour-wise meal planning. Choose from pre-built programs (Muscle Gain, Keto, Clean Cut) or build your own.
- **Universal Alarm Synthesizer**: Never miss a meal or a workout. The app features a custom Web Audio API synthesizer that generates beautiful, high-quality alarm tones (gongs, pulses, chimes) without downloading any audio files.
- **Global Light & Dark Themes**: Fully responsive UI built with Tailwind CSS v4 featuring a classic white light mode and a slick midnight dark mode.
- **Smart PPL Logic**: Push, Pull, Legs workout tracking with integrated rest timers and volume calculations.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database / Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **State & Offline Storage**: React Context + IndexedDB
- **Icons**: Lucide React
- **Dates**: date-fns

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Supabase account (Free tier is sufficient)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Akashpandit08/consistency-app.git
   cd consistency-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## 💡 Philosophy

*Win today. Repeat tomorrow.*

Consistency was built on the belief that a fitness app should never get in your way. It shouldn't force you to wait for loading spinners between sets, and it shouldn't cost you money just to track your own data. By leveraging edge computing and modern browser APIs, Consistency delivers a premium "superapp" experience entirely for free.
