import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'garimpo-pc',
  description: 'Arbitragem de hardware usado — preço-base, triagem e veredito de margem.',
};

export const viewport: Viewport = {
  themeColor: '#0b0f14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-base text-texto">
        <main className="mx-auto w-full max-w-2xl px-4 pt-4 pb-nav">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
