import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { loginById, loginWithTelegram, refreshToken } from './api/userService'
import LoginPage from './pages/LoginPage'
import DashboardOverviewPage from './pages/DashboardOverviewPage'
import DashboardReportsPage from './pages/DashboardReportsPage'
import DashboardProfilePage from './pages/DashboardProfilePage'
import Stats from './components/Stats'
import Dashboard from './components/Dashboard'
import type { TelegramAuthPayload, UserDetails } from './types/user'

const App = () => {
  const [user, setUser] = useState<UserDetails | null>(null)
  const [widgetKey, setWidgetKey] = useState(0)
  const [manualId, setManualId] = useState('')
  const [manualMessage, setManualMessage] = useState<string | null>(null)
  const [manualLoading, setManualLoading] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(
    null,
  )
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const handleAuth = async (payload: TelegramAuthPayload) => {
      console.log('[Telegram] Auth payload from widget:', payload)
      try {
        const response = await loginWithTelegram(payload)
        console.log('[Backend] /auth/callback response:', response)

        const {
          user: loggedInUser,
          token,
          refresh_token: newRefreshToken,
        } = response

        setUser(loggedInUser)
        setAccessToken(token)
        setRefreshTokenValue(newRefreshToken)

        window.localStorage.setItem('accessToken', token)
        window.localStorage.setItem('refreshToken', newRefreshToken)
        window.localStorage.setItem('user', JSON.stringify(loggedInUser))
      } catch (error) {
        console.error('Failed to login with Telegram auth callback', error)
      }
    }

    window.onTelegramAuth = handleAuth
    return () => {
      if (window.onTelegramAuth === handleAuth) {
        delete window.onTelegramAuth
      }
    }
  }, [])

  useEffect(() => {
    const storedAccessToken = window.localStorage.getItem('accessToken')
    const storedRefreshToken = window.localStorage.getItem('refreshToken')
    const storedUser = window.localStorage.getItem('user')

    if (storedAccessToken && storedRefreshToken && storedUser) {
      setAccessToken(storedAccessToken)
      setRefreshTokenValue(storedRefreshToken)
      try {
        const parsedUser = JSON.parse(storedUser) as UserDetails
        setUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse stored user from localStorage', error)
      }
    }

    setAuthReady(true)
  }, [])

  useEffect(() => {
    if (!accessToken || !refreshTokenValue) return

    const intervalId = window.setInterval(async () => {
      try {
        const { token, refresh_token } = await refreshToken(
          refreshTokenValue,
        )
        setAccessToken(token)
        setRefreshTokenValue(refresh_token)
        window.localStorage.setItem('accessToken', token)
        window.localStorage.setItem('refreshToken', refresh_token)
      } catch (error) {
        console.error('Failed to refresh token', error)
      }
    }, 5 * 60 * 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [accessToken, refreshTokenValue])

  const handleLoginById = async () => {
    const trimmedId = manualId.trim()
    if (!trimmedId) {
      setManualMessage('Введите Telegram ID')
      return
    }

    const telegramId = Number(trimmedId)
    if (!Number.isFinite(telegramId) || telegramId <= 0) {
      setManualMessage('ID должен быть положительным числом')
      return
    }

    setManualMessage(null)
    setManualLoading(true)

    try {
      const {
        user: loggedInUser,
        token,
        refresh_token: newRefreshToken,
      } = await loginById(telegramId)
      setUser(loggedInUser)
      setAccessToken(token)
      setRefreshTokenValue(newRefreshToken)
      window.localStorage.setItem('accessToken', token)
      window.localStorage.setItem('refreshToken', newRefreshToken)
      window.localStorage.setItem('user', JSON.stringify(loggedInUser))
      setManualId('')
      setWidgetKey((key) => key + 1)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Не удалось выполнить запрос к сервису'
      setManualMessage(message)
    } finally {
      setManualLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setAccessToken(null)
    setRefreshTokenValue(null)
    window.localStorage.removeItem('accessToken')
    window.localStorage.removeItem('refreshToken')
    window.localStorage.removeItem('user')
    setWidgetKey((key) => key + 1)
    setManualMessage(null)
  }

  const isAuthenticated = Boolean(accessToken && user)

  if (!authReady) {
    return null
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage
              widgetKey={widgetKey}
              manualId={manualId}
              onManualIdChange={setManualId}
              manualLoading={manualLoading}
              manualMessage={manualMessage}
              onManualLogin={handleLoginById}
            />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Dashboard onLogout={handleLogout}>
              <DashboardOverviewPage />
            </Dashboard>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/stats"
        element={
          isAuthenticated ? (
            <Dashboard onLogout={handleLogout}>
              <Stats />
            </Dashboard>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/reports"
        element={
          isAuthenticated ? (
            <Dashboard onLogout={handleLogout}>
              <DashboardReportsPage />
            </Dashboard>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/profile"
        element={
          isAuthenticated && user ? (
            <Dashboard onLogout={handleLogout}>
              <DashboardProfilePage user={user} />
            </Dashboard>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

export default App
