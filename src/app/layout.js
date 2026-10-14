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
  interactiveWidget: 'resizes-content',
  themeColor: '#00F0FF',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
