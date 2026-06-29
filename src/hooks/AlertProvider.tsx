import { createContext, useContext, type ReactNode } from 'react'
import { useAlert, type AlertOptions } from './useAlert'

interface AlertContextValue {
  confirm: (opts: AlertOptions) => Promise<boolean>
  alert: (opts: AlertOptions) => Promise<void>
}

const AlertContext = createContext<AlertContextValue | null>(null)

export function AlertProvider({ children }: { children: ReactNode }) {
  const { confirm, alert, dialog } = useAlert()
  return (
    <AlertContext.Provider value={{ confirm, alert }}>
      {dialog}
      {children}
    </AlertContext.Provider>
  )
}

export function useAlertContext(): AlertContextValue {
  const ctx = useContext(AlertContext)
  if (!ctx) throw new Error('useAlertContext must be used within AlertProvider')
  return ctx
}
