import { useEffect, useState } from 'react'

interface Props {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'confirm' | 'alert'
  onConfirm?: () => void
  onCancel?: () => void
}

export function AlertDialog({
  open,
  title = 'Confirmar',
  message,
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar',
  variant = 'confirm',
  onConfirm,
  onCancel,
}: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 transition-opacity duration-150"
      style={{ opacity: visible ? 1 : 0 }}
      onClick={variant === 'alert' ? onConfirm : onCancel}
    >
      <div
        className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg transition-all duration-150"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.95)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          {variant === 'confirm' && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={
              variant === 'confirm'
                ? 'rounded-md bg-destructive px-4 py-2 text-sm text-white hover:bg-destructive/90'
                : 'rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
