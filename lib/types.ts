// Tipos espelhando as respostas do garimpo-pc-backend.

export type Categoria =
  | 'gpu'
  | 'cpu'
  | 'mobo'
  | 'ram'
  | 'fonte'
  | 'ssd'
  | 'hd'
  | 'cooler'
  | 'gabinete'
  | 'monitor'
  | 'periferico'
  | 'outro';

export type NivelFrescor = 'fresco' | 'recente' | 'envelhecendo' | 'defasado' | 'sem_dados';

export interface Frescor {
  dias: number | null;
  nivel: NivelFrescor;
  emoji: string;
  label: string;
}

export interface Tendencia {
  direcao: 'subindo' | 'caindo' | 'estavel' | 'unico' | 'sem_dados';
  calibracoes: number;
  valores: number[];
  variacao_pct?: number;
}

export interface PrecoBase {
  preco_min: number;
  preco_mediana: number;
  preco_max: number;
  amostras: number;
  fonte: string | null;
  data_calibracao: string;
}

export interface Peca {
  id: number;
  categoria: Categoria;
  nome: string;
  tipo: 'inteira' | 'unitaria';
  capacidade: number | null;
  liquidez: 'alta' | 'media' | 'baixa';
  dias_venda_estim: number | null;
  observacao: string | null;
  preco_base: PrecoBase | null;
  frescor: Frescor;
  tendencia: Tendencia;
  total_calibracoes: number;
}

export interface Faixa {
  ok: boolean;
  usados: number[];
  descartados: number[];
  preco_min: number | null;
  preco_mediana: number | null;
  preco_max: number | null;
  amostras: number;
  tolerancia: number;
  aviso: string | null;
}

export interface RespostaCalibrar {
  peca_id: number | null;
  peca: string | null;
  nome_busca: string | null;
  provider: string;
  precos_lidos: number[];
  observacoes: string;
  faixa: Faixa;
  imagem_url: string | null;
}

// ---------- Triagem (a lupa) ----------
export type Veredito = 'compensa' | 'marginal' | 'nao_compensa' | 'incompleto';

export interface ItemAvaliado {
  categoria: Categoria;
  modelo_extraido: string;
  modelo_incerto: boolean;
  removivel: boolean;
  peca_id: number | null;
  peca_nome: string | null;
  quantidade: number;
  preco_unitario: number | null;
  preco_aplicado: number | null;
  aplicado_min?: number | null;
  aplicado_max?: number | null;
  origem: 'real' | 'estimado';
  manual?: boolean;
  piso?: boolean;
  peca_referencia_id: number | null;
  frescor_dias: number | null;
  frescor: Frescor;
  liquidez: string | null;
  faltante: boolean;
}

export interface ModAplicado {
  modificador_id: number | null;
  nome: string;
  sentido: 'sobe' | 'desce';
  percentual: number;
  argumento: string | null;
}

export interface Alerta {
  nivel: 'amarelo' | 'vermelho' | 'info';
  msg: string;
}

export interface Analise {
  veredito: Veredito;
  itens: ItemAvaliado[];
  faltantes: string[];
  valor_bruto_pecas: number;
  valor_bruto_min: number;
  valor_bruto_max: number;
  modificadores_aplicados: ModAplicado[];
  soma_modificadores_pct: number;
  valor_modificado: number;
  fator_realizacao: number;
  valor_revenda: number;
  cidade: { id: number; nome: string } | null;
  tem_entrega: boolean;
  custo_aquisicao: number;
  custo_recuperacao: number;
  margem_risco: number;
  preco_pedido: number | null;
  preco_pix: number | null;
  lucro_liquido: number;
  lucro_percentual: number | null;
  dias_ate_vender: number | null;
  lucro_por_mes: number | null;
  negociacao: {
    preco_pedido: number | null;
    preco_teto: number;
    preco_oferta: number;
    argumentos: string[];
    removiveis: { modelo_extraido: string; preco_aplicado: number }[];
  };
  canibalizacao: {
    montado: number;
    valor_canibalizado: number;
    diff: number;
    vale_a_pena: boolean;
    recomendacao: string;
  };
  score: { valor: number; fatores: string[]; trava: boolean };
  travas: string[];
  alertas: Alerta[];
}

export interface RespostaAnalisar {
  provider: string;
  raw_extracao: any;
  imagem_url: string | null;
  analise: Analise;
}

export interface Cidade {
  id: number;
  nome: string;
  km_ida_volta: number;
  custo_aquisicao: number;
}

export interface Config {
  nome?: string;
  email?: string;
  fator_realizacao: number;
  piso_lucro: number;
  margem_risco_pct: number;
  custo_km: number;
  pisos?: Record<string, number | null>;
}

export type StatusProspeccao = 'analisado' | 'negociando' | 'comprei' | 'passei';

export interface Prospeccao {
  id: number;
  titulo: string | null;
  origem: 'olx' | 'facebook' | 'outro';
  cidade_id: number | null;
  preco_pedido: number | null;
  preco_pix: number | null;
  veredito: Veredito;
  lucro_liquido: number | null;
  lucro_por_mes: number | null;
  dias_ate_vender: number | null;
  preco_teto: number | null;
  preco_oferta: number | null;
  score_confianca: number | null;
  possivel_garimpo: boolean;
  motivo_garimpo: string | null;
  link_origem: string | null;
  telefone: string | null;
  imagem_url: string | null;
  status: StatusProspeccao;
  criado_em: string;
  raw_extracao?: any;
}

export const CATEGORIAS: { valor: Categoria; label: string }[] = [
  { valor: 'gpu', label: 'Placa de vídeo' },
  { valor: 'cpu', label: 'Processador' },
  { valor: 'mobo', label: 'Placa-mãe' },
  { valor: 'ram', label: 'Memória RAM' },
  { valor: 'fonte', label: 'Fonte' },
  { valor: 'ssd', label: 'SSD' },
  { valor: 'hd', label: 'HD' },
  { valor: 'cooler', label: 'Cooler' },
  { valor: 'gabinete', label: 'Gabinete' },
  { valor: 'monitor', label: 'Monitor' },
  { valor: 'periferico', label: 'Periférico' },
  { valor: 'outro', label: 'Outro' },
];

// Esqueleto de um PC desktop: peças que SEMPRE devem aparecer na triagem
// (mesmo não detectadas) pra não esquecer nenhuma.
export const BASE_CATEGORIAS: Categoria[] = [
  'cpu',
  'gpu',
  'mobo',
  'ram',
  'fonte',
  'ssd',
  'hd',
  'gabinete',
];

// Ordem canônica de exibição das peças no editor.
export const ORDEM_CATEGORIAS: Categoria[] = [
  'cpu',
  'gpu',
  'mobo',
  'ram',
  'fonte',
  'ssd',
  'hd',
  'cooler',
  'gabinete',
  'monitor',
  'periferico',
  'outro',
];

// Linha editável de peça na triagem (espelha raw_extracao.pecas + preço manual).
export interface PecaEdit {
  categoria: Categoria;
  modelo: string;
  modelo_incerto?: boolean;
  quantidade?: number | null;
  capacidade?: number | null;
  removivel?: boolean;
  preco_manual?: number | string | null;
  // estado de UI (não vai pro backend): 'estimar' = preço na mão; 'banco' = pegar do catálogo
  _modo?: 'estimar' | 'banco';
}
