import { ModuleLauncher } from '@/components/ModuleLauncher'
import { subModules } from '@/data/subModules'

export function CatalogoPage() {
  return <ModuleLauncher variant="page" title="Catálogos" items={subModules.catalogos} searchable />
}
