import { useEffect } from 'react'
import LoginPrompt from '../components/LoginPrompt'
import { TELEGRAM_LOGIN } from '../constants/config'
import type { LoginPageProps } from '../types/auth'

const LoginPage = ({
  manualId,
  onManualIdChange,
  manualLoading,
  manualMessage,
  onManualLogin,
  onTelegramAuth,
}: LoginPageProps) => {
  useEffect(() => {
    console.log('[Telegram] TELEGRAM_LOGIN =', TELEGRAM_LOGIN)
  }, [])

  return (
    <div className="page">
      <div className="panel">
        <div className="heading">
          <p className="pill">Reports TAU</p>
          <h1>Панель пользователей</h1>
          <p className="summary">
            Вход через Telegram дает доступ к связанной информации о пользователе
          </p>
        </div>

        <LoginPrompt
          telegramBotName={TELEGRAM_LOGIN}
          onTelegramAuth={onTelegramAuth}
          manualId={manualId}
          onManualIdChange={onManualIdChange}
          manualLoading={manualLoading}
          manualMessage={manualMessage}
          onManualLogin={onManualLogin}
        />
      </div>
    </div>
  )
}

export default LoginPage
