'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import type { Peca, RespostaCalibrar } from '@/lib/types';
import Modal from './Modal';
import BarraProgresso from './BarraProgresso';
import ProviderToggle, { type Provider } from './ProviderToggle';

type Etapa = 'upload' | 'revisar' | 'salvando';

export default function CalibrarModal({
  peca,
  onClose,
  onSaved,
}: {
  peca: Peca;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [etapa, setEtapa] = useState<Etapa>('upload');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [textoPrecos, setTextoPrecos] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [lendo, setLendo] = useState(false);
  const [provider, setProvider] = useState<Provider>('anthropic');
  const [resp, setResp] = useState<RespostaCalibrar | null>(null);

  // campos editáveis após a IA ler (Luís confirma/ajusta)
  const [min, setMin] = useState('');
  const [med, setMed] = useState('');
  const [max, setMax] = useState('');
  const [amostras, setAmostras] = useState('');

  async function lerPrecos() {
    setErro(null);
    if (!arquivo && !textoPrecos.trim()) {
      setErro('Solte um print ou cole os preços em texto.');
      return;
    }
    setLendo(true);
    try {
      let r: RespostaCalibrar;
      if (arquivo) {
        const form = new FormData();
        form.append('imagem', arquivo);
        form.append('peca_id', String(peca.id));
        form.append('nome_busca', peca.nome);
        form.append('provider', provider);
        r = await api.postForm('/precos-base/calibrar', form);
      } else {
        r = await api.post('/precos-base/calibrar', {
          texto: textoPrecos,
          peca_id: peca.id,
          nome_busca: peca.nome,
          provider,
        });
      }
      setResp(r);
      const f = r.faixa;
      setMin(f.preco_min != null ? String(f.preco_min) : '');
      setMed(f.preco_mediana != null ? String(f.preco_mediana) : '');
      setMax(f.preco_max != null ? String(f.preco_max) : '');
      setAmostras(String(f.amostras || 0));
      setEtapa('revisar');
    } catch (e: any) {
      setErro(e.message || 'Falha ao ler os preços.');
    } finally {
      setLendo(false);
    }
  }

  async function salvar() {
    setErro(null);
    setEtapa('salvando');
    try {
      await api.post('/precos-base', {
        peca_id: peca.id,
        preco_min: Number(min),
        preco_mediana: Number(med),
        preco_max: Number(max),
        amostras: Number(amostras) || 1,
        fonte: arquivo ? 'print busca OLX' : 'manual',
      });
      onSaved();
    } catch (e: any) {
      setErro(e.message || 'Falha ao salvar.');
      setEtapa('revisar');
    }
  }

  return (
    <Modal title={`Calibrar: ${peca.nome}`} onClose={onClose}>
      {etapa === 'upload' && (
        <div className="space-y-3">
          <ol className="space-y-1 text-sm text-muted">
            <li>1. Abra a busca da peça na OLX/Facebook ordenada por <b>Menor preço</b>.</li>
            <li>2. Solte o print aqui (PCs montados são ignorados; só a peça avulsa).</li>
          </ol>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-borda bg-surface2 px-3 py-8 text-center text-sm text-muted hover:border-roxo">
            <span className="text-2xl">📷</span>
            {arquivo ? (
              <span className="text-texto">{arquivo.name}</span>
            ) : (
              <span>Toque pra escolher / colar o print</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setArquivo(e.target.files?.[0] || null)}
            />
          </label>

          <details className="text-sm text-muted">
            <summary className="cursor-pointer">ou cole os preços em texto</summary>
            <textarea
              value={textoPrecos}
              onChange={(e) => setTextoPrecos(e.target.value)}
              placeholder="ex.: 1500, 1700, 1890, 1900, 2100"
              className="mt-2 h-20 w-full rounded-lg border border-borda bg-surface2 p-2 text-texto"
            />
          </details>

          <ProviderToggle value={provider} onChange={setProvider} />

          {erro && <p className="text-sm text-vermelho">{erro}</p>}

          {lendo && (
            <BarraProgresso label="Lendo o print… prints longos são fatiados, pode levar alguns segundos." />
          )}

          <button
            onClick={lerPrecos}
            disabled={lendo}
            className="w-full rounded-xl bg-roxo py-3 font-semibold text-white disabled:opacity-50"
          >
            {lendo ? 'Lendo preços…' : 'Ler preços'}
          </button>
        </div>
      )}

      {(etapa === 'revisar' || etapa === 'salvando') && resp && (
        <div className="space-y-3">
          <div className="rounded-lg border border-borda bg-surface2 p-3 text-sm">
            <div className="text-muted">
              IA leu <b className="text-texto">{resp.precos_lidos.length}</b> preços via{' '}
              <b className="text-texto">{resp.provider}</b>.
            </div>
            <div className="mt-2">
              <span className="text-muted">Usados: </span>
              <span className="text-verde">{resp.faixa.usados.join(', ') || '—'}</span>
            </div>
            {resp.faixa.descartados.length > 0 && (
              <div>
                <span className="text-muted">Descartados (outliers ±35%): </span>
                <span className="text-vermelho">{resp.faixa.descartados.join(', ')}</span>
              </div>
            )}
            {resp.faixa.aviso && <div className="mt-1 text-amarelo">{resp.faixa.aviso}</div>}
            {resp.observacoes && <div className="mt-1 text-muted">“{resp.observacoes}”</div>}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { l: 'mín', v: min, set: setMin },
              { l: 'mediana', v: med, set: setMed },
              { l: 'máx', v: max, set: setMax },
              { l: 'amostras', v: amostras, set: setAmostras },
            ].map((f) => (
              <label key={f.l} className="text-xs text-muted">
                {f.l}
                <input
                  inputMode="numeric"
                  value={f.v}
                  onChange={(e) => f.set(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-borda bg-surface2 p-2 text-center text-texto"
                />
              </label>
            ))}
          </div>

          {erro && <p className="text-sm text-vermelho">{erro}</p>}

          {etapa === 'salvando' && <BarraProgresso label="Salvando preço-base…" />}

          <div className="flex gap-2">
            <button
              onClick={() => setEtapa('upload')}
              disabled={etapa === 'salvando'}
              className="rounded-xl border border-borda px-4 py-3 text-sm text-muted disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              onClick={salvar}
              disabled={etapa === 'salvando'}
              className="flex-1 rounded-xl bg-verde py-3 font-semibold text-black disabled:opacity-50"
            >
              {etapa === 'salvando' ? 'Salvando…' : 'Salvar preço-base'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
