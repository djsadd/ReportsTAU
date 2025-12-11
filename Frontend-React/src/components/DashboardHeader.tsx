import { NavLink } from 'react-router-dom'

type DashboardHeaderProps = {
  onLogout: () => void
}

const SECTIONS = [
  { key: 'overview', label: 'Обзор', path: '/dashboard' },
  { key: 'stats', label: 'Статистика', path: '/stats' },
  { key: 'reports', label: 'Отчёты', path: '/reports' },
  { key: 'profile', label: 'Профиль', path: '/profile' },
] as const

const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header-left">
        <div className="dashboard-logo">
          <span className="dashboard-logo-mark">TAU</span>
          <span className="dashboard-logo-sub">Reports</span>
        </div>
        <nav className="dashboard-main-nav">
          {SECTIONS.map((section) => (
            <NavLink
              key={section.key}
              to={section.path}
              className={({ isActive }) =>
                `dashboard-main-nav-item${
                  isActive ? ' dashboard-main-nav-item--active' : ''
                }`
              }
              end={section.path === '/dashboard'}
            >
              {section.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="dashboard-header-right">
        <button
          type="button"
          className="dashboard-cabinet-button"
          onClick={onLogout}
        >
          Выйти
        </button>
      </div>
    </header>
  )
}

export default DashboardHeader

