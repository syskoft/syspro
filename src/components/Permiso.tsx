import { cloneElement, type ReactElement } from 'react'

import { usePermiso } from '@/hooks/usePermiso'

interface Props {
  accion: string
  children: ReactElement<{ disabled?: boolean; title?: string }>
}

export function Permiso({ accion, children }: Props) {
  const tiene = usePermiso(accion)

  if (!accion || tiene) return children

  return cloneElement(children, {
    disabled: true,
    title: children.props.title || 'No tienes permiso para esta acción',
  })
}
