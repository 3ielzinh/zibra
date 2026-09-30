import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '../lib/seo';
import CartProvider from './Cart';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ZIBRA | Joias que guardam significado',
    template: '%s | ZIBRA',
  },
  description: 'Joias em prata com curadoria especial, acabamento impecável e significado para presentear, celebrar e guardar.',
  applicationName: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/zibra-favicon.png',
    apple: '/zibra-favicon.png',
  },
  openGraph: {
    title: 'ZIBRA | Joias que guardam significado',
    description: 'Joias em prata com curadoria especial, acabamento impecável e significado para presentear, celebrar e guardar.',
    url: '/',
    siteName: SITE_NAME,
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'ZIBRA, joias que guardam significado' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZIBRA | Joias que guardam significado',
    description: 'Joias em prata com curadoria especial, acabamento impecável e significado para presentear, celebrar e guardar.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body><CartProvider>{children}</CartProvider></body>
    </html>
  );
}
