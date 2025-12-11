import type { PropsWithChildren } from 'react'

import DashboardHeader from './DashboardHeader'

type DashboardProps = PropsWithChildren<{
  onLogout: () => void
}>

const Dashboard = ({ onLogout, children }: DashboardProps) => {
  return (
    <div className="dashboard-page">
      <DashboardHeader onLogout={onLogout} />

      <main className="dashboard-content">
        <div className="dashboard-content-header">
          <div>
            <p className="dashboard-breadcrumb">
              Рабочий кабинет TAU Reports
            </p>
            <h1 className="dashboard-title">Управление отчётами и аналитикой</h1>
            <p className="dashboard-subtitle">
              Используйте навигацию в хедере, чтобы переключаться между
              разделами «Обзор», «Статистика», «Отчёты» и «Профиль». При
              обновлении страницы вы останетесь на том же разделе.
            </p>
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}

export default Dashboard

