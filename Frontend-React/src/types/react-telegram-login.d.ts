declare module 'react-telegram-login' {
  import type { FC } from 'react'
  import type { TelegramAuthPayload } from './user'

  export interface TelegramLoginButtonProps {
    botName: string
    dataOnauth?: (user: TelegramAuthPayload) => void
    dataAuthUrl?: string
  }

  const TelegramLoginButton: FC<TelegramLoginButtonProps>

  export default TelegramLoginButton
}
