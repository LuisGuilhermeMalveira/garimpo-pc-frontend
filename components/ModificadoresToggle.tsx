'use client';

// Modificadores aplicados na triagem, cada um ligável/desligável.
// Desligar tira o % daquela análise (ex.: já estimei a fonte genérica,
// não quero o -10% por cima). Não altera o banco.

export interface ModInfo {
  sentido: 'sobe' | 'desce';
  percentual: number;
}

export default function ModificadoresToggle({
  info,
  off,
  onToggle,
}: {
  info: Record<string, ModInfo>;
  off: string[];
  onToggle: (nome: string) => void;
}) {
  const nomes = Object.keys(info);
  if (nomes.length === 0) return null;
  const offSet = new Set(off);

  return (
    <div className="rounded-2xl border border-borda bg-surface p-3">
      <h2 className="mb-2 text-sm font-semibold">⚙️ Modificadores (toque pra ligar/desligar)</h2>
      <div className="flex flex-wrap gap-2">
        {nomes.map((nome) => {
          const m = info[nome];
          const desligado = offSet.has(nome);
          const sinal = m.sentido === 'sobe' ? '+' : '−';
          const pctTxt = `${sinal}${Math.round(m.percentual * 100)}%`;
          return (
            <button
              key={nome}
              onClick={() => onToggle(nome)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                desligado
                  ? 'border-borda text-muted line-through'
                  : m.sentido === 'sobe'
                  ? 'border-verde/50 bg-verde/10 text-verde'
                  : 'border-vermelho/50 bg-vermelho/10 text-vermelho'
              }`}
              title={desligado ? 'desligado — toque pra ligar' : 'ligado — toque pra desligar'}
            >
              {nome} {pctTxt}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted">
        Desligue o que você já considerou na estimativa das peças (ex.: fonte genérica).
      </p>
    </div>
  );
}
