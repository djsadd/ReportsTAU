import type { UserDetails } from '../types/user'

type DashboardProfilePageProps = {
  user: UserDetails
}

const DashboardProfilePage = ({ user }: DashboardProfilePageProps) => {
  const displayName =
    user.first_name || user.username || `Пользователь #${user.id}`

  const authDateLabel = user.auth_date
    ? new Date(user.auth_date * 1000).toLocaleString('ru-RU', {
        hour12: false,
      })
    : '—'

  return (
    <section className="dashboard-main-card">
      <div className="dashboard-main-card-header">
        <p className="dashboard-main-card-subtitle">Профиль</p>
        <h2 className="dashboard-main-card-title">{displayName}</h2>
        <p className="dashboard-main-card-text">
          Здесь собрана основная информация о вашем Telegram-профиле и данных
          авторизации. Эти данные используются для персонализации отчётов и
          безопасного доступа к сервису.
        </p>
      </div>
      <dl className="dashboard-details-grid">
        <div>
          <dt>Telegram ID</dt>
          <dd>{user.telegram_id ?? '—'}</dd>
        </div>
        <div>
          <dt>Имя</dt>
          <dd>{user.first_name ?? '—'}</dd>
        </div>
        <div>
          <dt>Фамилия</dt>
          <dd>{user.last_name ?? '—'}</dd>
        </div>
        <div>
          <dt>Username</dt>
          <dd>{user.username ? `@${user.username}` : '—'}</dd>
        </div>
        <div>
          <dt>Дата авторизации</dt>
          <dd>{authDateLabel}</dd>
        </div>
      </dl>
    </section>
  )
}

export default DashboardProfilePage

