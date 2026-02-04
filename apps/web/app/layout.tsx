import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Chaza - Compare Prices & Save Money',
    template: '%s | Chaza',
  },
  description: 'Compare prices across major retailers for household items, baby products, beverages, and more. Find the best deals and save money on your everyday purchases.',
  keywords: ['price comparison', 'deals', 'savings', 'baby products', 'diapers', 'formula', 'household items'],
  authors: [{ name: 'Chaza' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Chaza',
    title: 'Chaza - Compare Prices & Save Money',
    description: 'Compare prices across major retailers and save money on your everyday purchases.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chaza - Compare Prices & Save Money',
    description: 'Compare prices across major retailers and save money on your everyday purchases.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
