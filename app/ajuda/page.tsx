'use client';

import Link from 'next/link';

/** Página de ajuda: como usar o app + instalar a extensão do Chrome. */

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-borda bg-surface p-4">
      <h2 className="mb-2 text-base font-bold">{titulo}</h2>
      <div className="space-y-2 text-sm text-muted">{children}</div>
    </section>
  );
}

function Passo({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-roxo/20 text-xs font-bold text-roxo">
        {n}
      </span>
      <p className="text-sm text-muted">{children}</p>
    </div>
  );
}

export default function AjudaPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/catalogo" className="text-muted hover:text-texto">
          ←
        </Link>
        <h1 className="text-xl font-bold">❓ Como usar</h1>
      </div>

      <Secao titulo="⛏️ O que é o garimpo-pc">
        <p>
          Você acha um PC usado na OLX ou no Facebook. O app decide{' '}
          <strong className="text-texto">se compensa comprar pra revender</strong> — soma o valor
          real de cada peça, desconta combustível e riscos, e te dá o veredito com a conta aberta e
          o preço de oferta.
        </p>
      </Secao>

      <Secao titulo="📱 Instalar no celular (PWA)">
        <Passo n={1}>
          Abra <strong className="text-texto">garimpo-pc-frontend.vercel.app</strong> no Chrome do
          celular.
        </Passo>
        <Passo n={2}>
          Menu <strong className="text-texto">⋮</strong> →{' '}
          <strong className="text-texto">&quot;Adicionar à tela inicial&quot;</strong> (ou
          &quot;Instalar app&quot;).
        </Passo>
        <Passo n={3}>Vira um app com ícone, em tela cheia.</Passo>
      </Secao>

      <Secao titulo="🔄 O fluxo do garimpo">
        <Passo n={1}>
          <strong className="text-texto">Calibrar preços</strong> — no Catálogo, toque numa peça →
          Calibrar → mande o print da busca da OLX. A IA lê os anúncios e grava a mediana. Peça com
          preço 🟢 fresco = veredito confiável.
        </Passo>
        <Passo n={2}>
          <strong className="text-texto">Triagem</strong> — achou um PC? Mande print(s) do anúncio
          (ou o texto) na aba Triagem. A IA extrai as peças; você revisa, adiciona o que faltou e
          recalcula.
        </Passo>
        <Passo n={3}>
          <strong className="text-texto">Veredito</strong> — ✅ compensa · ⚠️ marginal · ❌ não
          compensa. O card mostra toda a matemática: soma das peças, realização (90%), combustível
          da cidade, risco, lucro líquido e o preço de oferta.
        </Passo>
        <Passo n={4}>
          <strong className="text-texto">Negociar</strong> — salve no Histórico, use o botão 💬
          WhatsApp, marque <span className="text-azul">Negociando</span> →{' '}
          <span className="text-verde">Comprei</span> ou <span className="text-vermelho">Passei</span>.
        </Passo>
        <p className="pt-1">
          🏙️ <strong className="text-texto">Cidades</strong>: cadastre o km de cada cidade da
          região (botão 🏙️ no Catálogo). PC de fora = combustível descontado do lucro
          automaticamente.
        </p>
      </Secao>

      <Secao titulo="💻 Extensão do Chrome (garimpar no PC)">
        <p>
          Um clique na página do anúncio: ela tira{' '}
          <strong className="text-texto">print da página inteira</strong>, manda pra IA, salva no
          histórico e abre a triagem pronta. Também guarda uma cópia do print em{' '}
          <strong className="text-texto">Downloads\garimpo-pc\</strong>.
        </p>

        <a
          href="/garimpo-pc-extensao.zip"
          download
          className="block w-full rounded-xl bg-roxo py-3 text-center font-semibold text-white"
        >
          ⬇️ Baixar a extensão (.zip)
        </a>

        <h3 className="pt-2 font-semibold text-texto">Instalação (uma vez só):</h3>
        <Passo n={1}>
          Baixe o .zip acima e <strong className="text-texto">extraia</strong> (botão direito →
          &quot;Extrair tudo&quot;) numa pasta que você não vá apagar, ex.:{' '}
          <code className="rounded bg-surface2 px-1">C:\garimpo-pc-extensao</code>.
        </Passo>
        <Passo n={2}>
          No Chrome, digite na barra de endereço:{' '}
          <code className="rounded bg-surface2 px-1">chrome://extensions</code>
        </Passo>
        <Passo n={3}>
          Ligue o <strong className="text-texto">&quot;Modo do desenvolvedor&quot;</strong>{' '}
          (chavinha no canto superior direito).
        </Passo>
        <Passo n={4}>
          Clique <strong className="text-texto">&quot;Carregar sem compactação&quot;</strong> e
          escolha a pasta que você extraiu.
        </Passo>
        <Passo n={5}>
          Fixe o ⛏️ na barra (ícone de quebra-cabeça 🧩 → 📌 no garimpo-pc).
        </Passo>
        <Passo n={6}>
          Clique no ⛏️ → <strong className="text-texto">⚙️ Configuração</strong> → cole o{' '}
          <strong className="text-texto">token do app</strong> → Salvar. (As URLs já vêm
          preenchidas.)
        </Passo>

        <h3 className="pt-2 font-semibold text-texto">Uso — dois botões:</h3>
        <Passo n={1}>
          <strong className="text-texto">🔍 Garimpar</strong> — na página de um{' '}
          <strong className="text-texto">anúncio</strong>: captura, analisa, salva no histórico e
          abre a triagem (10–30s). Garimpar o mesmo link de novo <em>atualiza</em> o PC (não
          duplica).
        </Passo>
        <Passo n={2}>
          <strong className="text-texto">📊 Calibrar preços</strong> — na página de uma{' '}
          <strong className="text-texto">busca</strong> (ex.: &quot;gtx 1660&quot;): a IA identifica
          cada peça avulsa, separa variantes (1660 ≠ Super ≠ Ti), descarta defeito/PC montado e
          grava a mediana de cada uma no banco. Um print calibra várias peças de uma vez.
        </Passo>
        <p className="pt-1 text-xs">
          ℹ️ Durante a captura aparece a barrinha &quot;garimpo-pc começou a depurar este
          navegador&quot; — é normal, é o que permite fotografar a página além da tela. Some
          sozinha.
        </p>
      </Secao>

      <Secao titulo="💡 Dicas rápidas">
        <p>
          📸 <strong className="text-texto">No celular</strong>: use a{' '}
          <strong className="text-texto">captura de tela com rolagem</strong> do Android pra pegar o
          anúncio inteiro num print só — o app sabe fatiar imagem comprida.
        </p>
        <p>
          🖼️ Pode mandar <strong className="text-texto">vários prints</strong> do mesmo anúncio na
          Triagem (fotos + descrição).
        </p>
        <p>
          ⚠️ <strong className="text-texto">GPU manda no preço</strong> (~50% do PC). GPU sem preço
          calibrado = veredito no máximo ⚠️. Calibre as GPUs primeiro.
        </p>
        <p>
          ⚙️ Em <strong className="text-texto">Configurações</strong> você ajusta a régua: fator de
          realização, piso de lucro, custo por km e os pisos por categoria.
        </p>
      </Secao>
    </div>
  );
}
