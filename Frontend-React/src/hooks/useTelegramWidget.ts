import { useEffect, useRef, useState } from 'react'

export type TelegramWidgetSize = 'large' | 'medium'

export interface TelegramWidgetOptions {
  login: string
  widgetKey: number
  size?: TelegramWidgetSize
  userpic?: 'true' | 'false'
  radius?: number
}

export function useTelegramWidget({
  login,
  widgetKey,
  size = 'large',
  userpic = 'false',
  radius = 12,
}: TelegramWidgetOptions) {
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const container = widgetRef.current
    if (!container || !login) {
      setReady(false)
      return
    }

    setReady(false)
    container.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?15'
    script.async = true
    script.setAttribute('data-telegram-login', login)
    script.setAttribute('data-size', size)
    script.setAttribute('data-userpic', userpic)
    script.setAttribute('data-radius', String(radius))
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')

    script.onload = () => {
      console.log(
        '[Telegram] Widget script loaded for login:',
        login,
      )
    }

    script.onerror = () => {
      console.error(
        '[Telegram] Failed to load widget script for login:',
        login,
      )
    }

    container.appendChild(script)
    setReady(true)

    return () => {
      container.innerHTML = ''
    }
  }, [login, widgetKey, size, userpic, radius])

  return { widgetRef, ready }
}
