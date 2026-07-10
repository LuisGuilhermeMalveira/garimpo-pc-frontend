// Wrapper de fetch pro backend garimpo-pc. Token simples (single-user).

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TOKEN = process.env.NEXT_PUBLIC_APP_TOKEN || '';

function headers(extra?: Record<string, string>): Record<string, string> {
  return {
    Authorization: `Bearer ${TOKEN}`,
    ...(extra || {}),
  };
}

async function tratar(res: Response) {
  const texto = await res.text();
  let dados: any = null;
  try {
    dados = texto ? JSON.parse(texto) : null;
  } catch {
    dados = texto;
  }
  if (!res.ok) {
    const msg = (dados && dados.erro) || `Erro ${res.status}`;
    throw new Error(msg);
  }
  return dados;
}

export const api = {
  base: BASE,
  temToken: () => TOKEN.length > 0,
  // URL direta (ex.: <img src>) — auth vai por query, que o backend aceita
  urlComToken: (path: string) =>
    `${BASE}${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(TOKEN)}`,

  async get<T = any>(path: string): Promise<T> {
    const res = await fetch(`${BASE}${path}`, { headers: headers(), cache: 'no-store' });
    return tratar(res);
  },

  async post<T = any>(path: string, body?: any): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: body ? JSON.stringify(body) : undefined,
    });
    return tratar(res);
  },

  async patch<T = any>(path: string, body?: any): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method: 'PATCH',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: body ? JSON.stringify(body) : undefined,
    });
    return tratar(res);
  },

  async put<T = any>(path: string, body?: any): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: body ? JSON.stringify(body) : undefined,
    });
    return tratar(res);
  },

  async del<T = any>(path: string): Promise<T> {
    const res = await fetch(`${BASE}${path}`, { method: 'DELETE', headers: headers() });
    return tratar(res);
  },

  // multipart (upload de print) — não setar Content-Type manualmente
  async postForm<T = any>(path: string, form: FormData): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: headers(),
      body: form,
    });
    return tratar(res);
  },
};
