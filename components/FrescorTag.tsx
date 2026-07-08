import type { Frescor } from '@/lib/types';

const COR: Record<string, string> = {
  fresco: 'text-verde',
  recente: 'text-amarelo',
  envelhecendo: 'text-laranja',
  defasado: 'text-vermelho',
  sem_dados: 'text-muted',
};

export default function FrescorTag({ frescor }: { frescor: Frescor }) {
  const cor = COR[frescor.nivel] || 'text-muted';
  const txt =
    frescor.dias == null
      ? 'sem calibração'
      : frescor.dias === 0
      ? 'hoje'
      : `há ${frescor.dias}d`;
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${cor}`} title={frescor.label}>
      <span>{frescor.emoji}</span>
      <span>{txt}</span>
    </span>
  );
}
