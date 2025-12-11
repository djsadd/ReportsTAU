import { useEffect } from 'react'
import LoginPrompt from '../components/LoginPrompt'
import { useTelegramWidget } from '../hooks/useTelegramWidget'
import {
  TELEGRAM_LOGIN,
} from '../constants/config'
import type { LoginPageProps } from '../types/auth'

const LoginPage = ({
  widgetKey,
  manualId,
  onManualIdChange,
  manualLoading,
  manualMessage,
  onManualLogin,
}: LoginPageProps) => {
  useEffect(() => {
    console.log('[Telegram] TELEGRAM_LOGIN =', TELEGRAM_LOGIN)
  }, [])

  const { widgetRef, ready: widgetReady } = useTelegramWidget({
    login: TELEGRAM_LOGIN,
    widgetKey,
  })

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
          widgetRef={widgetRef}
          ready={widgetReady && TELEGRAM_LOGIN.length > 0}
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
