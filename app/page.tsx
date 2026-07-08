import { redirect } from 'next/navigation';

// Home cai no Catálogo (porta de entrada da Fase 1/2 no frontend).
export default function Home() {
  redirect('/catalogo');
}
