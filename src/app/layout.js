import './globals.css';
import { Lexend } from 'next/font/google';

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
    icon: '/icons/favicon.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: 'resizes-content',
  themeColor: '#00F0FF',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={lexend.variable} style={{ fontFamily: `var(--font-lexend), 'Lexend', -apple-system, sans-serif` }}>
      <head>
        <link rel="icon" href="/icons/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className={lexend.className} style={{ fontFamily: `var(--font-lexend), 'Lexend', -apple-system, sans-serif` }}>
        {children}
      </body>
    </html>
  );
}
