import type { Tendencia } from '@/lib/types';

// Mini-spark textual da tendência (sem libs): barras unicode + seta de direção.
const BARRAS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

function spark(valores: number[]): string {
  if (!valores || valores.length === 0) return '';
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const span = max - min || 1;
  return valores
    .map((v) => BARRAS[Math.round(((v - min) / span) * (BARRAS.length - 1))])
    .join('');
}

const SETA: Record<string, { s: string; cor: string }> = {
  subindo: { s: '↑', cor: 'text-verde' },
  caindo: { s: '↓', cor: 'text-vermelho' },
  estavel: { s: '→', cor: 'text-muted' },
  unico: { s: '·', cor: 'text-muted' },
  sem_dados: { s: '', cor: 'text-muted' },
};

export default function TendenciaSpark({ tendencia }: { tendencia: Tendencia }) {
  if (!tendencia || tendencia.calibracoes === 0) return null;
  const seta = SETA[tendencia.direcao] || SETA.sem_dados;
  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs text-muted" title={`${tendencia.calibracoes} calibração(ões)`}>
      <span>{spark(tendencia.valores)}</span>
      <span className={seta.cor}>{seta.s}</span>
    </span>
  );
}
