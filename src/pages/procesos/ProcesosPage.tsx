import { ModuleLauncher } from '@/components/ModuleLauncher'
import { subModules } from '@/data/subModules'
export function ProcesosPage() { return <ModuleLauncher variant="page" title="Procesos" items={subModules.procesos ?? []} searchable /> }
