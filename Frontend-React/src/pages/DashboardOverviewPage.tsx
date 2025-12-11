const OVERVIEW_STATS = [
  { label: 'Показателей за последнюю неделю', value: '12' },
  { label: 'Активных рабочих записей', value: '48' },
  {
    label: 'Среднее время ответа по отчётам',
    value: '1.5 ч',
  },
  { label: 'Доля успешно обработанных отчётов', value: '92%' },
] as const

const DashboardOverviewPage = () => {
  return (
    <section className="dashboard-main-card">
      <div className="dashboard-main-card-header">
        <p className="dashboard-main-card-subtitle">
          Обзор отчётности и активности
        </p>
        <h2 className="dashboard-main-card-title">
          Добро пожаловать в панель TAU
        </h2>
        <p className="dashboard-main-card-text">
          Здесь вы видите общий обзор по отчётам, активности пользователей и
          ключевым метрикам. Эти данные помогут быстро оценить состояние
          системы, понять динамику и приоритизировать работу с отчётами.
        </p>
      </div>
      <dl className="dashboard-stats-grid">
        {OVERVIEW_STATS.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default DashboardOverviewPage

