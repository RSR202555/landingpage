function getApiBaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  if (publicUrl) return publicUrl;

  if (typeof window !== 'undefined') return '';

  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl) return nextAuthUrl;

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  throw new Error('Base URL não configurada. Defina NEXT_PUBLIC_API_URL ou NEXTAUTH_URL.');
}

export async function apiGet<T>(path: string): Promise<T> {
  const API_URL = getApiBaseUrl();
  const res = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Erro na API: ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const API_URL = getApiBaseUrl();
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Erro na API: ${res.status}`);
  }
  return res.json();
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const API_URL = getApiBaseUrl();
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Erro na API: ${res.status}`);
  }
  return res.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  const API_URL = getApiBaseUrl();
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `Erro na API: ${res.status}`);
  }
  return res.json();
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const API_URL = getApiBaseUrl();
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`Erro na API: ${res.status}`);
  }
  return res.json();
}

