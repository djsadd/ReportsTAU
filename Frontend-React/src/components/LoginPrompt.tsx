import type { RefObject } from 'react'

type LoginPromptProps = {
  widgetRef: RefObject<HTMLDivElement | null>
  ready: boolean
  manualId: string
  onManualIdChange: (value: string) => void
  manualLoading: boolean
  manualMessage: string | null
  onManualLogin: () => Promise<void>
}

export default function LoginPrompt({
  widgetRef,
  ready,
  manualId,
  onManualIdChange,
  manualLoading,
  manualMessage,
  onManualLogin,
}: LoginPromptProps) {
  return (
    <div className="panel-content">
      <h2>Авторизация через Telegram</h2>
      <p className="summary">
        Пройдите авторизацию через виджет ниже или воспользуйтесь входом по ID.
      </p>
      <div
        ref={widgetRef}
        className={`telegram-widget${ready ? '' : ' loading'}`}
        aria-live="polite"
      >
        {!ready && 'Загрузка виджета Telegram...'}
      </div>
      <div className="manual-login">
        <label htmlFor="manual-id-input">Telegram ID пользователя</label>
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
            {manualLoading ? 'Проверка...' : 'Войти'}
          </button>
        </div>
        {manualMessage && <p className="manual-note">{manualMessage}</p>}
      </div>
    </div>
  )
}
