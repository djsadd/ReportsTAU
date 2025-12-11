import TelegramLoginButton from 'react-telegram-login'
import type { TelegramAuthPayload } from '../types/user'

type LoginPromptProps = {
  telegramBotName: string
  onTelegramAuth: (payload: TelegramAuthPayload) => void
  manualId: string
  onManualIdChange: (value: string) => void
  manualLoading: boolean
  manualMessage: string | null
  onManualLogin: () => Promise<void>
}

export default function LoginPrompt({
  telegramBotName,
  onTelegramAuth,
  manualId,
  onManualIdChange,
  manualLoading,
  manualMessage,
  onManualLogin,
}: LoginPromptProps) {
  return (
    <div className="panel-content">
      <h2>Вход через Telegram</h2>
      <p className="summary">
        Авторизуйтесь через Telegram или введите ваш Telegram ID вручную.
      </p>
      <div className="telegram-widget" aria-live="polite">
        <TelegramLoginButton
          botName={telegramBotName}
          dataOnauth={onTelegramAuth}
        />
      </div>
      <div className="manual-login">
        <label htmlFor="manual-id-input">Telegram ID (ручной вход)</label>
        <div className="manual-input-row">
          <input
            id="manual-id-input"
            type="number"
            min="1"
            placeholder="123456789"
            value={manualId}
            onChange={(event) => onManualIdChange(event.target.value)}
          />
          <button
            type="button"
            onClick={onManualLogin}
            disabled={manualLoading}
          >
            {manualLoading ? 'Загрузка...' : 'Войти'}
          </button>
        </div>
        {manualMessage && <p className="manual-note">{manualMessage}</p>}
      </div>
    </div>
  )
}

