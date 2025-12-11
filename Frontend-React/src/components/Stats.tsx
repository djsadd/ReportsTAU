const STATS_ITEMS = [
  {
    title: 'Еженедельная активность по отчётам',
    status: 'Стабильно',
    type: 'success',
  },
  {
    title: 'Среднее время ответа на отчёт',
    status: 'В пределах нормы',
    type: 'pending',
  },
  {
    title: 'Новых отчётов за неделю',
    status: 'Демо-данные',
    type: 'draft',
  },
] as const

export default function Stats() {
  return (
    <section className="dashboard-main-card">
      <div className="dashboard-main-card-header">
        <p className="dashboard-main-card-subtitle">Статистика</p>
        <h2 className="dashboard-main-card-title">
          Демонстрационная статистика отчётов
        </h2>
        <p className="dashboard-main-card-text">
          Здесь пока отображаются фейковые данные. Позже сюда можно будет
          подключить реальные метрики из сервиса отчётов.
        </p>
      </div>
      <ul className="dashboard-list">
        {STATS_ITEMS.map((item) => (
          <li key={item.title}>
            <span className="dashboard-list-title">{item.title}</span>
            <span
              className={`dashboard-list-status dashboard-list-status--${item.type}`}
            >
              {item.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

