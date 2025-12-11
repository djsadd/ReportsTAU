import type { TelegramAuthPayload } from './user'

export type LoginPageProps = {
  manualId: string
  onManualIdChange: (value: string) => void
  manualLoading: boolean
  manualMessage: string | null
  onManualLogin: () => Promise<void>
  onTelegramAuth: (payload: TelegramAuthPayload) => Promise<void> | void
}
