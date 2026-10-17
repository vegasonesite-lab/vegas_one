import './globals.css';
import { Lexend } from 'next/font/google';
import Script from 'next/script';
import PushNotificationManager from '@/components/player/PushNotificationManager';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-lexend',
  display: 'swap',
});

export const metadata = {
  title: 'Vegas One - Official Gaming Portal | Instant Accounts & Fast Payouts',
  description: 'Access top gaming platforms like Fire Kirin, Orion Stars, Game Vault, Juwa, and Ultra Panda at Vegas One. Instant accounts, fast deposits via Cash App & Crypto, and 24/7 cashouts.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icons/favicon.png', type: 'image/png', sizes: '64x64' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Vegas One',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: '#070514',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={lexend.variable} style={{ fontFamily: `var(--font-lexend), 'Lexend', -apple-system, sans-serif` }}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="/icons/favicon.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className={lexend.className} style={{ fontFamily: `var(--font-lexend), 'Lexend', -apple-system, sans-serif` }}>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <PushNotificationManager />
        {children}
      </body>
    </html>
  );
}
