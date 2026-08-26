import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://zibra-joias.o-gabriel-di-2032.chatgpt.site'),
  title: 'ZIBRA — Joias que guardam significado',
  description: 'Joias delicadas, acabamento impecável e uma experiência pensada para encantar.',
  icons: {
    icon: '/zibra-favicon.png',
    apple: '/zibra-favicon.png',
  },
  openGraph: {
    title: 'ZIBRA — Joias que guardam significado',
    description: 'Joias delicadas, acabamento impecável e uma experiência pensada para encantar.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'ZIBRA — Joias que guardam significado' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZIBRA — Joias que guardam significado',
    description: 'Joias delicadas, acabamento impecável e uma experiência pensada para encantar.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
