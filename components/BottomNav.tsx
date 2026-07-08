'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/triagem', label: 'Triagem', icon: '🔍' },
  { href: '/lote', label: 'Lote', icon: '📋' },
  { href: '/catalogo', label: 'Catálogo', icon: '📊' },
  { href: '/historico', label: 'Histórico', icon: '🕑' },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-borda bg-surface/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-2xl">
        {TABS.map((t) => {
          const ativo = pathname === t.href || (pathname === '/' && t.href === '/catalogo');
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition-colors ${
                ativo ? 'text-texto' : 'text-muted'
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              <span className={ativo ? 'font-semibold' : ''}>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
