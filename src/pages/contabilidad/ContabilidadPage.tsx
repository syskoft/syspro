import { ModuleLauncher } from '@/components/ModuleLauncher'
import { subModules } from '@/data/subModules'

export function ContabilidadPage() {
  return <ModuleLauncher variant="page" title="Contabilidad" items={subModules.contabilidad} searchable />
}
