export type LoginPageProps = {
  widgetKey: number
  manualId: string
  onManualIdChange: (value: string) => void
  manualLoading: boolean
  manualMessage: string | null
  onManualLogin: () => Promise<void>
}
