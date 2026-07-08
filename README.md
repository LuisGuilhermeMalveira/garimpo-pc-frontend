# garimpo-pc-frontend

App (PWA mobile-first) do **garimpo-pc** — Next.js 14 (App Router) + TypeScript + Tailwind.
Conversa com o `garimpo-pc-backend` por REST com token simples.

> **Estado:** Catálogo + Calibração (a "máscara" de preço-base) funcionando.
> Triagem (card de veredito), Lote e Histórico ainda são placeholders — backend da triagem
> (Fase 2) já existe; a tela vem a seguir.

## Telas
- **Catálogo** (`/catalogo`, home) — peças por categoria, com preço-base, **frescor** 🟢🟡🟠🔴 e mini-spark de **tendência**. Filtros por categoria e frescor. Botão **+ Nova peça**.
- **Calibrar** (modal) — arrasta o print da busca → IA lê os preços (ignora PCs montados) → mostra usados e outliers descartados (±35%) → você confirma/ajusta → grava o preço-base.
- **Triagem / Lote / Histórico** — placeholders (próximas etapas).

## Rodar local

```bash
cd C:\shared\garimpo-pc-frontend
npm install

# configurar ambiente
copy .env.example .env.local        # (PowerShell: Copy-Item .env.example .env.local)
#  -> em .env.local: NEXT_PUBLIC_API_URL e NEXT_PUBLIC_APP_TOKEN (o MESMO token do backend)

npm run dev
# abre http://localhost:3000
```

> O **backend precisa estar rodando** (porta 3001) e migrado. Veja o README do `garimpo-pc-backend`.

## Variáveis de ambiente
- `NEXT_PUBLIC_API_URL` — URL do backend (ex.: `http://localhost:3001` ou a do Railway).
- `NEXT_PUBLIC_APP_TOKEN` — o mesmo `APP_TOKEN` do backend (single-user). Em app pessoal, expor no client é aceitável.

## Estrutura
```
app/
  layout.tsx          # tema escuro + navegação inferior
  page.tsx            # redireciona p/ /catalogo
  catalogo/page.tsx   # F1 — catálogo + calibração
  triagem|lote|historico/page.tsx   # placeholders
components/
  BottomNav.tsx · PecaCard.tsx · FrescorTag.tsx · TendenciaSpark.tsx
  Modal.tsx · CalibrarModal.tsx · NovaPecaModal.tsx
lib/
  api.ts              # fetch wrapper (token)
  types.ts            # tipos espelhando o backend
```

## Deploy (Vercel)
Importar o repo, setar `NEXT_PUBLIC_API_URL` (backend no Railway) e `NEXT_PUBLIC_APP_TOKEN` nas env vars do projeto.
