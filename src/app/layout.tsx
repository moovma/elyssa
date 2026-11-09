import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://github.com/moovma/Elyssa-dev-board'),
  title: 'Elyssa — dev board by Moovma',
  description: 'Elyssa is Moovma\'s open ESP32-S3 development board for makers, sensors, and connected things. Featuring 6-axis IMU, Wi-Fi 4, BLE 5, and LiPo charging.',
  icons: {
    icon: '/PNG/ICON@2x.png',
  },
  openGraph: {
    title: 'Elyssa — ESP32-S3 Dev Board',
    description: 'Hardware for makers, built for building things.',
    url: 'https://github.com/moovma/Elyssa-dev-board',
    siteName: 'Elyssa Dev Board',
    images: [
      {
        url: '/elyssa_images/elyssa_top.png',
        width: 1200,
        height: 630,
        alt: 'Elyssa ESP32-S3 Development Board',
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
      </body>
    </html>
  );
}
