import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Consistency — Free Fitness Tracker',
    template: '%s | Consistency',
  },
  description:
    'A free workout, nutrition, and progress tracker. Build muscle, lose fat, stay consistent. Syncs across all your devices. Works offline inside the gym.',
  keywords: [
    'fitness tracker',
    'workout tracker',
    'push pull legs',
    'gym app',
    'streak tracker',
    'free fitness app',
    'consistency',
    'muscle building',
    'fat loss',
  ],
  authors: [{ name: 'Consistency App' }],
  creator: 'Consistency App',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://consistency.app'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Consistency',
    title: 'Consistency — Free Fitness Tracker',
    description:
      'Track workouts, nutrition, and progress. Build habits that stick.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Consistency — Free Fitness Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consistency — Free Fitness Tracker',
    description:
      'Track workouts, nutrition, and progress. Build habits that stick.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080b10',
}

import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { NotificationAlarmProvider } from '@/components/notifications/NotificationAlarmProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-bg text-text-main antialiased">
        <ThemeProvider attribute="class" defaultTheme="light">
          <NotificationAlarmProvider>
            {children}
          </NotificationAlarmProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
