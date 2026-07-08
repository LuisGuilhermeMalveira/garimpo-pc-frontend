'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';
import BarraProgresso from '@/components/BarraProgresso';

/**
 * Calibração automática: print(s) de BUSCA sem escolher peça antes.
 * A IA identifica cada peça avulsa, o backend agrupa, casa com o banco
 * e grava a mediana de cada uma. Aqui só mostramos o resultado.
 */

interface Calibrada {
  peca: string;
  preco_mediana: number;
  preco_anterior: number | null;
  amostras: number;
  outliers_descartados: number;
}
interface Ignorada {
  modelo: string;
  motivo: string;
}
interface Resultado {
  anuncios_lidos: number;
  calibradas: Calibrada[];
  ignoradas: Ignorada[];
  observacoes: string;
}

export default function AutoCalibrarModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [rodando, setRodando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  async function calibrar() {
    if (arquivos.length === 0) return setErro('Solte o print da busca.');
    setErro(null);
    setRodando(true);
    try {
      const form = new FormData();
      arquivos.forEach((f) => form.append('imagem', f));
      const r = await api.postForm<Resultado>('/precos-base/calibrar-auto', form);
      setResultado(r);
      if (r.calibradas.length > 0) onSaved(); // recarrega o catálogo por trás
    } catch (e: any) {
      setErro(e.message || 'Falha na calibração automática.');
    } finally {
      setRodando(false);
    }
  }

  return (
    <Modal title="📊 Calibração automática" onClose={onClose}>
      <div className="space-y-3">
        {!resultado && (
          <>
            <p className="text-sm text-muted">
              Print de uma página de <strong className="text-texto">busca</strong> (ex.: &quot;gtx
              1660&quot; na OLX). A IA identifica cada peça avulsa, separa as variantes, descarta
              defeito/PC montado e <strong className="text-texto">grava a mediana de cada uma</strong>.
            </p>

            <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-borda bg-surface2 px-3 py-6 text-center text-sm text-muted hover:border-roxo">
              <span className="text-2xl">📊</span>
              {arquivos.length > 0 ? (
                <span className="text-texto">{arquivos.map((a) => a.name).join(', ')}</span>
              ) : (
                <span>Solte o(s) print(s) da busca</span>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => setArquivos(Array.from(e.target.files || []))}
              />
            </label>

            {erro && <p className="text-sm text-vermelho">{erro}</p>}
            {rodando && <BarraProgresso label="IA lendo a busca… identificando peças, separando variantes e calculando medianas." />}

            <button
              onClick={calibrar}
              disabled={rodando}
              className="w-full rounded-xl bg-roxo py-3 font-semibold text-white disabled:opacity-50"
            >
              {rodando ? 'Calibrando…' : 'Calibrar tudo que tiver no print'}
            </button>
          </>
        )}

        {resultado && (
          <>
            <p className="text-sm text-muted">
              {resultado.anuncios_lidos} anúncios lidos ·{' '}
              <span className="text-verde">{resultado.calibradas.length} peça(s) calibrada(s)</span>
              {resultado.ignoradas.length > 0 && (
                <> · <span className="text-amarelo">{resultado.ignoradas.length} ignorada(s)</span></>
              )}
            </p>

            {resultado.calibradas.map((c) => (
              <div key={c.peca} className="rounded-xl border border-verde/40 bg-verde/10 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">✓ {c.peca}</span>
                  <span className="font-bold text-verde">R$ {c.preco_mediana}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {c.amostras} anúncios
                  {c.outliers_descartados > 0 && <> · {c.outliers_descartados} outlier fora</>}
                  {c.preco_anterior != null && <> · antes: R$ {c.preco_anterior}</>}
                </p>
              </div>
            ))}

            {resultado.ignoradas.map((i, idx) => (
              <div key={idx} className="rounded-xl border border-borda bg-surface2 p-2.5">
                <p className="text-sm">
                  ✗ <span className="text-texto">{i.modelo}</span>{' '}
                  <span className="text-xs text-muted">— {i.motivo}</span>
                </p>
              </div>
            ))}

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-verde py-3 font-semibold text-black"
            >
              Fechar
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
