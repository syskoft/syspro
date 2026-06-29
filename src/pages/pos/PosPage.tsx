import { ModuleLauncher } from '@/components/ModuleLauncher'
import { subModules } from '@/data/subModules'
export function PosPage() { return <ModuleLauncher variant="page" title="POS" items={subModules.pos ?? []} searchable /> }
