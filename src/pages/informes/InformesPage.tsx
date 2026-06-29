import { ModuleLauncher } from '@/components/ModuleLauncher'
import { subModules } from '@/data/subModules'
export function InformesPage() { return <ModuleLauncher variant="page" title="Informes" items={subModules.informes ?? []} searchable /> }
