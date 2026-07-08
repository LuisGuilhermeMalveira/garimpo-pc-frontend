'use client';

import { CATEGORIAS, type Categoria, type PecaEdit, type Peca } from '@/lib/types';

// Editor das peças da triagem. Tudo aqui vale SÓ pra esta análise (não vai pro
// banco) — exceto o botão "calibrar", que leva a peça pro banco via print.
//
// Por peça, um TOGGLE define a origem do preço:
//   ✎ estimar  -> preço na mão (preco_manual)
//   🏦 banco    -> escolhe uma peça já calibrada do catálogo (usa o preço dela)
//
// Mostra o esqueleto completo do PC; linhas vazias são ignoradas no cálculo.

function brl(n: number) {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

export default function PecasEditor({
  pecas,
  setPecas,
  catalogo,
  faltanteSet,
  onCalibrar,
  onRecalcular,
  recalculando,
}: {
  pecas: PecaEdit[];
  setPecas: (p: PecaEdit[]) => void;
  catalogo: Peca[];
  faltanteSet: Set<string>;
  onCalibrar: (p: PecaEdit) => void;
  onRecalcular: () => void;
  recalculando: boolean;
}) {
  function up(i: number, patch: Partial<PecaEdit>) {
    setPecas(pecas.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function rm(i: number) {
    setPecas(pecas.filter((_, idx) => idx !== i));
  }
  function add() {
    setPecas([
      ...pecas,
      { categoria: 'outro', modelo: '', quantidade: 1, removivel: false, preco_manual: '', _modo: 'estimar' },
    ]);
  }
  function calibradasDe(cat: Categoria) {
    return catalogo.filter((c) => c.categoria === cat && c.preco_base != null);
  }

  return (
    <div className="rounded-2xl border border-borda bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">✏️ Peças do PC (editável)</h2>
        <button onClick={add} className="rounded-lg bg-surface2 px-2.5 py-1 text-xs text-texto hover:text-roxo">
          + adicionar
        </button>
      </div>

      <div className="space-y-2">
        {pecas.map((p, i) => {
          const modo = p._modo || 'estimar';
          const faltante = !p.preco_manual && faltanteSet.has((p.modelo || '').trim().toLowerCase());
          const vazia = !(p.modelo || '').trim() && !p.preco_manual;
          const labelCat = CATEGORIAS.find((c) => c.valor === p.categoria)?.label || p.categoria;
          const calibradas = calibradasDe(p.categoria);
          const nomeNorm = (p.modelo || '').trim().toLowerCase();
          const naCat = (c: Peca) => c.categoria === p.categoria && c.nome.trim().toLowerCase() === nomeNorm;
          const jaCalibrada = !!nomeNorm && catalogo.some((c) => naCat(c) && c.preco_base != null);
          const noCatalogo = !!nomeNorm && !catalogo.some(naCat);

          return (
            <div
              key={i}
              className={`rounded-xl border bg-surface2 p-2 ${vazia ? 'border-dashed border-borda' : 'border-borda'}`}
            >
              {/* linha 1: modelo + remover */}
              <div className="flex items-center gap-2">
                <input
                  value={p.modelo}
                  onChange={(e) => up(i, { modelo: e.target.value })}
                  placeholder={`${labelCat} — modelo (ou deixe vazio)`}
                  className="min-w-0 flex-1 rounded-lg border border-borda bg-surface px-2 py-1.5 text-sm text-texto"
                />
                <button onClick={() => rm(i)} className="shrink-0 px-1 text-muted hover:text-vermelho" aria-label="Remover">
                  ✕
                </button>
              </div>

              {/* linha 2: categoria + qtd + removível */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select
                  value={p.categoria}
                  onChange={(e) => up(i, { categoria: e.target.value as Categoria })}
                  className="rounded-lg border border-borda bg-surface px-2 py-1 text-xs text-texto"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c.valor} value={c.valor}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1 text-xs text-muted">
                  <span>qtd</span>
                  <input
                    inputMode="numeric"
                    value={p.quantidade ?? 1}
                    onChange={(e) => up(i, { quantidade: Number(e.target.value) || 1 })}
                    className="w-12 rounded-lg border border-borda bg-surface px-1.5 py-1 text-center text-texto"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-1 text-xs text-muted">
                  <input type="checkbox" checked={!!p.removivel} onChange={(e) => up(i, { removivel: e.target.checked })} />
                  removível
                </label>
              </div>

              {/* linha 3: toggle estimar/banco + controle do preço */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <div className="flex overflow-hidden rounded-lg border border-borda text-xs">
                  <button
                    onClick={() => up(i, { _modo: 'estimar' })}
                    className={`px-2 py-1 ${modo === 'estimar' ? 'bg-roxo/25 text-texto' : 'text-muted'}`}
                  >
                    ✎ estimar
                  </button>
                  <button
                    onClick={() => up(i, { _modo: 'banco' })}
                    className={`px-2 py-1 ${modo === 'banco' ? 'bg-roxo/25 text-texto' : 'text-muted'}`}
                  >
                    🏦 banco
                  </button>
                </div>

                {modo === 'estimar' ? (
                  <>
                    <div className="flex items-center gap-1 text-xs text-muted">
                      <span>R$</span>
                      <input
                        inputMode="numeric"
                        value={p.preco_manual ?? ''}
                        onChange={(e) => up(i, { preco_manual: e.target.value })}
                        placeholder="estimar"
                        className="w-20 rounded-lg border border-borda bg-surface px-1.5 py-1 text-center text-texto"
                      />
                    </div>
                  </>
                ) : calibradas.length > 0 ? (
                  <select
                    value={p.modelo}
                    onChange={(e) => {
                      const sel = calibradas.find((c) => c.nome === e.target.value);
                      up(i, {
                        modelo: e.target.value,
                        preco_manual: '',
                        capacidade: sel?.capacidade ?? p.capacidade ?? null,
                      });
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-borda bg-surface px-2 py-1 text-xs text-texto"
                  >
                    <option value="">— escolher do banco —</option>
                    {calibradas.map((c) => (
                      <option key={c.id} value={c.nome}>
                        {c.nome} — R$ {brl(c.preco_base!.preco_mediana)} {c.frescor.emoji}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-muted">nada calibrado em “{labelCat}” ainda</span>
                )}

                {/* peça não calibrada -> cria no banco (se nova) e calibra agora */}
                {nomeNorm && !jaCalibrada && (
                  <button
                    onClick={() => onCalibrar(p)}
                    className="rounded-lg border border-verde/50 px-2 py-1 text-xs text-verde"
                    title="Cria a peça no banco (se não existir) e abre a calibração"
                  >
                    {noCatalogo ? '➕ adicionar ao banco' : '📷 calibrar no banco'}
                  </button>
                )}
              </div>

              {faltante && modo === 'estimar' && (
                <p className="mt-1 text-xs text-amarelo">Sem preço no banco — estime (R$) ou troque pra 🏦 banco / calibre.</p>
              )}
              {vazia && (
                <p className="mt-1 text-xs text-muted">Peça do PC ainda não preenchida — preencha se o anúncio tiver, ou deixe vazia.</p>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onRecalcular}
        disabled={recalculando}
        className="mt-3 w-full rounded-xl bg-roxo py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {recalculando ? 'Recalculando…' : '↻ Recalcular veredito'}
      </button>
      <p className="mt-1 text-center text-xs text-muted">edições valem só pra esta análise — não vão pro banco</p>
    </div>
  );
}
