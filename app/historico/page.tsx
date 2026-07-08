'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Prospeccao, StatusProspeccao, Analise } from '@/lib/types';
import VeredictoCard from '@/components/VeredictoCard';
import Modal from '@/components/Modal';

const VEREDITO: Record<string, { emoji: string; cor: string }> = {
  compensa: { emoji: '✅', cor: 'text-verde' },
  marginal: { emoji: '⚠️', cor: 'text-amarelo' },
  nao_compensa: { emoji: '❌', cor: 'text-vermelho' },
  incompleto: { emoji: '⚠️', cor: 'text-amarelo' },
};

function brl(n: number | null) {
  if (n == null) return '—';
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}
function data(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
// monta o link do WhatsApp (só dígitos, com DDI 55 do Brasil se faltar)
function waLink(tel: string) {
  const d = tel.replace(/\D/g, '');
  const num = d.startsWith('55') ? d : `55${d}`;
  return `https://wa.me/${num}`;
}

type Filtro = 'todos' | 'analisado' | 'negociando' | 'comprei' | 'passei';

export default function HistoricoPage() {
  const [lista, setLista] = useState<Prospeccao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [detalhe, setDetalhe] = useState<{ p: Prospeccao; analise: Analise | null } | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const path = filtro === 'todos' ? '/prospeccoes' : `/prospeccoes?status=${filtro}`;
      setLista(await api.get<Prospeccao[]>(path));
    } catch (e: any) {
      setErro(e.message || 'Falha ao carregar.');
    } finally {
      setCarregando(false);
    }
  }, [filtro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function marcar(p: Prospeccao, status: StatusProspeccao) {
    // clicar no status já ativo desmarca (volta pra "em aberto")
    const novo: StatusProspeccao = p.status === status ? 'analisado' : status;
    try {
      await api.patch(`/prospeccoes/${p.id}`, { status: novo });
      carregar();
    } catch (e: any) {
      setErro(e.message || 'Falha ao atualizar.');
    }
  }

  async function renomear(p: Prospeccao) {
    const novo = window.prompt('Novo nome do PC:', p.titulo || '');
    if (novo === null) return; // cancelou
    try {
      await api.patch(`/prospeccoes/${p.id}`, { titulo: novo.trim() || null });
      carregar();
    } catch (e: any) {
      setErro(e.message || 'Falha ao renomear.');
    }
  }

  async function editarTelefone(p: Prospeccao) {
    const novo = window.prompt('WhatsApp do vendedor (com DDD):', p.telefone || '');
    if (novo === null) return;
    try {
      await api.patch(`/prospeccoes/${p.id}`, { telefone: novo.trim() || null });
      carregar();
    } catch (e: any) {
      setErro(e.message || 'Falha ao salvar telefone.');
    }
  }

  async function excluir(p: Prospeccao) {
    if (!window.confirm(`Excluir "${p.titulo || 'PC sem título'}" do histórico?`)) return;
    try {
      await api.del(`/prospeccoes/${p.id}`);
      carregar();
    } catch (e: any) {
      setErro(e.message || 'Falha ao excluir.');
    }
  }

  async function abrir(p: Prospeccao) {
    setDetalhe({ p, analise: null });
    try {
      const full = await api.get<Prospeccao>(`/prospeccoes/${p.id}`);
      if (full.raw_extracao) {
        const r = await api.post<{ analise: Analise }>('/prospeccoes/reavaliar', {
          raw_extracao: full.raw_extracao,
          cidade_id: full.cidade_id || undefined,
        });
        setDetalhe({ p, analise: r.analise });
      }
    } catch {
      /* mostra só o resumo se falhar */
    }
  }

  const FILTROS: { v: Filtro; label: string }[] = [
    { v: 'todos', label: 'Todos' },
    { v: 'analisado', label: 'Em aberto' },
    { v: 'negociando', label: 'Negociando' },
    { v: 'comprei', label: 'Comprei' },
    { v: 'passei', label: 'Passei' },
  ];

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">🕑 Histórico</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map((f) => (
          <button
            key={f.v}
            onClick={() => setFiltro(f.v)}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${
              filtro === f.v ? 'border-roxo bg-roxo/20 text-texto' : 'border-borda bg-surface text-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {carregando && <p className="text-muted">Carregando…</p>}
      {erro && <p className="text-vermelho">{erro}</p>}
      {!carregando && lista.length === 0 && (
        <p className="text-muted">Nada por aqui ainda. Analise um PC na Triagem e toque em Salvar.</p>
      )}

      <div className="space-y-2">
        {lista.map((p) => {
          const v = VEREDITO[p.veredito] || VEREDITO.incompleto;
          return (
            <div key={p.id} className="rounded-xl border border-borda bg-surface p-3">
              <button onClick={() => abrir(p)} className="w-full text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold">
                    <span className={v.cor}>{v.emoji}</span> {p.titulo || 'PC sem título'}
                  </span>
                  <span className={`shrink-0 text-sm font-bold ${(p.lucro_liquido || 0) > 0 ? 'text-verde' : 'text-vermelho'}`}>
                    {(p.lucro_liquido || 0) > 0 ? '+' : ''}R$ {brl(p.lucro_liquido)}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  {p.origem.toUpperCase()} · oferta R$ {brl(p.preco_oferta)} · {data(p.criado_em)}
                  {p.status !== 'analisado' && <span className="ml-1 text-texto">· {p.status}</span>}
                </div>
              </button>

              <div className="mt-2 flex flex-wrap gap-2">
                {p.link_origem && (
                  <a
                    href={p.link_origem}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-borda px-2.5 py-1 text-xs text-muted hover:text-texto"
                  >
                    🔗 Ver anúncio
                  </a>
                )}
                <button
                  onClick={() => marcar(p, 'negociando')}
                  className={`rounded-lg border px-2.5 py-1 text-xs ${
                    p.status === 'negociando'
                      ? 'border-azul bg-azul/20 font-semibold text-azul'
                      : 'border-azul/40 text-azul'
                  }`}
                >
                  {p.status === 'negociando' ? '✓ Negociando' : 'Negociando'}
                </button>
                <button
                  onClick={() => marcar(p, 'comprei')}
                  className={`rounded-lg border px-2.5 py-1 text-xs ${
                    p.status === 'comprei'
                      ? 'border-verde bg-verde/20 font-semibold text-verde'
                      : 'border-verde/40 text-verde'
                  }`}
                >
                  {p.status === 'comprei' ? '✓ Comprei' : 'Comprei'}
                </button>
                <button
                  onClick={() => marcar(p, 'passei')}
                  className={`rounded-lg border px-2.5 py-1 text-xs ${
                    p.status === 'passei'
                      ? 'border-vermelho bg-vermelho/15 font-semibold text-vermelho'
                      : 'border-borda text-muted'
                  }`}
                >
                  {p.status === 'passei' ? '✓ Passei' : 'Passei'}
                </button>
                {p.telefone && (
                  <a
                    href={waLink(p.telefone)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-verde/50 px-2.5 py-1 text-xs text-verde"
                  >
                    💬 WhatsApp
                  </a>
                )}
                <button
                  onClick={() => editarTelefone(p)}
                  className="ml-auto rounded-lg border border-borda px-2 py-1 text-xs text-muted hover:border-roxo hover:text-texto"
                  title={p.telefone ? 'Editar WhatsApp' : 'Adicionar WhatsApp'}
                  aria-label="Telefone"
                >
                  📱
                </button>
                <button
                  onClick={() => renomear(p)}
                  className="rounded-lg border border-borda px-2 py-1 text-xs text-muted hover:border-roxo hover:text-texto"
                  title="Renomear"
                  aria-label="Renomear"
                >
                  ✏️
                </button>
                <button
                  onClick={() => excluir(p)}
                  className="rounded-lg border border-borda px-2 py-1 text-xs text-muted hover:border-vermelho hover:text-vermelho"
                  title="Excluir do histórico"
                  aria-label="Excluir"
                >
                  🗑
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {detalhe && (
        <Modal title={detalhe.p.titulo || 'Prospecção'} onClose={() => setDetalhe(null)}>
          <Link
            href={`/triagem?edit=${detalhe.p.id}`}
            className="mb-3 block w-full rounded-xl bg-roxo py-2.5 text-center text-sm font-semibold text-white"
          >
            🔧 Editar peças (reabrir na triagem)
          </Link>
          {detalhe.analise ? (
            <VeredictoCard analise={detalhe.analise} />
          ) : (
            <p className="text-muted">Carregando o card…</p>
          )}
        </Modal>
      )}
    </div>
  );
}
