// Barra de progresso indeterminada (faixa que corre) + rótulo opcional.
// Indeterminada porque o backend processa os tiles num request só — não dá
// pra saber o % exato sem streaming; a faixa correndo comunica "trabalhando".

export default function BarraProgresso({ label }: { label?: string }) {
  return (
    <div className="space-y-1">
      {label && <p className="text-center text-sm text-muted">{label}</p>}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface2">
        <div className="barra-fill bg-roxo" />
      </div>
    </div>
  );
}
