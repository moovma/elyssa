import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import AnalyticsEvents from '../components/AnalyticsEvents';

// The public address of the site. Set NEXT_PUBLIC_SITE_URL in Vercel if the domain ever changes.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moovma.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Moovma: open hardware from Tunisia',
  description:
    'Moovma designs and open-sources electronics in Tunisia: the Elyssa ESP32-S3 dev board, smart power controllers, motor drivers and more.',
  icons: {
    icon: '/PNG/ICON@2x.png',
  },
  openGraph: {
    title: 'Moovma: open hardware from Tunisia',
    description: 'Hardware for makers, built for building things. Home of the Elyssa ESP32-S3 dev board.',
    url: '/',
    siteName: 'Moovma',
    images: [
      {
        url: '/product_images/_opt/front_elyssa.webp',
        width: 1400,
        height: 1400,
        alt: 'Elyssa ESP32-S3 development board by Moovma',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Serif+Display:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
        <SpeedInsights />
        <AnalyticsEvents />
      </body>
    </html>
  );
}
