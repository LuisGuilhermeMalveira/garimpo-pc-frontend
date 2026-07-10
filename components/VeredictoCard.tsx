import type { Analise } from '@/lib/types';
import FrescorTag from './FrescorTag';

function brl(n: number | null | undefined) {
  if (n == null) return '—';
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function pct(n: number) {
  return `${n > 0 ? '+' : ''}${Math.round(n * 100)}%`;
}

const VEREDITO: Record<string, { label: string; cor: string; bg: string }> = {
  compensa: { label: '✅ COMPENSA', cor: 'text-verde', bg: 'bg-verde/10 border-verde/40' },
  marginal: { label: '⚠️ MARGINAL', cor: 'text-amarelo', bg: 'bg-amarelo/10 border-amarelo/40' },
  nao_compensa: { label: '❌ NÃO COMPENSA', cor: 'text-vermelho', bg: 'bg-vermelho/10 border-vermelho/40' },
  incompleto: { label: '⚠️ ANÁLISE INCOMPLETA', cor: 'text-amarelo', bg: 'bg-amarelo/10 border-amarelo/40' },
};

function Linha({ label, valor, forte }: { label: string; valor: string; forte?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-2 ${forte ? 'font-semibold' : ''}`}>
      <span className={forte ? 'text-texto' : 'text-muted'}>{label}</span>
      <span className="font-mono">{valor}</span>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-borda px-3 py-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{titulo}</h3>
      {children}
    </div>
  );
}

export default function VeredictoCard({ analise: a }: { analise: Analise }) {
  const v = VEREDITO[a.veredito] || VEREDITO.incompleto;
  const scoreCor =
    a.score.valor >= 70 ? 'text-verde' : a.score.valor >= 50 ? 'text-amarelo' : 'text-vermelho';

  return (
    <div className="overflow-hidden rounded-2xl border border-borda bg-surface">
      {/* cabeçalho: veredito + lucro/mês */}
      <div className={`border-b px-4 py-3 ${v.bg}`}>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-lg font-bold ${v.cor}`}>{v.label}</span>
          {a.veredito !== 'incompleto' && (
            <span className="text-right">
              <span className={`text-lg font-bold ${a.lucro_liquido > 0 ? 'text-verde' : 'text-vermelho'}`}>
                {a.lucro_liquido > 0 ? '+' : ''}R$ {brl(a.lucro_liquido)}
              </span>
              {a.lucro_por_mes != null && (
                <span className="ml-2 text-sm text-muted">· R$ {brl(a.lucro_por_mes)}/mês</span>
              )}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
          {a.cidade && <span>{a.cidade.nome}</span>}
          <span className={scoreCor}>Score {a.score.valor}/100</span>
        </div>
      </div>

      {/* alertas */}
      {a.alertas.length > 0 && (
        <div className="space-y-1 px-3 pt-3">
          {a.alertas.map((al, i) => (
            <p
              key={i}
              className={`rounded-lg px-2 py-1.5 text-xs ${
                al.nivel === 'vermelho'
                  ? 'bg-vermelho/10 text-vermelho'
                  : al.nivel === 'info'
                  ? 'bg-azul/10 text-azul'
                  : 'bg-amarelo/10 text-amarelo'
              }`}
            >
              {al.msg}
            </p>
          ))}
        </div>
      )}

      {/* peças */}
      <Secao titulo="Peças">
        <div className="space-y-1.5 text-sm">
          {a.itens.map((it, i) => (
            <div key={i} className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate">
                {it.modelo_extraido}
                {/* nome de RAM decomposta já vem com "×N" — não duplica */}
                {it.quantidade > 1 && !String(it.modelo_extraido).includes('×')
                  ? ` ×${it.quantidade}`
                  : ''}
                {it.removivel && <span className="text-muted"> ⊖</span>}
                {it.origem === 'estimado' && (
                  <span className="text-amarelo">
                    {' '}
                    {it.piso ? '⌊ piso genérico' : it.manual ? '✎ sua estimativa' : '⚡estimado'}
                  </span>
                )}
              </span>
              <span className="flex shrink-0 items-center gap-2 font-mono">
                {it.faltante ? (
                  <span className="text-amarelo">faltante</span>
                ) : (
                  <>
                    <span>R$ {brl(it.preco_aplicado)}</span>
                    <span className="text-xs">{it.frescor.emoji}</span>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
        {a.faltantes.length > 0 && (
          <p className="mt-2 rounded-lg bg-amarelo/10 px-2 py-1.5 text-xs text-amarelo">
            Faltam preços: {a.faltantes.join(', ')}. Calibre no Catálogo pra fechar o veredito.
          </p>
        )}
      </Secao>

      {/* modificadores */}
      {a.modificadores_aplicados.length > 0 && (
        <Secao titulo="Modificadores">
          <div className="space-y-1 text-sm">
            {a.modificadores_aplicados.map((m, i) => (
              <Linha
                key={i}
                label={m.nome}
                valor={pct(m.sentido === 'sobe' ? m.percentual : -m.percentual)}
              />
            ))}
          </div>
        </Secao>
      )}

      {/* soma das peças em destaque (faixa de mercado) */}
      <div className="border-t border-borda px-3 py-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted">Soma das peças (mediana)</span>
          <span className="text-lg font-bold">R$ {brl(a.valor_bruto_pecas)}</span>
        </div>
        <div className="mt-0.5 text-right text-xs text-muted">
          faixa de mercado: R$ {brl(a.valor_bruto_min)} – R$ {brl(a.valor_bruto_max)}
        </div>
      </div>

      {/* conta aberta */}
      <Secao titulo="Conta aberta (do bruto ao lucro)">
        <div className="space-y-1 text-sm">
          <Linha label="Soma das peças" valor={`R$ ${brl(a.valor_bruto_pecas)}`} />
          {a.modificadores_aplicados.length > 0 && (
            <Linha
              label={`Após modificadores (${pct(a.soma_modificadores_pct)})`}
              valor={`R$ ${brl(a.valor_modificado)}`}
            />
          )}
          <Linha label={`Realização (×${a.fator_realizacao})`} valor={`R$ ${brl(a.valor_revenda)}`} />
          <Linha
            label="Preço pedido"
            valor={`− R$ ${brl(a.preco_pedido ?? a.preco_pix)}`}
          />
          <Linha
            label={a.cidade ? `Combustível (${a.cidade.nome})` : 'Combustível'}
            valor={`− R$ ${brl(a.custo_aquisicao)}`}
          />
          {a.custo_recuperacao > 0 && (
            <Linha label="Recuperação" valor={`− R$ ${brl(a.custo_recuperacao)}`} />
          )}
          <Linha label="Margem de risco" valor={`− R$ ${brl(a.margem_risco)}`} />
          {a.veredito !== 'incompleto' && (
            <div className="mt-1 border-t border-borda pt-1">
              <Linha
                label="LUCRO LÍQUIDO"
                valor={`${a.lucro_liquido > 0 ? '+' : ''}R$ ${brl(a.lucro_liquido)}${
                  a.lucro_percentual != null ? `  (${a.lucro_percentual > 0 ? '+' : ''}${a.lucro_percentual}%)` : ''
                }`}
                forte
              />
              {a.dias_ate_vender != null && (
                <p className="mt-1 text-right text-xs text-muted">
                  gira em ~{a.dias_ate_vender} dias → R$ {brl(a.lucro_por_mes)}/mês
                </p>
              )}
            </div>
          )}
        </div>
      </Secao>

      {/* munição */}
      {a.negociacao.argumentos.length > 0 && (
        <Secao titulo="💬 Pra negociar">
          <ul className="space-y-1 text-sm">
            {a.negociacao.argumentos.map((arg, i) => (
              <li key={i} className="text-muted">
                • {arg}
              </li>
            ))}
          </ul>
        </Secao>
      )}

      {/* 3 preços */}
      <Secao titulo="3 preços">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { l: 'Pedido', v: a.negociacao.preco_pedido, cor: 'text-texto' },
            { l: 'Teto', v: a.negociacao.preco_teto, cor: 'text-amarelo' },
            { l: 'Oferta', v: a.negociacao.preco_oferta, cor: 'text-verde' },
          ].map((p) => (
            <div key={p.l} className="rounded-lg border border-borda bg-surface2 py-2">
              <div className="text-xs text-muted">{p.l}</div>
              <div className={`font-mono font-semibold ${p.cor}`}>R$ {brl(p.v)}</div>
            </div>
          ))}
        </div>
      </Secao>

      {/* canibalização */}
      {a.veredito !== 'incompleto' && (
        <Secao titulo="📦 Montado vs canibalizar">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted">
              Montado R$ {brl(a.canibalizacao.montado)} · Peças R$ {brl(a.canibalizacao.valor_canibalizado)}
            </span>
            <span className={a.canibalizacao.vale_a_pena ? 'text-verde' : 'text-muted'}>
              {a.canibalizacao.diff > 0 ? `+R$ ${brl(a.canibalizacao.diff)}` : ''}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">{a.canibalizacao.recomendacao}</p>
        </Secao>
      )}
    </div>
  );
}
