import { USER_SERVICE_BASE } from '../constants/config'
import type { ApiErrorResponse } from '../types/user'
import type { PaginatedWorkLogs } from '../types/worklog'

type ListParams = {
  page?: number
  page_size?: number
  search?: string
  project?: string
  date_from?: string
  date_to?: string
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

// API Gateway base (same host/port as user service, but without `/users`)
const API_BASE = USER_SERVICE_BASE.replace(/\/users?\/?$/, '')

async function fetchJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = path.startsWith('http')
    ? path
    : `${API_BASE}${path}`

  const finalInit: RequestInit = {
    ...init,
    headers: {
      ...DEFAULT_HEADERS,
      ...(init.headers ?? {}),
    },
  }

  // Log outgoing request (including Authorization header)
  console.log('[Worklogs] Request:', {
    url,
    method: finalInit.method ?? 'GET',
    headers: finalInit.headers,
  })

  const response = await fetch(url, finalInit)

  const rawText = await response.text().catch(() => null)

  let parsedBody: unknown = null
  if (rawText) {
    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      try {
        parsedBody = JSON.parse(rawText)
      } catch {
        parsedBody = null
      }
    } else {
      parsedBody = rawText
    }
  }

  // Log backend response
  console.log('[Worklogs] Response:', {
    url,
    status: response.status,
    ok: response.ok,
    body: parsedBody,
  })

  if (!response.ok) {
    const errorBody = (parsedBody ?? null) as ApiErrorResponse | null
    throw new Error(
      errorBody?.detail ?? 'Failed to perform request to worklog service',
    )
  }

  if (!parsedBody || typeof parsedBody !== 'object') {
    throw new Error(
      'Unexpected non-JSON response from worklog service (did you open the frontend host instead of the API gateway?)',
    )
  }

  return parsedBody as T
}

export function getMyResolvedWorklogs(
  accessToken: string,
  params: ListParams = {},
): Promise<PaginatedWorkLogs> {
  const query = new URLSearchParams()

  if (params.page) query.set('page', String(params.page))
  if (params.page_size) query.set('page_size', String(params.page_size))
  if (params.search) query.set('search', params.search)
  if (params.project) query.set('project', params.project)
  if (params.date_from) query.set('date_from', params.date_from)
  if (params.date_to) query.set('date_to', params.date_to)

  const qs = query.toString()
  const url = `/worklogs/my/resolved${qs ? `?${qs}` : ''}`

  return fetchJson<PaginatedWorkLogs>(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
