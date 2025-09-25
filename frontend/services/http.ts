// src/services/http.ts

export class HttpError extends Error {
  public status: number
  public body?: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.body = body
  }
}

// Trim any trailing slash so you never get double “//” in URLs
const rawBase = import.meta.env.VITE_API_BASE as string | undefined
export const API_BASE = rawBase?.replace(/\/+$/, '') 
  ?? 'https://vps.ricohworkshopportal.co.za'

/** 
 * Low-level wrapper around fetch that:
//   • prefixes your path with API_BASE
//   • always sends cookies
//   • sets JSON headers when needed
//   • parses JSON/text intelligently
//   • throws HttpError on non-ok
 */
async function request<T>(
  path: string,
  config: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`
  const headers = new Headers(config.headers)

  // if there's a body and it's not FormData, assume JSON
  if (
    config.body &&
    !(config.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(url, {
    ...config,
    headers,
    credentials: 'include',
  })

  // sniff JSON content to decide whether to call res.json()
  const contentType = res.headers.get('Content-Type') || ''
  let responseBody: unknown

  if (res.status !== 204 && contentType.includes('application/json')) {
    responseBody = await res.json().catch(() => undefined)
  } else {
    // fallback to text for non-JSON or 204
    responseBody = await res.text().catch(() => undefined)
  }

  if (!res.ok) {
    // pull out a “message” if the body has one
    const msg =
      typeof responseBody === 'object' &&
      responseBody !== null &&
      'message' in (responseBody as any)
        ? (responseBody as any).message
        : res.statusText || `HTTP ${res.status}`
    throw new HttpError(msg, res.status, responseBody)
  }

  // HTTP 204 No Content → return undefined
  if (res.status === 204) {
    return undefined as unknown as T
  }

  return responseBody as T
}

// Convenience helpers; you can still override headers or other init fields
export const get = <T>(path: string, init?: RequestInit) =>
  request<T>(path, { ...init, method: 'GET' })

export const post = <T>(path: string, body?: unknown, init?: RequestInit) =>
  request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) })

export const put = <T>(path: string, body?: unknown, init?: RequestInit) =>
  request<T>(path, { ...init, method: 'PUT', body: JSON.stringify(body) })

export const patch = <T>(path: string, body?: unknown, init?: RequestInit) =>
  request<T>(path, { ...init, method: 'PATCH', body: JSON.stringify(body) })

export const del = <T>(path: string, init?: RequestInit) =>
  request<T>(path, { ...init, method: 'DELETE' })