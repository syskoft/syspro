import { useCallback, useState } from 'react'

export interface AlertOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'confirm' | 'alert'
}

type AlertResolver = (value: boolean) => void

export function useAlert() {
  const [state, setState] = useState<{ opts: AlertOptions; resolve: AlertResolver } | null>(null)

  const confirm = useCallback((opts: AlertOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ opts: { variant: 'confirm', cancelLabel: 'Cancelar', ...opts }, resolve })
    })
  }, [])

  const alert = useCallback((opts: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      const wrapped: AlertResolver = (v) => { resolve(); return v as unknown as void }
      setState({ opts: { variant: 'alert', ...opts }, resolve: wrapped })
    })
  }, [])

  function dismiss(result: boolean) {
    state?.resolve(result)
    setState(null)
  }

  const dialog = state ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => state.opts.variant === 'alert' && dismiss(true)}>
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-2 text-lg font-semibold">{state.opts.title ?? (state.opts.variant === 'confirm' ? 'Confirmar' : 'Aviso')}</h3>
        <p className="text-sm text-muted-foreground">{state.opts.message}</p>
        <div className="mt-4 flex justify-end gap-2">
          {state.opts.variant === 'confirm' && (
            <button type="button" onClick={() => dismiss(false)}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent">
              {state.opts.cancelLabel ?? 'Cancelar'}
            </button>
          )}
          <button type="button" onClick={() => dismiss(true)}
            className={state.opts.variant === 'confirm'
              ? 'rounded-md bg-destructive px-4 py-2 text-sm text-white hover:bg-destructive/90'
              : 'rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90'
            }>
            {state.opts.confirmLabel ?? (state.opts.variant === 'confirm' ? 'Confirmar' : 'Aceptar')}
          </button>
        </div>
      </div>
    </div>
  ) : null

  return { confirm, alert, dialog }
}
