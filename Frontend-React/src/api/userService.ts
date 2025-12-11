import { USER_SERVICE_BASE } from '../constants/config'
import type {
  ApiErrorResponse,
  LoginResponse,
  TelegramAuthPayload,
} from '../types/user'

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

async function fetchJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${USER_SERVICE_BASE}${path}`, {
    ...init,
    headers: {
      ...DEFAULT_HEADERS,
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | ApiErrorResponse
      | null
    throw new Error(
      errorBody?.detail ?? 'Failed to perform request to user service',
    )
  }

  return response.json() as Promise<T>
}

export function loginById(telegramId: number): Promise<LoginResponse> {
  return fetchJson<LoginResponse>('/login_by_id', {
    method: 'POST',
    body: JSON.stringify({ telegram_id: telegramId }),
  })
}

export function loginWithTelegram(
  payload: TelegramAuthPayload,
): Promise<LoginResponse> {
  return fetchJson<LoginResponse>('/auth/callback', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function refreshToken(
  refreshTokenValue: string,
): Promise<LoginResponse> {
  return fetchJson<LoginResponse>('/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshTokenValue }),
  })
}
