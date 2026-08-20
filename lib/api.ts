// fixes-web/lib/api.ts

import type { ApiErrorEnvelope, ApiFieldError, ApiResponse, PaginatedResponse } from './types'
import { API_BASE_URL } from './constants'


let accessToken: string | null = null
let refreshTokenValue: string | null = null

export function setTokens(access: string, refresh: string): void {
  accessToken = access
  refreshTokenValue = refresh
  if (typeof window !== 'undefined') {
    localStorage.setItem('fixes_access_token', access)
    localStorage.setItem('fixes_refresh_token', refresh)
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('fixes_access_token')
  }
  return accessToken
}

export function getRefreshToken(): string | null {
  if (refreshTokenValue) return refreshTokenValue
  if (typeof window !== 'undefined') {
    refreshTokenValue = localStorage.getItem('fixes_refresh_token')
  }
  return refreshTokenValue
}

export function clearTokens(): void {
  accessToken = null
  refreshTokenValue = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fixes_access_token')
    localStorage.removeItem('fixes_refresh_token')
  }
}


let isRefreshing = false
type RefreshOutcome = 'refreshed' | 'invalid' | 'unavailable'
let refreshPromise: Promise<RefreshOutcome> | null = null

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
)

async function readJsonObject(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text()
  if (!text) return {}

  try {
    const parsed: unknown = JSON.parse(text)
    return isRecord(parsed) ? parsed : {}
  } catch {
    // Never surface gateway HTML or arbitrary upstream text as an application error.
    return {}
  }
}

const refreshUnavailableError = () => new ApiError(
  'Your session could not be verified. Check your connection and try again.',
  503,
  {
    success: false,
    message: 'Your session could not be verified. Check your connection and try again.',
    code: 'DEPENDENCY_UNAVAILABLE',
    requestId: null,
    retryable: true,
    details: {},
    fieldErrors: [],
  }
)

async function attemptTokenRefresh(): Promise<RefreshOutcome> {
  const refresh = getRefreshToken()
  if (!refresh) return 'invalid'

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    })

    if (!res.ok) {
      if (![400, 401, 403].includes(res.status)) return 'unavailable'
      clearTokens()
      return 'invalid'
    }

    const json = (await readJsonObject(res)) as unknown as ApiResponse<{
      accessToken: string
      refreshToken: string
    }>
    if (!json.data?.accessToken || !json.data?.refreshToken) return 'unavailable'
    setTokens(json.data.accessToken, json.data.refreshToken)
    return 'refreshed'
  } catch {
    return 'unavailable'
  }
}


interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Record<string, unknown> | FormData
  headers?: Record<string, string>
  noAuth?: boolean
}

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, noAuth = false } = options

  const requestHeaders: Record<string, string> = { ...headers }

  if (!noAuth) {
    const token = getAccessToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const fetchOptions: RequestInit = { method, headers: requestHeaders }

  if (body) {
    if (body instanceof FormData) {
      fetchOptions.body = body
    } else {
      requestHeaders['Content-Type'] = 'application/json'
      fetchOptions.body = JSON.stringify(body)
    }
  }

  let res = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions)

  if (res.status === 401 && !noAuth) {
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = attemptTokenRefresh()
    }

    const refreshOutcome = await refreshPromise
    isRefreshing = false
    refreshPromise = null

    if (refreshOutcome === 'refreshed') {
      const newToken = getAccessToken()
      if (newToken) {
        requestHeaders['Authorization'] = `Bearer ${newToken}`
      }
      fetchOptions.headers = requestHeaders
      res = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions)
    } else if (refreshOutcome === 'invalid') {
      if (typeof window !== 'undefined') {
        const protectedPrefixes = ['/dashboard', '/admin', '/agency', '/cleaning-admin', '/admin-select']
        const isProtectedPage = protectedPrefixes.some(p => window.location.pathname.startsWith(p))
        if (isProtectedPage) {
          window.location.href = '/login'
        }
      }
      throw new ApiError('Session expired. Please log in again.', 401, {
        success: false,
        message: 'Session expired. Please log in again.',
        code: 'SESSION_INVALID',
        requestId: null,
        retryable: false,
        details: {},
        fieldErrors: [],
      })
    } else {
      throw refreshUnavailableError()
    }
  }

  const json = await readJsonObject(res)

  if (!res.ok) {
    const data: Record<string, unknown> = {
      ...json,
      requestId: typeof json.requestId === 'string'
        ? json.requestId
        : res.headers.get('X-Request-Id'),
    }
    throw new ApiError(
      typeof data.message === 'string' ? data.message : 'Something went wrong',
      res.status,
      data
    )
  }

  return json as T
}

async function apiFetchBlob(endpoint: string): Promise<Blob> {
  const request = () => {
    const token = getAccessToken()
    return fetch(`${API_BASE_URL}${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  }
  let res = await request()
  if (res.status === 401) {
    const refreshOutcome = await attemptTokenRefresh()
    if (refreshOutcome === 'refreshed') res = await request()
    else if (refreshOutcome === 'unavailable') throw refreshUnavailableError()
  }
  if (!res.ok) {
    let message = 'The requested file could not be loaded.'
    let data: Record<string, unknown> = {}
    try {
      data = await readJsonObject(res)
      if (typeof data.message === 'string') message = data.message
    } catch {}
    data.requestId = typeof data.requestId === 'string'
      ? data.requestId
      : res.headers.get('X-Request-Id')
    throw new ApiError(message, res.status, data)
  }
  return res.blob()
}


export class ApiError extends Error {
  status: number
  data: Record<string, unknown>
  code: string
  requestId: string | null
  retryable: boolean
  details: Record<string, unknown>
  fieldErrors: ApiFieldError[]

  constructor(
    message: string,
    status: number,
    data: Record<string, unknown> = {}
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.code = typeof data.code === 'string' ? data.code : 'REQUEST_FAILED'
    this.requestId = typeof data.requestId === 'string' ? data.requestId : null
    this.retryable = data.retryable === true
    this.details = isRecord(data.details) ? data.details : {}
    this.fieldErrors = Array.isArray(data.fieldErrors)
      ? data.fieldErrors.filter((item): item is ApiFieldError => (
          isRecord(item) &&
          typeof item.path === 'string' &&
          typeof item.code === 'string' &&
          typeof item.message === 'string'
        ))
      : []
  }

  toEnvelope(): ApiErrorEnvelope {
    return {
      success: false,
      message: this.message,
      code: this.code,
      requestId: this.requestId,
      retryable: this.retryable,
      details: this.details,
      fieldErrors: this.fieldErrors,
      ...(this.data.errors !== undefined && { errors: this.data.errors }),
    }
  }
}


export const api = {
  get<T>(endpoint: string, noAuth?: boolean): Promise<ApiResponse<T>> {
    return apiFetch<ApiResponse<T>>(endpoint, { noAuth })
  },

  getPaginated<T>(
    endpoint: string,
    noAuth?: boolean
  ): Promise<PaginatedResponse<T>> {
    return apiFetch<PaginatedResponse<T>>(endpoint, { noAuth })
  },

  post<T>(
    endpoint: string,
    body?: Record<string, unknown>,
    noAuth?: boolean
  ): Promise<ApiResponse<T>> {
    return apiFetch<ApiResponse<T>>(endpoint, { method: 'POST', body, noAuth })
  },

  patch<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    return apiFetch<ApiResponse<T>>(endpoint, { method: 'PATCH', body })
  },

  put<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    return apiFetch<ApiResponse<T>>(endpoint, { method: 'PUT', body })
  },

  delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return apiFetch<ApiResponse<T>>(endpoint, { method: 'DELETE' })
  },

  raw<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return apiFetch<T>(endpoint, options)
  },

  getBlob(endpoint: string): Promise<Blob> {
    return apiFetchBlob(endpoint)
  },
}
