'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { CATEGORIAS, type Categoria, type Peca } from '@/lib/types';
import Modal from './Modal';

export default function NovaPecaModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: Peca) => void;
}) {
  const [categoria, setCategoria] = useState<Categoria>('gpu');
  const [nome, setNome] = useState('');
  const [liquidez, setLiquidez] = useState<'alta' | 'media' | 'baixa'>('media');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setErro(null);
    if (!nome.trim()) {
      setErro('Dê um nome à peça (ex.: "RTX 4060 8GB").');
      return;
    }
    setSalvando(true);
    try {
      const p = await api.post<Peca>('/pecas', { categoria, nome: nome.trim(), liquidez });
      onCreated(p);
    } catch (e: any) {
      setErro(e.message || 'Falha ao criar peça.');
      setSalvando(false);
    }
  }

  return (
    <Modal title="Nova peça" onClose={onClose}>
      <div className="space-y-3">
        <label className="block text-sm text-muted">
          Categoria
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as Categoria)}
            className="mt-1 w-full rounded-lg border border-borda bg-surface2 p-2 text-texto"
          >
            {CATEGORIAS.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-muted">
          Nome / modelo
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="ex.: RTX 4060 8GB, Ryzen 5 5600, B550"
            className="mt-1 w-full rounded-lg border border-borda bg-surface2 p-2 text-texto"
          />
        </label>

        <label className="block text-sm text-muted">
          Liquidez (quão rápido vende em MOC)
          <select
            value={liquidez}
            onChange={(e) => setLiquidez(e.target.value as any)}
            className="mt-1 w-full rounded-lg border border-borda bg-surface2 p-2 text-texto"
          >
            <option value="alta">alta</option>
            <option value="media">média</option>
            <option value="baixa">baixa</option>
          </select>
        </label>

        {erro && <p className="text-sm text-vermelho">{erro}</p>}

        <button
          onClick={salvar}
          disabled={salvando}
          className="w-full rounded-xl bg-roxo py-3 font-semibold text-white disabled:opacity-50"
        >
          {salvando ? 'Criando…' : 'Criar peça'}
        </button>
      </div>
    </Modal>
  );
}
