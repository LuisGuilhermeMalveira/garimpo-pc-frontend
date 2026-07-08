export default function LotePage() {
  return (
    <div>
      <h1 className="mb-2 text-xl font-bold">📋 Lote</h1>
      <div className="rounded-xl border border-borda bg-surface p-4 text-sm text-muted">
        <p className="mb-2 text-texto">A peneira (triagem em lote) é da Fase 3.</p>
        <p>
          Vai receber um print de busca inteira, ler todos os PCs, deduplicar e ranquear por lucro/mês
          (✅/❓/❌). Ainda não implementada.
        </p>
      </div>
    </div>
  );
}
