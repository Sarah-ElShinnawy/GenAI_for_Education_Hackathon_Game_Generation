import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Learn & Play AI – Educational Game Generator',
  description: 'Generate instant educational games from any topic, PDF, or PowerPoint presentation in seconds.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Pixelify+Sans:wght@400;500;600;700;800&family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
