export type WorkLogItem = {
  id: number
  user_id: number
  description: string
  llm_Description: string | null
  project: string | null
  date: string
  created_at: string
  updated_at: string
  status: string
}

export type PaginatedWorkLogs = {
  items: WorkLogItem[]
  total: number
  page: number
  page_size: number
}
