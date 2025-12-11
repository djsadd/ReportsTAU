import { TelegramAuthPayload } from './user'

declare global {
  interface Window {
    onTelegramAuth?: (payload: TelegramAuthPayload) => void
  }
}

export {}
