// Números digitados pelo usuário: aceita vírgula decimal brasileira
// ("0,42" -> 0.42). Vazio/inválido vira null — NUNCA 0 silencioso
// (Number('') === 0 foi o bug que zerou o custo_km e apagou o combustível).
export function numBr(v: string | number | null | undefined): number | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (s === '') return null;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}
