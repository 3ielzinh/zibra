import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZIBRA — Joias que guardam significado',
  description: 'Joias delicadas, acabamento impecável e uma experiência pensada para encantar.',
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
