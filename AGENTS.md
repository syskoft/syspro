# SYSPRO — Convenciones para Agentes

## Stack
- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4 + Shadcn/ui + Lucide icons
- Supabase (PostgreSQL + Auth)
- React Router DOM v7

## Estructura de carpetas
```
src/
├── components/
│   ├── ui/              ← shadcn/ui (Button)
│   ├── CrudPage.tsx      ← CRUD completo con modal (crear + editar)
│   ├── DataTable.tsx     ← tabla con paginación, inline edit, canDelete
│   ├── DataForm.tsx      ← formulario con labels + widths dinámicos
│   ├── FilterBar.tsx     ← filtros con Consultar / Limpiar
│   ├── TabBar.tsx        ← pestañas con historial, drag & drop, cerrar
│   ├── Modal.tsx         ← modal reutilizable con overlay + ESC
│   ├── SuperBox.tsx      ← buscador/selector genérico (SuperBoxItem)
│   ├── ModuleLauncher.tsx ← lanzador de submódulos (modal/page variant)
│   ├── Permiso.tsx       ← wrapper para permisos por acción
│   ├── EmpresaLogo.tsx   ← logo empresa con fallback de inicial
│   ├── ThemeToggle.tsx   ← cambio claro/oscuro
│   ├── AlertDialog.tsx   ← confirmación reutilizable
│   ├── StatusBadge.tsx   ← StatusBadge + RoleBadge con colores
│   ├── SearchInput.tsx   ← input con lupa
│   ├── Sidebar.tsx       ← sidebar con módulos dinámicos (plan + permisos)
│   └── ProtectedRoute.tsx
├── layouts/
│   ├── AuthLayout.tsx
│   └── DashboardLayout.tsx ← header + TabBar + Outlet
├── contexts/
│   └── AuthContext.tsx   ← useAuth()
├── hooks/
│   ├── useAlert.tsx      ← confirm() / alert() basado en promesas
│   └── usePermiso.ts     ← usePermiso('articulos.crear') → boolean
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── contabilidad/
│   │   ├── ContabilidadPage.tsx    ← launcher con sub-módulos
│   │   ├── PucPage.tsx
│   │   └── DefinicionCuentasPage.tsx
│   ├── catalogos/                  ← Catálogos (Art, Imp, Serv)
│   │   ├── CatalogoPage.tsx
│   │   ├── ArticulosPage.tsx       ← CRUD con impuestos multi-tarifa
│   │   ├── ImpuestosPage.tsx       ← tarifas + config contable modal
│   │   └── ServiciosPage.tsx       ← placeholder
│   ├── admin/                      ← solo superadmin
│   │   ├── AdminPanel.tsx          ← tabs internos
│   │   ├── AdminEmpresasPage.tsx
│   │   ├── AdminPlanesPage.tsx
│   │   ├── AdminSuscripcionesPage.tsx
│   │   ├── AdminModulosPlanPage.tsx
│   │   └── AdminUsuariosPage.tsx
│   ├── modules/
│   ├── onboarding/
│   └── settings/
│       ├── CompanyProfilePage.tsx
│       ├── UsersPage.tsx            ← CRUD usuarios + roles
│       └── PermisosPage.tsx         ← permisos por usuario (modal)
├── services/
│   ├── admin.ts, contabilidad.ts, onboarding.ts
│   ├── articulos.ts, impuestos.ts, empresa.ts
│   └── permisos.ts
├── data/
│   └── subModules.ts               ← submódulos de Contabilidad, Catálogos
├── types/
│   ├── database.ts                  ← interfaces SQL
│   └── contabilidad.ts              ← PucCuenta, PucConSaldo
└── lib/
    ├── supabase.ts
    └── utils.ts                     ← cn()
```

## Convenciones de código

### 1. Componentes base primero
| Necesitas | Usa |
|---|---|
| CRUD completo | `<CrudPage>` |
| Solo tabla | `<DataTable>` |
| Formulario | `<DataForm>` |
| Filtros | `<FilterBar>` |
| Modal | `<Modal>` |
| Buscador/Selector | `<SuperBox>` |
| Launcher submódulos | `<ModuleLauncher>` |
| Proteger por permiso | `<Permiso accion="x">` |
| Badge activo/inactivo | `<StatusBadge>` |
| Badge de rol | `<RoleBadge>` |
| Logo empresa | `<EmpresaLogo>` |
| Toggle claro/oscuro | `<ThemeToggle>` |
| Tabs navegación | `<TabBar>` |
| Confirmación | `<AlertDialog>` / `useAlert()` |

### 2. CrudPage — props principales
```tsx
<CrudPage
  title="Artículos"
  filterFields={FilterField[]}
  onSearch={handleSearch}
  onClear={handleClear}
  fields={DataField[]}
  columns={DataColumn[]}
  data={items}
  loading={loading}
  onCreate={async (vals) => { ... }}
  onSave={async (row) => { await update(row); refetch() }}
  onDelete={async (row) => { ... }}
  permisoCrear="articulos.crear"     ← Permiso wrapper automático
  permisoEditar="articulos.editar"
  permisoEliminar="articulos.eliminar"
  canDelete={(row) => row.id !== userId}  ← deshabilita 🗑 por fila
  renderModalContent={({ formVals, onChange, isEditing }) => ( ... )}
  modalWidth="lg"
/>
```
- Formulario de creación en **modal**
- Formulario de edición en **modal** (click en ✎)
- Errores se muestran dentro del modal (`error: string | null`)
- `create` y `edit` tienen `try/catch` que captura errores

### 3. DataTable — columnas
```tsx
columns={[
  { key: 'codigo', label: 'Código' },
  { key: 'nombre', label: 'Nombre', editable: true },
  { key: 'estado', label: 'Estado', render: (v) => <StatusBadge active={v} />,
    renderEdit: (v, row, onChange) => (
      <select onChange={(e) => onChange(e.target.value)}>...</select>
    ),
  },
]}
```
- `canDelete?: (row) => boolean` → deshabilita 🗑 si retorna false
- `onEditClick?: (row) => void` → reemplaza inline edit con modal
- `permisoEditar` / `permisoEliminar` → Permiso wrapper automático

### 4. DataForm — campos con width dinámico
```tsx
fields={[
  { key: 'codigo', label: 'Código', required: true },
  { key: 'precio', label: 'Precio', type: 'number' },       // → width: 'sm' (25%)
  { key: 'nombre', label: 'Nombre' },                         // → width: 'full' (75%)
  { key: 'clase', label: 'Clase', type: 'select', options }   // → width: 'md' (50%)
]}
```
- `number` → automático `width: 'sm'`
- `select` → automático `width: 'md'`
- `text` → automático `width: 'full'`
- Grilla responsive: 1 col (mobile) → 2 (sm) → 4 (lg)

### 5. SuperBox — buscador genérico
```tsx
<SuperBox
  value={selectedId}
  items={items.map(i => ({ id: i.id, label: i.nombre, secondaryLabel: i.codigo }))}
  onChange={(id) => setSelected(id)}
  placeholder="Buscar..."
/>
```
- Filtra mientras escribes por `label` y `secondaryLabel`
- Input compacto con icono 🔍
- Dropdown posicionado absoluto

### 6. Permiso — wrapper de acciones
```tsx
<Permiso accion="articulos.crear">
  <Button>Nuevo artículo</Button>
</Permiso>
```
- `superadmin` → siempre pasa directo
- `usuario sin permiso` → clona child con `disabled + title`
- `accion=""` (vacío) → pasa directo

### 7. usePermiso — hook
```tsx
const puedeEditar = usePermiso('articulos.editar')
if (puedeEditar) { ... }
```
- Superadmin → true
- Normal → verifica `usuario_permisos` (cache en memoria)

### 8. Nombres de tablas en Supabase
| Tabla | Nombre |
|---|---|
| Empresas | `empresas` |
| Planes | `tipos_suscripcion` |
| Suscripciones | `suscripciones` |
| Usuarios | `usuarios` |
| PUC | `puc_cuentas` |
| Artículos | `articulos` |
| Tarifas impuestos | `tarifas_impuestos` |
| Permisos acciones | `permiso_acciones` |
| Permisos x usuario | `usuario_permisos` |
| Módulos sistema | `modulos_sistema` |
| Módulos x plan | `plan_modulos` |

### 9. Migraciones SQL
| # | Archivo | Contenido |
|---|---|---|
| 001 | `001_schema.sql` | esquema base (empresas, suscripciones, usuarios) |
| 002 | `002_contabilidad.sql` | PUC + comprobantes (obsoleto, limpiado) |
| 003-006 | Varios | renombres, limpieza, rename tables |
| 007 | `007_puc_completo.sql` | PUC colombiano completo (834 cuentas) |
| 008 | `008_puc_config.sql` | columna config JSONB |
| 009 | `009_empresa_logo.sql` | logo_url en empresas |
| 010 | `010_def_cuentas.sql` | definición de cuentas contables |
| 011-012 | fixes RLS | correcciones políticas |
| 013 | `013_onboarding_rpc.sql` | RPC para onboarding |
| 014 | `014_modulos_sistema.sql` | módulos + plan_modulos |
| 015 | `015_catalogos_modulo.sql` | Catálogos |
| 016 | `016_articulos.sql` | tabla artículos |
| 017 | `017_impuestos.sql` | clases, tarifas, config contable |
| 018 | `018_articulo_impuestos.sql` | impuestos por artículo |
| 019 | `019_permisos.sql` | acciones + permisos + trigger |
| 020 | `020_admin_create_user.sql` | RPC crear usuario sin sesión |
| 021 | `021_articulos_precios.sql` | Precios por artículo con impuestos |
| 022 | `022_precios_permisos.sql` | Permisos para el módulo Precios |
| 023 | `023_listas_precios.sql` | Catálogo de listas de precios + items |
| 024 | `024_cleanup.sql` | Agregar costos a articulos, eliminar articulos_precios |
| 025 | `025_permisos_listas_precios.sql` | Permisos para Listas de Precios |

### 10. Autenticación
- `useAuth()` → `{ user, session, profile, loading, signIn, signOut }`
- `profile.role`: `'superadmin'` | `'admin'` | `'operator'` | etc.
- El usuario **actual** (`juansebastian@syskoft.com`) es el único `superadmin`
- Al crear usuarios: el rol `superadmin` está bloqueado
- Al editar: `superadmin` solo puede editarlo el usuario actual

### 11. Roles disponibles
| Rol | Badge | Descripción |
|---|---|---|
| `superadmin` | 🟣 Morado | Solo 1, acceso total |
| `admin` | 🔵 Azul | Administrador |
| `operator` | 🟢 Verde | Operador |
| `consultant` | 🟠 Ámbar | Consultor |
| `seller` | 🟦 Cian | Vendedor |
| `warehouse` | 🟧 Naranja | Bodeguero |

### 12. Estilos
- Tailwind CSS v4 + variables `@theme inline`
- Clases tema: `theme-input`, `theme-nav-item`, `theme-table-row`, etc.
- Tema oscuro: inyecta `<style>` con `:root:root { ... }`
- `cn()` de `@/lib/utils` para clases condicionales

### 13. Cómo agregar un módulo con submódulos
1. `src/data/subModules.ts` → agregar entrada
2. `src/pages/[modulo]/[ModuloPage].tsx` → página con `ModuleLauncher variant="page"`
3. `src/App.tsx` → ruta
4. `src/components/TabBar.tsx` → label
5. `supabase/migrations/XXX.sql` → agregar a `modulos_sistema` + `plan_modulos`

### 14. Cómo crear una página admin (superadmin)
1. Archivo en `src/pages/admin/`
2. Servicios en `src/services/admin.ts`
3. Usar `<CrudPage>` con filtros + formulario + tabla
4. Hook guard después de todos los hooks: `if (profile?.role !== 'superadmin') return`
