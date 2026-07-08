'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import {
  BASE_CATEGORIAS,
  ORDEM_CATEGORIAS,
  type Cidade,
  type RespostaAnalisar,
  type Analise,
  type PecaEdit,
  type Peca,
  type Categoria,
} from '@/lib/types';
import VeredictoCard from '@/components/VeredictoCard';
import PecasEditor from '@/components/PecasEditor';
import CalibrarModal from '@/components/CalibrarModal';
import BarraProgresso from '@/components/BarraProgresso';
import ModificadoresToggle, { type ModInfo } from '@/components/ModificadoresToggle';
import ProviderToggle, { type Provider } from '@/components/ProviderToggle';

type Origem = 'olx' | 'facebook';
type Modo = 'print' | 'texto';

export default function TriagemPage() {
  const [origem, setOrigem] = useState<Origem>('olx');
  const [modo, setModo] = useState<Modo>('print');
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [texto, setTexto] = useState('');
  const [link, setLink] = useState('');
  const [telefone, setTelefone] = useState('');
  const [titulo, setTitulo] = useState('');
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [cidadeId, setCidadeId] = useState<string>('');
  const [catalogo, setCatalogo] = useState<Peca[]>([]);
  const [provider, setProvider] = useState<Provider>('anthropic');

  const [analisando, setAnalisando] = useState(false);
  const [recalculando, setRecalculando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resp, setResp] = useState<RespostaAnalisar | null>(null);
  const [analise, setAnalise] = useState<Analise | null>(null);
  const [pecasEdit, setPecasEdit] = useState<PecaEdit[]>([]);
  const [semRemoviveis, setSemRemoviveis] = useState(false);
  const [modsOff, setModsOff] = useState<string[]>([]);
  const [modsInfo, setModsInfo] = useState<Record<string, ModInfo>>({});

  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [calibrarPeca, setCalibrarPeca] = useState<Peca | null>(null);

  useEffect(() => {
    api.get<Cidade[]>('/cidades').then(setCidades).catch(() => {});
    api.get<Peca[]>('/pecas').then(setCatalogo).catch(() => {});
  }, []);

  // abre uma prospecção salva pra editar (?edit=ID vindo do Histórico)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('edit');
    if (id) carregarParaEditar(Number(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarParaEditar(id: number) {
    setErro(null);
    try {
      const full = await api.get<any>(`/prospeccoes/${id}`);
      const raw = full.raw_extracao;
      if (!raw) return setErro('Essa prospecção não tem dados pra editar.');
      setEditingId(id);
      setTitulo(full.titulo || raw.titulo || '');
      setLink(full.link_origem || '');
      setTelefone(full.telefone || '');
      if (full.cidade_id) setCidadeId(String(full.cidade_id));
      setOrigem(full.origem === 'facebook' ? 'facebook' : 'olx');
      setPecasEdit(pecasDoParser(raw));
      setModsOff([]);
      const r = await api.post<{ analise: Analise }>('/prospeccoes/reavaliar', {
        raw_extracao: raw,
        cidade_id: full.cidade_id || undefined,
      });
      setAnalise(r.analise);
      setModsInfo(infoDe(r.analise.modificadores_aplicados));
      setResp({ provider: 'salvo', raw_extracao: raw, imagem_url: full.imagem_url || null, analise: r.analise });
    } catch (e: any) {
      setErro(e.message || 'Falha ao carregar pra editar.');
    }
  }

  const faltanteSet = useMemo(
    () => new Set((analise?.faltantes || []).map((f) => f.trim().toLowerCase())),
    [analise]
  );

  // linha "preenchida"? (tem modelo OU preço) — vazias do esqueleto são ignoradas
  function linhaPreenchida(p: PecaEdit) {
    const temModelo = !!(p.modelo && p.modelo.trim());
    const temPreco = p.preco_manual !== '' && p.preco_manual != null && Number(p.preco_manual) > 0;
    return temModelo || temPreco;
  }

  // monta o raw_extracao com as edições (preço manual vira número).
  // descarta linhas do esqueleto que ficaram em branco (peça que o PC não tem).
  function rawEditado() {
    const pecas = pecasEdit.filter(linhaPreenchida).map((p) => {
      const o: any = {
        categoria: p.categoria,
        modelo: p.modelo,
        modelo_incerto: p.modelo_incerto || false,
        quantidade: p.quantidade ?? 1,
        capacidade: p.capacidade ?? null,
        removivel: !!p.removivel,
      };
      const pm = p.preco_manual;
      if (pm !== '' && pm != null && Number(pm) > 0) o.preco_manual = Number(pm);
      return o;
    });
    return { ...(resp?.raw_extracao || {}), titulo: titulo || null, pecas };
  }

  // monta o esqueleto completo do PC: detectadas (preenchidas) + as que faltam
  // (cpu/gpu/mobo/ram/fonte/ssd/hd/gabinete) como linhas vazias pra preencher.
  function pecasDoParser(raw: any): PecaEdit[] {
    const detectadas: PecaEdit[] = (raw?.pecas || []).map((p: any) => ({
      categoria: p.categoria,
      modelo: p.modelo || '',
      modelo_incerto: p.modelo_incerto,
      quantidade: p.quantidade ?? 1,
      capacidade: p.capacidade ?? null,
      removivel: !!p.removivel,
      preco_manual: '',
    }));
    const presentes = new Set(detectadas.map((p) => p.categoria));
    const faltamBase: PecaEdit[] = BASE_CATEGORIAS.filter((c) => !presentes.has(c)).map((c) => ({
      categoria: c as Categoria,
      modelo: '',
      quantidade: 1,
      removivel: false,
      preco_manual: '',
    }));
    const todas = [...detectadas, ...faltamBase];
    todas.sort(
      (a, b) => ORDEM_CATEGORIAS.indexOf(a.categoria) - ORDEM_CATEGORIAS.indexOf(b.categoria)
    );
    return todas;
  }

  async function analisar() {
    setErro(null);
    setSalvo(false);
    setSemRemoviveis(false);
    setEditingId(null); // analisar um anúncio novo cria nova prospecção
    if (modo === 'print' && arquivos.length === 0) return setErro('Solte o(s) print(s) do anúncio.');
    if (modo === 'texto' && !texto.trim()) return setErro('Cole o texto do anúncio.');
    setAnalisando(true);
    try {
      let r: RespostaAnalisar;
      if (modo === 'print') {
        const form = new FormData();
        arquivos.forEach((f) => form.append('imagem', f));
        form.append('origem', origem);
        form.append('provider', provider);
        if (cidadeId) form.append('cidade_id', cidadeId);
        if (link.trim()) form.append('link', link.trim());
        r = await api.postForm('/prospeccoes/analisar', form);
      } else {
        r = await api.post('/prospeccoes/analisar', {
          texto,
          link: link.trim() || undefined,
          origem,
          provider,
          cidade_id: cidadeId ? Number(cidadeId) : undefined,
        });
      }
      setResp(r);
      setAnalise(r.analise);
      setTitulo((r.raw_extracao && r.raw_extracao.titulo) || '');
      if (r.raw_extracao && r.raw_extracao.telefone) setTelefone(r.raw_extracao.telefone);
      setPecasEdit(pecasDoParser(r.raw_extracao));
      setModsOff([]);
      setModsInfo(infoDe(r.analise.modificadores_aplicados));
      if (r.analise.cidade) setCidadeId(String(r.analise.cidade.id));
    } catch (e: any) {
      setErro(e.message || 'Falha ao analisar.');
    } finally {
      setAnalisando(false);
    }
  }

  function infoDe(applied: Analise['modificadores_aplicados']): Record<string, ModInfo> {
    const o: Record<string, ModInfo> = {};
    (applied || []).forEach((m) => (o[m.nome] = { sentido: m.sentido, percentual: m.percentual }));
    return o;
  }

  async function reavaliar(opts: {
    excluir_removiveis?: boolean;
    cidade_id?: string;
    modificadores_off?: string[];
  }) {
    if (!resp) return;
    setRecalculando(true);
    setErro(null);
    try {
      const raw = rawEditado();
      const body: any = { raw_extracao: raw };
      body.excluir_removiveis = opts.excluir_removiveis ?? semRemoviveis;
      body.modificadores_off = opts.modificadores_off ?? modsOff;
      const cid = opts.cidade_id ?? cidadeId;
      if (cid) body.cidade_id = Number(cid);
      const r = await api.post<{ analise: Analise }>('/prospeccoes/reavaliar', body);
      setAnalise(r.analise);
      setModsInfo((prev) => ({ ...prev, ...infoDe(r.analise.modificadores_aplicados) }));
      setResp({ ...resp, raw_extracao: raw }); // edições passam a valer pro salvar
    } catch (e: any) {
      setErro(e.message || 'Falha ao recalcular.');
    } finally {
      setRecalculando(false);
    }
  }

  function toggleMod(nome: string) {
    const off = new Set(modsOff);
    if (off.has(nome)) off.delete(nome);
    else off.add(nome);
    const arr = [...off];
    setModsOff(arr);
    reavaliar({ modificadores_off: arr });
  }

  async function acharOuCriarPeca(categoria: string, nome: string): Promise<Peca> {
    try {
      return await api.post<Peca>('/pecas', { categoria, nome });
    } catch (e: any) {
      // já existe -> busca no catálogo
      const todas = await api.get<Peca[]>('/pecas');
      const achou = todas.find(
        (p) => p.categoria === categoria && p.nome.trim().toLowerCase() === nome.trim().toLowerCase()
      );
      if (achou) return achou;
      throw e;
    }
  }

  async function calibrarNoBanco(p: PecaEdit) {
    setErro(null);
    if (!p.modelo.trim()) return setErro('Dê um nome à peça antes de calibrar.');
    try {
      const peca = await acharOuCriarPeca(p.categoria, p.modelo.trim());
      setCalibrarPeca(peca);
    } catch (e: any) {
      setErro(e.message || 'Falha ao preparar a calibração.');
    }
  }

  async function salvar() {
    if (!resp) return;
    setSalvando(true);
    setErro(null);
    try {
      const body = {
        raw_extracao: rawEditado(),
        titulo: titulo.trim() || undefined,
        origem,
        cidade_id: cidadeId ? Number(cidadeId) : undefined,
        modificadores_off: modsOff,
        link_origem: link.trim() || undefined,
        telefone: telefone.trim() || undefined,
        imagem_url: resp.imagem_url || undefined,
      };
      if (editingId) await api.put(`/prospeccoes/${editingId}`, body);
      else await api.post('/prospeccoes', body);
      setSalvo(true);
    } catch (e: any) {
      setErro(e.message || 'Falha ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  const temRemoviveis = (analise?.negociacao.removiveis.length || 0) > 0;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">🔍 Triagem</h1>

      {editingId && (
        <p className="rounded-lg border border-roxo/40 bg-roxo/10 p-2 text-sm text-texto">
          ✏️ Editando uma prospecção salva — ajuste as peças e toque em <b>Salvar alterações</b>.
        </p>
      )}

      {/* input */}
      <div className="space-y-3 rounded-2xl border border-borda bg-surface p-3">
        <div className="flex gap-2">
          {(['olx', 'facebook'] as Origem[]).map((o) => (
            <button
              key={o}
              onClick={() => setOrigem(o)}
              className={`flex-1 rounded-lg border py-2 text-sm capitalize ${
                origem === o ? 'border-roxo bg-roxo/20' : 'border-borda text-muted'
              }`}
            >
              {o}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {(['print', 'texto'] as Modo[]).map((m) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className={`flex-1 rounded-lg border py-2 text-sm ${
                modo === m ? 'border-roxo bg-roxo/20' : 'border-borda text-muted'
              }`}
            >
              {m === 'print' ? '📷 Print' : '📝 Texto'}
            </button>
          ))}
        </div>

        {modo === 'print' && (
          <>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-borda bg-surface2 px-3 py-6 text-center text-sm text-muted hover:border-roxo">
              <span className="text-2xl">📷</span>
              {arquivos.length > 0 ? (
                <span className="text-texto">
                  {arquivos.length} print(s): {arquivos.map((a) => a.name).join(', ')}
                </span>
              ) : (
                <span>Solte o(s) print(s) do anúncio — pode mandar vários (foto+specs, descrição…)</span>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => setArquivos(Array.from(e.target.files || []))}
              />
            </label>
            {arquivos.length > 1 && (
              <p className="text-xs text-muted">
                {arquivos.length} prints serão lidos juntos como o mesmo PC.
              </p>
            )}
          </>
        )}

        {modo === 'texto' && (
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Cole o texto do anúncio (specs, preço, cidade…)"
            className="h-28 w-full rounded-lg border border-borda bg-surface2 p-2 text-texto"
          />
        )}

        {/* link opcional — anexa junto pra ficar salvo (não precisa) */}
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="🔗 Link do anúncio (opcional — fica salvo no histórico)"
          className="w-full rounded-lg border border-borda bg-surface2 px-2 py-2 text-sm text-texto"
        />

        {/* telefone/WhatsApp do vendedor — vira botão de contato no histórico */}
        <input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          inputMode="tel"
          placeholder="📱 WhatsApp do vendedor (opcional — ex.: 38 99999-9999)"
          className="w-full rounded-lg border border-borda bg-surface2 px-2 py-2 text-sm text-texto"
        />

        <label className="block text-sm text-muted">
          Cidade origem
          <select
            value={cidadeId}
            onChange={(e) => {
              setCidadeId(e.target.value);
              if (resp) reavaliar({ cidade_id: e.target.value });
            }}
            className="mt-1 w-full rounded-lg border border-borda bg-surface2 p-2 text-texto"
          >
            <option value="">(detectar do anúncio)</option>
            {cidades.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>

        <ProviderToggle value={provider} onChange={setProvider} />

        {erro && <p className="text-sm text-vermelho">{erro}</p>}
        {analisando && <BarraProgresso label="Analisando o anúncio… lendo specs, casando preços e calculando." />}

        <button
          onClick={analisar}
          disabled={analisando}
          className="w-full rounded-xl bg-roxo py-3 font-semibold text-white disabled:opacity-50"
        >
          {analisando ? 'Analisando…' : 'Analisar'}
        </button>
      </div>

      {/* nome do PC (puxado do anúncio, editável) */}
      {analise && (
        <div className="rounded-2xl border border-borda bg-surface p-3">
          <label className="text-xs text-muted">Nome do PC (puxado do anúncio — edite se quiser)</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="ex.: PC Gamer RTX 3060 Ti + Ryzen 5 5600"
            className="mt-1 w-full rounded-lg border border-borda bg-surface2 px-2 py-2 text-sm text-texto"
          />
        </div>
      )}

      {/* editor de peças */}
      {analise && (
        <PecasEditor
          pecas={pecasEdit}
          setPecas={setPecasEdit}
          catalogo={catalogo}
          faltanteSet={faltanteSet}
          onCalibrar={calibrarNoBanco}
          onRecalcular={() => reavaliar({})}
          recalculando={recalculando}
        />
      )}

      {/* modificadores ligáveis/desligáveis */}
      {analise && <ModificadoresToggle info={modsInfo} off={modsOff} onToggle={toggleMod} />}

      {/* resultado */}
      {analise && (
        <div className="space-y-3">
          <VeredictoCard analise={analise} />

          <div className="flex flex-wrap gap-2">
            {temRemoviveis && (
              <button
                onClick={() => {
                  const novo = !semRemoviveis;
                  setSemRemoviveis(novo);
                  reavaliar({ excluir_removiveis: novo });
                }}
                className={`rounded-xl border px-4 py-2.5 text-sm ${
                  semRemoviveis ? 'border-roxo bg-roxo/20' : 'border-borda text-muted'
                }`}
              >
                {semRemoviveis ? '↩︎ Com removíveis' : '⊖ Simular sem removíveis'}
              </button>
            )}
            <button
              onClick={salvar}
              disabled={salvando || salvo}
              className="flex-1 rounded-xl bg-verde py-2.5 font-semibold text-black disabled:opacity-50"
            >
              {salvo
                ? editingId
                  ? '✓ Alterações salvas'
                  : '✓ Salvo no histórico'
                : salvando
                ? 'Salvando…'
                : editingId
                ? 'Salvar alterações'
                : 'Salvar (guarda no histórico)'}
            </button>
          </div>
          <p className="text-center text-xs text-muted">lido via {resp?.provider} · veja depois em Histórico</p>
        </div>
      )}

      {calibrarPeca && (
        <CalibrarModal
          peca={calibrarPeca}
          onClose={() => setCalibrarPeca(null)}
          onSaved={() => {
            setCalibrarPeca(null);
            api.get<Peca[]>('/pecas').then(setCatalogo).catch(() => {}); // recarrega banco
            reavaliar({}); // banco atualizado -> recalcula o veredito
          }}
        />
      )}
    </div>
  );
}
