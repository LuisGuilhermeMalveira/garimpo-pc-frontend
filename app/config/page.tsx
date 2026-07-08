'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIAS, type Categoria, type Config } from '@/lib/types';

// ordem dos pisos na tela (gpu fica de fora: sem piso)
const CATS_PISO: Categoria[] = [
  'cpu',
  'mobo',
  'ram',
  'fonte',
  'ssd',
  'hd',
  'cooler',
  'gabinete',
  'monitor',
  'periferico',
];

// Campo de ajuste com rótulo, ajuda e sufixo (% ou R$).
function Campo({
  titulo,
  ajuda,
  valor,
  setValor,
  sufixo,
  passo = '1',
}: {
  titulo: string;
  ajuda: string;
  valor: string;
  setValor: (v: string) => void;
  sufixo: string;
  passo?: string;
}) {
  return (
    <div className="rounded-xl border border-borda bg-surface p-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold">{titulo}</label>
        <div className="flex items-center gap-1">
          <input
            inputMode="decimal"
            step={passo}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-24 rounded-lg border border-borda bg-surface2 px-2 py-1.5 text-right text-texto"
          />
          <span className="w-6 text-sm text-muted">{sufixo}</span>
        </div>
      </div>
      <p className="mt-1.5 text-xs text-muted">{ajuda}</p>
    </div>
  );
}

export default function ConfigPage() {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // valores em unidades amigáveis (% e R$)
  const [realizacao, setRealizacao] = useState(''); // 90 (=0.90)
  const [margem, setMargem] = useState(''); // 5 (=0.05)
  const [piso, setPiso] = useState(''); // 250
  const [custoKm, setCustoKm] = useState(''); // 0.42
  const [pisos, setPisos] = useState<Record<string, string>>({}); // por categoria

  useEffect(() => {
    api
      .get<Config>('/config')
      .then((c) => {
        setRealizacao(String(Math.round(c.fator_realizacao * 100)));
        setMargem(String(Math.round(c.margem_risco_pct * 1000) / 10));
        setPiso(String(Math.round(c.piso_lucro)));
        setCustoKm(String(c.custo_km));
        const p: Record<string, string> = {};
        for (const cat of CATS_PISO) {
          const v = c.pisos?.[cat];
          p[cat] = v == null ? '' : String(v);
        }
        setPisos(p);
      })
      .catch((e) => setErro(e.message || 'Falha ao carregar config.'))
      .finally(() => setCarregando(false));
  }, []);

  async function salvar() {
    setErro(null);
    setSalvo(false);
    setSalvando(true);
    try {
      const pisosObj: Record<string, number | null> = {};
      for (const cat of CATS_PISO) {
        const v = pisos[cat];
        pisosObj[cat] = v === '' || v == null ? null : Number(v);
      }
      await api.patch<Config>('/config', {
        fator_realizacao: Number(realizacao) / 100,
        margem_risco_pct: Number(margem) / 100,
        piso_lucro: Number(piso),
        custo_km: Number(custoKm),
        pisos: pisosObj,
      });
      setSalvo(true);
    } catch (e: any) {
      setErro(e.message || 'Falha ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/catalogo" className="text-muted hover:text-texto">
          ←
        </Link>
        <h1 className="text-xl font-bold">⚙️ Configurações</h1>
      </div>

      <p className="text-sm text-muted">
        A régua do veredito. Mexer aqui muda o cálculo de todas as triagens.
      </p>

      {carregando && <p className="text-muted">Carregando…</p>}

      {!carregando && (
        <div className="space-y-3">
          <Campo
            titulo="Fator de realização"
            ajuda="Quanto você realmente tira na venda, em % do preço pedido. Padrão 90% (você vende um pouco abaixo do anunciado). Quanto maior, menos conservador."
            valor={realizacao}
            setValor={setRealizacao}
            sufixo="%"
          />
          <Campo
            titulo="Margem de risco"
            ajuda="Reserva sobre o preço de compra pra defeito/renegociação. Padrão 5%. Quanto maior, mais cauteloso."
            valor={margem}
            setValor={setMargem}
            sufixo="%"
            passo="0.5"
          />
          <Campo
            titulo="Piso de lucro"
            ajuda="Lucro líquido mínimo pra um PC ser ✅ Compensa. Abaixo disso vira ⚠️ Marginal. Padrão R$250."
            valor={piso}
            setValor={setPiso}
            sufixo="R$"
          />
          <Campo
            titulo="Custo por km"
            ajuda="Referência de combustível por km (etanol). Usado pra estimar custo de cidades novas. Padrão R$0,42."
            valor={custoKm}
            setValor={setCustoKm}
            sufixo="R$"
            passo="0.01"
          />

          {/* pisos por categoria */}
          <div className="rounded-xl border border-borda bg-surface p-3">
            <h2 className="text-sm font-semibold">Piso por categoria (R$)</h2>
            <p className="mt-1 mb-3 text-xs text-muted">
              Valor de chão de uma peça genérica/sem preço. Ela é contada por esse piso na triagem,
              sem desconto %. Deixe vazio pra não dar piso (vira faltante). GPU não tem piso — exige o modelo.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CATS_PISO.map((cat) => {
                const label = CATEGORIAS.find((c) => c.valor === cat)?.label || cat;
                return (
                  <div key={cat} className="flex items-center justify-between gap-2 rounded-lg border border-borda bg-surface2 px-2 py-1.5">
                    <span className="text-xs text-muted">{label}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted">R$</span>
                      <input
                        inputMode="numeric"
                        value={pisos[cat] ?? ''}
                        onChange={(e) => setPisos((prev) => ({ ...prev, [cat]: e.target.value }))}
                        className="w-16 rounded-md border border-borda bg-surface px-1.5 py-1 text-right text-texto"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {erro && <p className="text-sm text-vermelho">{erro}</p>}

          <button
            onClick={salvar}
            disabled={salvando}
            className="w-full rounded-xl bg-verde py-3 font-semibold text-black disabled:opacity-50"
          >
            {salvo ? '✓ Salvo' : salvando ? 'Salvando…' : 'Salvar configurações'}
          </button>
          <p className="text-center text-xs text-muted">
            dica: pra ver o efeito, volte na Triagem e toque em ↻ Recalcular.
          </p>
        </div>
      )}
    </div>
  );
}
