import { useEffect, useState } from 'react'

import { getMyResolvedWorklogs } from '../api/worklogService'
import type { WorkLogItem } from '../types/worklog'

type FiltersState = {
  search: string
  project: string
  dateFrom: string
  dateTo: string
}

const PAGE_SIZE = 20

const DashboardReportsPage = () => {
  const [items, setItems] = useState<WorkLogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [project, setProject] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({
    search: '',
    project: '',
    dateFrom: '',
    dateTo: '',
  })

  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const accessToken = window.localStorage.getItem('accessToken')
    if (!accessToken) {
      setError('Missing access token')
      return
    }

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log('[Worklogs][DashboardReportsPage] Starting request', {
          url: '/worklogs/my/resolved',
          params: {
            page,
            page_size: PAGE_SIZE,
            search: appliedFilters.search || undefined,
            project: appliedFilters.project || undefined,
            date_from: appliedFilters.dateFrom || undefined,
            date_to: appliedFilters.dateTo || undefined,
          },
          accessToken,
        })
        const data = await getMyResolvedWorklogs(accessToken, {
          page,
          page_size: PAGE_SIZE,
          search: appliedFilters.search || undefined,
          project: appliedFilters.project || undefined,
          date_from: appliedFilters.dateFrom || undefined,
          date_to: appliedFilters.dateTo || undefined,
        })
        console.log(
          '[Worklogs][DashboardReportsPage] Parsed response:',
          data,
        )
        setItems(data.items)
        setTotal(data.total)
      } catch (err) {
        console.error(
          '[Worklogs][DashboardReportsPage] Request failed:',
          err,
        )
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to load worklogs'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [page, appliedFilters])

  const handleApplyFilters = () => {
    setPage(1)
    setAppliedFilters({
      search,
      project,
      dateFrom,
      dateTo,
    })
  }

  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1

  return (
    <section className="dashboard-main-card">
      <div className="dashboard-main-card-header">
        <p className="dashboard-main-card-subtitle">Reports</p>
        <h2 className="dashboard-main-card-title">
          Your completed worklogs
        </h2>
        <p className="dashboard-main-card-text">
          Here you can see your resolved worklogs with status &quot;done&quot;.
        </p>
      </div>

      <div className="dashboard-filters">
        <div className="dashboard-filters-row">
          <div className="dashboard-filters-group">
            <label
              className="dashboard-filters-label"
              htmlFor="reports-search"
            >
              Search by description
            </label>
            <input
              id="reports-search"
              type="text"
              className="dashboard-filters-input"
              placeholder="Enter text..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="dashboard-filters-group">
            <label
              className="dashboard-filters-label"
              htmlFor="reports-project"
            >
              Project
            </label>
            <input
              id="reports-project"
              type="text"
              className="dashboard-filters-input"
              placeholder="Project name"
              value={project}
              onChange={(event) => setProject(event.target.value)}
            />
          </div>
        </div>
        <div className="dashboard-filters-row">
          <div className="dashboard-filters-group">
            <label
              className="dashboard-filters-label"
              htmlFor="reports-date-from"
            >
              Date from
            </label>
            <input
              id="reports-date-from"
              type="date"
              className="dashboard-filters-input"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </div>
          <div className="dashboard-filters-group">
            <label
              className="dashboard-filters-label"
              htmlFor="reports-date-to"
            >
              Date to
            </label>
            <input
              id="reports-date-to"
              type="date"
              className="dashboard-filters-input"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </div>
          <div className="dashboard-filters-actions">
            <button
              type="button"
              className="dashboard-filters-apply"
              onClick={handleApplyFilters}
              disabled={loading}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {loading && <p>Loading reports...</p>}
      {error && !loading && <p className="dashboard-error-text">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p>No reports found for selected filters.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <ul className="dashboard-list">
            {items.map((item) => (
              <li key={item.id}>
                <span className="dashboard-list-date">
                  {new Date(item.date).toLocaleDateString()}
                </span>
                <div className="dashboard-list-description">
                  <strong>Description:</strong> {item.description}
                  {item.llm_Description && (
                    <>
                      <br />
                      <strong>LLM description:</strong> {item.llm_Description}
                    </>
                  )}
                </div>
                <span className="dashboard-list-status dashboard-list-status--success">
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
          <div className="dashboard-pagination">
            <button
              type="button"
              className="dashboard-pagination-button"
              disabled={loading || page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Back
            </button>
            <span className="dashboard-pagination-info">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="dashboard-pagination-button"
              disabled={
                loading || page >= totalPages || total === 0 || total <= PAGE_SIZE
              }
              onClick={() =>
                setPage((current) => (current < totalPages ? current + 1 : current))
              }
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  )
}

export default DashboardReportsPage
