import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import AnalyticsEvents from '../components/AnalyticsEvents';
import { SITE_URL } from '../lib/site';
import { SOCIALS } from '../lib/moovma';
import JsonLd from '../components/JsonLd';

const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Moovma',
  url: SITE_URL,
  logo: `${SITE_URL}/PNG/ICON@2x.png`,
  description: 'Moovma designs and open-sources electronics in Tunisia: the Elyssa ESP32-S3 dev board, smart power controllers and more.',
  founder: { '@type': 'Person', name: 'Bejaoui Hamza' },
  email: 'moovmabh@gmail.com',
  sameAs: SOCIALS.map((s) => s.url),
};

const WEBSITE = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Moovma',
  alternateName: ['Elyssa', 'Moovma Elyssa dev board'],
  url: SITE_URL,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Moovma: open hardware from Tunisia', template: '%s | Moovma' },
  description:
    'Moovma designs and open-sources electronics in Tunisia: the Elyssa ESP32-S3 dev board, smart power controllers, motor drivers and more.',
  applicationName: 'Moovma',
  keywords: ['Moovma', 'Elyssa', 'Elyssa dev board', 'Tunisian dev board', 'ESP32-S3 development board', 'open source hardware Tunisia', 'Moovma Athir', 'Arduino ESP32-S3 board'],
  authors: [{ name: 'Moovma', url: SITE_URL }],
  robots: { index: true, follow: true },
  twitter: { card: 'summary_large_image', title: 'Moovma: open hardware from Tunisia', description: 'Home of Elyssa, the first Tunisian dev board (ESP32-S3).', images: ['/product_images/_opt/front_elyssa.webp'] },
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
        <JsonLd data={ORGANIZATION} />
        <JsonLd data={WEBSITE} />
        {children}
        <Analytics />
        <SpeedInsights />
        <AnalyticsEvents />
      </body>
    </html>
  );
}
