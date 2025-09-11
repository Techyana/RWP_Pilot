// services/http.ts
export class HttpError extends Error {
  status: number;
  body?: any;
  constructor(message: string, status: number, body?: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const API_BASE =
  import.meta.env.VITE_API_BASE || 'https://vps.ricohworkshopportal.co.za';

/*
 * Generic request wrapper for cookie-based sessions.
 * Always sends credentials so the browser includes the session cookie.
 */
export async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers || {});

  //Content-Type for JSON bodies (not FormData)
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let body: any;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => '');
    }
    throw new HttpError(
      body?.message || res.statusText || 'HTTP ${res.status}',
      res.status,
      body
    );
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

//Convenience helpers
export const get = <T>(path: string) => request<T>(path);
export const post = <T>(path: string, body?: any) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });
export const patch = <T>(path: string, body?: any) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
export const del = <T>(path: string) => request<T>(path, { method: 'DELETE' });