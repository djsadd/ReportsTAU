import { useEffect, useState } from 'react'

import { getMyResolvedWorklogs } from '../api/worklogService'
import type { WorkLogItem } from '../types/worklog'

const DashboardReportsPage = () => {
  const [items, setItems] = useState<WorkLogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const accessToken = window.localStorage.getItem('accessToken')
    if (!accessToken) {
      setError('Не найден access token')
      return
    }

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log('[Worklogs][DashboardReportsPage] Starting request', {
          url: '/worklogs/my/resolved',
          params: { page: 1, page_size: 20 },
          accessToken,
        })
        const data = await getMyResolvedWorklogs(accessToken, {
          page: 1,
          page_size: 20,
        })
        console.log(
          '[Worklogs][DashboardReportsPage] Parsed response:',
          data,
        )
        setItems(data.items)
      } catch (err) {
        console.error(
          '[Worklogs][DashboardReportsPage] Request failed:',
          err,
        )
        const message =
          err instanceof Error
            ? err.message
            : 'Не удалось загрузить отчёты'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <section className="dashboard-main-card">
      <div className="dashboard-main-card-header">
        <p className="dashboard-main-card-subtitle">Отчёты</p>
        <h2 className="dashboard-main-card-title">
          Рабочие отчёты, которые уже рассмотрены
        </h2>
        <p className="dashboard-main-card-text">
          Здесь показываются ваши рабочие записи (worklogs), которые помечены
          как &quot;done&quot;.
        </p>
      </div>

      {loading && <p>Загружаем ваши отчёты...</p>}
      {error && !loading && <p className="dashboard-error-text">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p>У вас ещё нет рассмотренных отчётов.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className="dashboard-list">
          {items.map((item) => (
            <li key={item.id}>
              <span className="dashboard-list-date">
                {new Date(item.date).toLocaleDateString()}
              </span>
              <div className="dashboard-list-description">
                <strong>Описание:</strong> {item.description}
                {item.llm_Description && (
                  <>
                    <br />
                    <strong>LLM описание:</strong> {item.llm_Description}
                  </>
                )}
              </div>
              <span className="dashboard-list-status dashboard-list-status--success">
                {item.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default DashboardReportsPage

