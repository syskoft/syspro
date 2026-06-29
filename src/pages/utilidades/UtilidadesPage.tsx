import { ModuleLauncher } from '@/components/ModuleLauncher'
import { subModules } from '@/data/subModules'
export function UtilidadesPage() { return <ModuleLauncher variant="page" title="Utilidades" items={subModules.utilidades ?? []} searchable /> }
