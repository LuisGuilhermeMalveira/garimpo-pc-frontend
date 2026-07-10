'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { numBr } from '@/lib/num';
import type { Cidade, Config } from '@/lib/types';

function brl(n: number) {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

export default function CidadesPage() {
  const [lista, setLista] = useState<Cidade[]>([]);
  const [custoKm, setCustoKm] = useState(0.42);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // form de nova cidade
  const [nome, setNome] = useState('');
  const [km, setKm] = useState('');
  const [custo, setCusto] = useState(''); // vazio = calcula pelo km

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [cs, cfg] = await Promise.all([
        api.get<Cidade[]>('/cidades'),
        api.get<Config>('/config'),
      ]);
      setLista(cs);
      setCustoKm(Number(cfg.custo_km) || 0.42);
    } catch (e: any) {
      setErro(e.message || 'Falha ao carregar.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // prévia do combustível enquanto digita o km (se não digitou o custo na mão)
  const kmNum = numBr(km);
  const previa = kmNum != null && custo === '' ? Math.round(kmNum * custoKm) : null;

  async function adicionar() {
    const kmV = numBr(km);
    if (!nome.trim() || kmV == null) {
      setErro('Preencha o nome e o km (ida + volta) com um número.');
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await api.post('/cidades', {
        nome: nome.trim(),
        km_ida_volta: kmV,
        custo_aquisicao: numBr(custo) ?? undefined,
      });
      setNome('');
      setKm('');
      setCusto('');
      carregar();
    } catch (e: any) {
      setErro(e.message || 'Falha ao adicionar.');
    } finally {
      setSalvando(false);
    }
  }

  async function editarKm(c: Cidade) {
    const novo = window.prompt(`Km ida+volta de ${c.nome}:`, String(c.km_ida_volta));
    if (novo === null) return;
    const v = numBr(novo);
    if (v == null) return setErro(`"${novo}" não é um número válido.`);
    try {
      // manda só o km -> backend recalcula o combustível pelo custo_km
      await api.patch(`/cidades/${c.id}`, { km_ida_volta: v });
      carregar();
    } catch (e: any) {
      setErro(e.message || 'Falha ao salvar.');
    }
  }

  async function editarCusto(c: Cidade) {
    const novo = window.prompt(`Combustível de ${c.nome} (R$, ida+volta):`, String(c.custo_aquisicao));
    if (novo === null) return;
    const v = numBr(novo);
    if (v == null) return setErro(`"${novo}" não é um número válido.`);
    try {
      await api.patch(`/cidades/${c.id}`, { custo_aquisicao: v });
      carregar();
    } catch (e: any) {
      setErro(e.message || 'Falha ao salvar.');
    }
  }

  async function excluir(c: Cidade) {
    if (!window.confirm(`Excluir ${c.nome}?`)) return;
    try {
      await api.del(`/cidades/${c.id}`);
      carregar();
    } catch (e: any) {
      setErro(e.message || 'Falha ao excluir.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/catalogo" className="text-muted hover:text-texto">
          ←
        </Link>
        <h1 className="text-xl font-bold">🏙️ Cidades</h1>
      </div>

      <p className="text-sm text-muted">
        Quando o PC é de outra cidade, o app desconta o <strong>combustível</strong> (ida + volta) do
        lucro. Cadastre aqui o km de cada cidade — o custo é calculado por <strong>R${custoKm.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/km</strong>{' '}
        (ajustável em ⚙️), mas você pode sobrescrever o valor.
      </p>

      {/* nova cidade */}
      <div className="rounded-xl border border-borda bg-surface p-3">
        <h2 className="mb-2 text-sm font-semibold">+ Nova cidade</h2>
        <div className="space-y-2">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome (ex.: São Francisco)"
            className="w-full rounded-lg border border-borda bg-surface2 px-3 py-2 text-texto placeholder:text-muted"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted">Km ida + volta</label>
              <input
                inputMode="numeric"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                placeholder="ex.: 200"
                className="w-full rounded-lg border border-borda bg-surface2 px-3 py-2 text-texto placeholder:text-muted"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted">Combustível (opcional)</label>
              <input
                inputMode="numeric"
                value={custo}
                onChange={(e) => setCusto(e.target.value)}
                placeholder={previa != null ? `auto: R$${previa}` : 'auto pelo km'}
                className="w-full rounded-lg border border-borda bg-surface2 px-3 py-2 text-texto placeholder:text-muted"
              />
            </div>
          </div>
          {previa != null && (
            <p className="text-xs text-muted">
              Combustível calculado: <span className="text-texto">R${previa}</span> ({km} km × R$
              {custoKm.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). Digite um valor pra sobrescrever.
            </p>
          )}
          <button
            onClick={adicionar}
            disabled={salvando}
            className="w-full rounded-xl bg-roxo py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {salvando ? 'Adicionando…' : 'Adicionar cidade'}
          </button>
        </div>
      </div>

      {erro && <p className="text-sm text-vermelho">{erro}</p>}
      {carregando && <p className="text-muted">Carregando…</p>}

      {/* lista */}
      <div className="space-y-2">
        {!carregando && lista.length === 0 && (
          <p className="text-muted">Nenhuma cidade ainda.</p>
        )}
        {lista.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-borda bg-surface p-3"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold">{c.nome}</p>
              <p className="text-xs text-muted">
                {c.km_ida_volta} km · combustível{' '}
                <span className={c.custo_aquisicao > 0 ? 'text-amarelo' : 'text-verde'}>
                  {c.custo_aquisicao > 0 ? `−R$${brl(c.custo_aquisicao)}` : 'R$0 (local)'}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => editarKm(c)}
                className="rounded-lg border border-borda px-2 py-1 text-xs text-muted hover:border-roxo hover:text-texto"
                title="Editar km"
              >
                km
              </button>
              <button
                onClick={() => editarCusto(c)}
                className="rounded-lg border border-borda px-2 py-1 text-xs text-muted hover:border-roxo hover:text-texto"
                title="Editar combustível"
              >
                R$
              </button>
              <button
                onClick={() => excluir(c)}
                className="rounded-lg border border-borda px-2 py-1 text-xs text-muted hover:border-vermelho hover:text-vermelho"
                title="Excluir"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
