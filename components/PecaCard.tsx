import type { Peca } from '@/lib/types';
import FrescorTag from './FrescorTag';
import TendenciaSpark from './TendenciaSpark';

function brl(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function PecaCard({
  peca,
  onCalibrar,
  onExcluir,
}: {
  peca: Peca;
  onCalibrar: (p: Peca) => void;
  onExcluir: (p: Peca) => void;
}) {
  const pb = peca.preco_base;
  return (
    <div className="rounded-xl border border-borda bg-surface p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-semibold">{peca.nome}</div>
          <div className="mt-0.5 flex items-center gap-2">
            <FrescorTag frescor={peca.frescor} />
            <TendenciaSpark tendencia={peca.tendencia} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => onCalibrar(peca)}
            className="rounded-lg border border-borda bg-surface2 px-3 py-1.5 text-xs font-medium text-texto hover:border-roxo"
          >
            {pb ? 'Recalibrar' : 'Calibrar'}
          </button>
          <button
            onClick={() => onExcluir(peca)}
            className="rounded-lg border border-borda px-2 py-1.5 text-xs text-muted hover:border-vermelho hover:text-vermelho"
            title="Excluir peça"
            aria-label="Excluir"
          >
            🗑
          </button>
        </div>
      </div>

      {pb ? (
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold">R$ {brl(pb.preco_mediana)}</span>
          <span className="text-xs text-muted">
            ({brl(pb.preco_min)}–{brl(pb.preco_max)}) · {pb.amostras} amostras
            {peca.total_calibracoes > 1 ? ` · ${peca.total_calibracoes} calib.` : ''}
          </span>
        </div>
      ) : (
        <div className="mt-2 text-sm text-muted">
          Sem preço — <span className="text-amarelo">calibre pra ativar no veredito.</span>
        </div>
      )}
    </div>
  );
}
