const TELEGRAM_LOGIN = import.meta.env.VITE_TELEGRAM_LOGIN?.trim() ?? 'tau_reportbot'

// По умолчанию фронт стучится на тот же домен через nginx-прокси,
// чтобы браузер не ходил на localhost / локальную сеть.
const rawUserServiceUrl =
  import.meta.env.VITE_USER_SERVICE_URL?.trim() ?? '/api/users'

const USER_SERVICE_BASE = rawUserServiceUrl.replace(/\/+$/, '')
const TELEGRAM_AUTH_CALLBACK = `${USER_SERVICE_BASE}/auth/callback`

export { TELEGRAM_LOGIN, USER_SERVICE_BASE, TELEGRAM_AUTH_CALLBACK }
