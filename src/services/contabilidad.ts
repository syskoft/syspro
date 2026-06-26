import { supabase } from '@/lib/supabase'
import type { PucConfig, PucConSaldo, PucCuenta } from '@/types/contabilidad'

export async function fetchPuc(emp_ide: string): Promise<PucCuenta[]> {
  const { data, error } = await supabase
    .from('puc_cuentas')
    .select('*')
    .eq('emp_ide', emp_ide)
    .eq('ina', false)
    .order('codigo')

  if (error) throw error
  return data ?? []
}

export async function updatePucCuenta(
  emp_ide: string,
  codigo: string,
  updates: { nombre?: string; tipo_naturaleza?: 'D' | 'C'; config?: PucConfig },
) {
  const { error } = await supabase
    .from('puc_cuentas')
    .update(updates)
    .eq('emp_ide', emp_ide)
    .eq('codigo', codigo)

  if (error) throw error
}

export async function fetchPucConSaldos(emp_ide: string): Promise<PucConSaldo[]> {
  const cuentas = await fetchPuc(emp_ide)

  const map = new Map<string, PucConSaldo>()
  const roots: PucConSaldo[] = []

  cuentas.forEach((c) =>
    map.set(c.codigo, {
      ...c,
      saldo_debito: 0,
      saldo_credito: 0,
      saldo_neto: 0,
      children: [],
    }),
  )

  cuentas.forEach((c) => {
    const node = map.get(c.codigo)!
    if (c.padre && map.has(c.padre)) {
      map.get(c.padre)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}
