'use client';

export type Provider = 'anthropic' | 'openai';

// Escolhe a IA que vai LER o print/texto. Serve pra testar Claude vs GPT no
// mesmo anúncio e ver qual acerta mais (o gargalo é ler número em print da OLX).
export default function ProviderToggle({
  value,
  onChange,
  label = 'IA pra ler:',
}: {
  value: Provider;
  onChange: (p: Provider) => void;
  label?: string;
}) {
  const opts: { v: Provider; label: string }[] = [
    { v: 'anthropic', label: '🤖 Claude' },
    { v: 'openai', label: '🤖 GPT' },
  ];
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted">{label}</span>
      <div className="flex flex-1 overflow-hidden rounded-lg border border-borda text-xs">
        {opts.map((o) => (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={`flex-1 px-2 py-1.5 ${value === o.v ? 'bg-roxo/25 text-texto' : 'text-muted'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
