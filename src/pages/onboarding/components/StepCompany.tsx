import { Button } from '@/components/ui/button'
import type { CompanyFormData } from '@/services/onboarding'

interface Props {
  data: CompanyFormData
  onChange: (data: CompanyFormData) => void
  onNext: () => void
}

const defaultData: CompanyFormData = {
  ide_emp: '',
  nom_com: '',
  raz_soc: '',
  dir: '',
  ciu: '',
  dep: '',
  tel: '',
  tel_2: '',
  tel_3: '',
  rep_leg: '',
  cc_rep_leg: '',
  per_ini_ano: new Date().getFullYear(),
  per_ini_mes: new Date().getMonth() + 1,
  pla_ctas: '',
  reg_tri: '',
  imp_vtas: 0,
}

export function StepCompany({ data, onChange, onNext }: Props) {
  const merged = { ...defaultData, ...data }

  function update(field: keyof CompanyFormData, value: string | number) {
    onChange({ ...merged, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Datos de la empresa</h2>
        <p className="text-sm text-muted-foreground">
          Ingresa la información de tu empresa para la facturación.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            NIT / C.C. *
          </label>
          <input
            type="text"
            required
            value={merged.ide_emp}
            onChange={(e) => update('ide_emp', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="123456789-0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Nombre comercial *
          </label>
          <input
            type="text"
            required
            value={merged.nom_com}
            onChange={(e) => update('nom_com', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Mi Empresa S.A.S."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Razón social *
          </label>
          <input
            type="text"
            required
            value={merged.raz_soc}
            onChange={(e) => update('raz_soc', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Mi Empresa S.A.S."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <input
            type="text"
            value={merged.dir}
            onChange={(e) => update('dir', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Cra 1 # 2-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ciudad</label>
          <input
            type="text"
            value={merged.ciu}
            onChange={(e) => update('ciu', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Bogotá"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Departamento
          </label>
          <input
            type="text"
            value={merged.dep}
            onChange={(e) => update('dep', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Cundinamarca"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            type="text"
            value={merged.tel}
            onChange={(e) => update('tel', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="601 1234567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Teléfono 2
          </label>
          <input
            type="text"
            value={merged.tel_2}
            onChange={(e) => update('tel_2', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="601 7654321"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Celular
          </label>
          <input
            type="text"
            value={merged.tel_3}
            onChange={(e) => update('tel_3', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="300 1234567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Representante legal
          </label>
          <input
            type="text"
            value={merged.rep_leg}
            onChange={(e) => update('rep_leg', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            C.C. Representante legal
          </label>
          <input
            type="text"
            value={merged.cc_rep_leg}
            onChange={(e) => update('cc_rep_leg', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="123456789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Régimen tributario
          </label>
          <select
            value={merged.reg_tri}
            onChange={(e) => update('reg_tri', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Seleccionar...</option>
            <option value="Regimen Común">Régimen Común</option>
            <option value="Regimen Simplificado">Régimen Simplificado</option>
            <option value="Gran Contribuyente">Gran Contribuyente</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Impuesto a las ventas (IVA %)
          </label>
          <input
            type="number"
            step="0.01"
            value={merged.imp_vtas}
            onChange={(e) => update('imp_vtas', Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="19.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Periodo inicial - Año
          </label>
          <input
            type="number"
            value={merged.per_ini_ano}
            onChange={(e) => update('per_ini_ano', Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Periodo inicial - Mes
          </label>
          <input
            type="number"
            min={1}
            max={12}
            value={merged.per_ini_mes}
            onChange={(e) => update('per_ini_mes', Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Plan de cuentas
          </label>
          <textarea
            value={merged.pla_ctas}
            onChange={(e) => update('pla_ctas', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            rows={3}
            placeholder="PUC estándar colombiano"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!merged.ide_emp || !merged.nom_com || !merged.raz_soc}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
