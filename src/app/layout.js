import './globals.css';

export const metadata = {
  title: 'Vegas One - Luxury Sweeps Casino | Win Real Cash Prizes',
  description: 'Experience premier Las Vegas sweepstakes gaming at Vegas One (vegasone.games). Play slots, rocket crash, roulette & blackjack with daily free SC and instant redemptions.',
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
  themeColor: '#F59E0B',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/favicon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
