export type TelegramAuthPayload = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date?: number
  hash?: string
}

export type UserDetails = TelegramAuthPayload & {
  telegram_id?: number
  token?: string
}

export type LoginResponse = {
  status: string
  token: string
  refresh_token: string
  user: UserDetails
}

export type ApiErrorResponse = {
  detail?: string
  status?: string
}
