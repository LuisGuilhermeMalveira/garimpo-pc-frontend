'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIAS, type Categoria, type Peca, type NivelFrescor } from '@/lib/types';
import PecaCard from '@/components/PecaCard';
import CalibrarModal from '@/components/CalibrarModal';
import NovaPecaModal from '@/components/NovaPecaModal';

const FRESCORES: { v: NivelFrescor | 'todos'; label: string }[] = [
  { v: 'todos', label: 'Todos' },
  { v: 'fresco', label: '🟢 Fresco' },
  { v: 'recente', label: '🟡 Recente' },
  { v: 'envelhecendo', label: '🟠 Velho' },
  { v: 'defasado', label: '🔴 Defasado' },
  { v: 'sem_dados', label: '⚪ Sem preço' },
];

export default function CatalogoPage() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [fCategoria, setFCategoria] = useState<Categoria | 'todos'>('todos');
  const [fFrescor, setFFrescor] = useState<NivelFrescor | 'todos'>('todos');
  const [calibrar, setCalibrar] = useState<Peca | null>(null);
  const [novaPeca, setNovaPeca] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await api.get<Peca[]>('/pecas');
      setPecas(dados);
    } catch (e: any) {
      setErro(e.message || 'Falha ao carregar o catálogo.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function excluir(p: Peca) {
    if (!window.confirm(`Excluir "${p.nome}"? Isso apaga a peça e o preço-base dela.`)) return;
    try {
      await api.del(`/pecas/${p.id}`);
      carregar();
    } catch (e: any) {
      setErro(e.message || 'Falha ao excluir.');
    }
  }

  const filtradas = useMemo(
    () =>
      pecas.filter(
        (p) =>
          (fCategoria === 'todos' || p.categoria === fCategoria) &&
          (fFrescor === 'todos' || p.frescor.nivel === fFrescor)
      ),
    [pecas, fCategoria, fFrescor]
  );

  const grupos = useMemo(() => {
    const m = new Map<Categoria, Peca[]>();
    for (const p of filtradas) {
      if (!m.has(p.categoria)) m.set(p.categoria, []);
      m.get(p.categoria)!.push(p);
    }
    return m;
  }, [filtradas]);

  const labelCat = (c: Categoria) => CATEGORIAS.find((x) => x.valor === c)?.label || c;

  return (
    <div>
      <header className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Catálogo</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/ajuda"
            className="rounded-lg border border-borda px-2.5 py-1.5 text-sm text-muted hover:text-texto"
            title="Como usar"
          >
            ❓
          </Link>
          <Link
            href="/cidades"
            className="rounded-lg border border-borda px-2.5 py-1.5 text-sm text-muted hover:text-texto"
            title="Cidades (combustível)"
          >
            🏙️
          </Link>
          <Link
            href="/config"
            className="rounded-lg border border-borda px-2.5 py-1.5 text-sm text-muted hover:text-texto"
            title="Configurações"
          >
            ⚙️
          </Link>
          <button
            onClick={() => setNovaPeca(true)}
            className="rounded-lg bg-roxo px-3 py-1.5 text-sm font-medium text-white"
          >
            + Nova peça
          </button>
        </div>
      </header>

      {!api.temToken() && (
        <p className="mb-3 rounded-lg border border-amarelo/40 bg-amarelo/10 p-2 text-sm text-amarelo">
          Token não configurado. Defina <code>NEXT_PUBLIC_APP_TOKEN</code> no <code>.env.local</code>.
        </p>
      )}

      {/* filtros */}
      <div className="mb-3 space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip ativo={fCategoria === 'todos'} onClick={() => setFCategoria('todos')}>
            Todas
          </Chip>
          {CATEGORIAS.map((c) => (
            <Chip key={c.valor} ativo={fCategoria === c.valor} onClick={() => setFCategoria(c.valor)}>
              {c.label}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FRESCORES.map((f) => (
            <Chip key={f.v} ativo={fFrescor === f.v} onClick={() => setFFrescor(f.v as any)}>
              {f.label}
            </Chip>
          ))}
        </div>
      </div>

      {carregando && <p className="text-muted">Carregando…</p>}
      {erro && <p className="text-vermelho">{erro}</p>}

      {!carregando && !erro && filtradas.length === 0 && (
        <p className="text-muted">Nenhuma peça com esses filtros.</p>
      )}

      <div className="space-y-5">
        {[...grupos.entries()].map(([cat, lista]) => (
          <section key={cat}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {labelCat(cat)}
            </h2>
            <div className="space-y-2">
              {lista.map((p) => (
                <PecaCard key={p.id} peca={p} onCalibrar={setCalibrar} onExcluir={excluir} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {calibrar && (
        <CalibrarModal
          peca={calibrar}
          onClose={() => setCalibrar(null)}
          onSaved={() => {
            setCalibrar(null);
            carregar();
          }}
        />
      )}
      {novaPeca && (
        <NovaPecaModal
          onClose={() => setNovaPeca(false)}
          onCreated={(p) => {
            setNovaPeca(false);
            carregar();
            setCalibrar(p); // já abre a calibração da peça nova
          }}
        />
      )}
    </div>
  );
}

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${
        ativo ? 'border-roxo bg-roxo/20 text-texto' : 'border-borda bg-surface text-muted'
      }`}
    >
      {children}
    </button>
  );
}
