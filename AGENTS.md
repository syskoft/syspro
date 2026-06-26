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
│   ├── ui/              ← shadcn/ui (Button, etc.)
│   ├── CrudPage.tsx      ← CRUD completo (tabla + form + filtros + nuevo)
│   ├── DataTable.tsx     ← tabla genérica con paginación y edición inline
│   ├── DataForm.tsx      ← formulario genérico con labels y validación
│   ├── FilterBar.tsx     ← barra de filtros con Consultar / Limpiar
│   ├── TabBar.tsx        ← strip de pestañas múltiples con drag & close
│   ├── AlertDialog.tsx   ← modal de confirmación/aviso reutilizable
│   ├── StatusBadge.tsx   ← badge Activo/Inactivo + RoleBadge
│   ├── SearchInput.tsx   ← input de búsqueda con lupa
│   ├── Sidebar.tsx       ← sidebar con módulos y openTab()
│   └── ProtectedRoute.tsx
├── layouts/
│   ├── AuthLayout.tsx    ← layout de login
│   └── DashboardLayout.tsx ← layout con Sidebar + TabBar + contenido
├── contexts/
│   ├── AuthContext.tsx   ← autenticación (useAuth)
│   └── TabContext.tsx    ← tabs múltiples (useTabs)
├── hooks/
│   ├── useAlert.tsx      ← confirm() / alert() basado en promesas
│   └── useModuleContent.tsx ← mapa id → {label, icon, content}
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── contabilidad/
│   ├── admin/
│   │   ├── AdminPanel.tsx       ← panel con Tabs internos
│   │   ├── AdminEmpresasPage.tsx
│   │   ├── AdminPlanesPage.tsx
│   │   ├── AdminSuscripcionesPage.tsx
│   │   └── AdminUsuariosPage.tsx
│   ├── modules/
│   ├── onboarding/
│   └── settings/
├── services/             ← API calls a Supabase
│   ├── admin.ts          ← CRUD empresas, planes, suscripciones, usuarios
│   ├── contabilidad.ts   ← PUC
│   └── onboarding.ts     ← creación de empresa
├── types/
│   ├── database.ts       ← interfaces de tablas SQL
│   └── contabilidad.ts   ← PUC
└── lib/
    ├── supabase.ts       ← cliente Supabase
    └── utils.ts          ← cn() function
```

## Convenciones de código

### 1. Componentes base primero
Siempre revisa `src/components/` antes de crear HTML repetitivo.

| Necesitas | Usa |
|---|---|
| Tabla con CRUD | `<CrudPage>` |
| Solo tabla (sin CRUD) | `<DataTable>` |
| Formulario | `<DataForm>` |
| Filtros | `<FilterBar>` |
| Tabs múltiples | `<TabBar>` + `useTabs()` |
| Badge activo/inactivo | `<StatusBadge>` |
| Badge SUPERADMIN/Admin | `<RoleBadge>` |
| Confirmación/aviso | `useAlert().confirm()` / `<AlertDialog>` |
| Input con lupa | `<SearchInput>` |

### 2. CrudPage (para páginas admin con CRUD completo)
```tsx
<CrudPage
  title="Empresas"
  filterFields={[
    { key: 'search', label: 'Buscar', placeholder: 'NIT o nombre...' },
    { key: 'ina', label: 'Estado', type: 'select', options: [
      { value: 'activas', label: 'Activas' },
      { value: 'inactivas', label: 'Inactivas' },
    ]},
  ]}
  onSearch={async (filters) => { setData(await fetchData(filters)) }}
  onClear={() => setData([])}
  fields={formFields}          ← DataForm fields
  columns={columnDefs}         ← DataTable columns
  data={items}
  loading={loading}
  onCreate={async (vals) => { await create(vals); refetch() }}
  onSave={async (row) => { await update(row.id, row); refetch() }}
  onDelete={async (row) => { if (confirm(...)) { await del(row.id); refetch() } }}
/>
```

### 3. DataTable - columnas
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
- `editable: true` → permite edición inline si hay `onSave`
- `render` → custom display
- `renderEdit` → custom editor cuando está en modo edición
- Paginación automática (10/20/50/100)
- Muestra "Total de registros: N"

### 4. DataForm - campos
```tsx
fields={[
  { key: 'nom_com', label: 'Nombre', required: true },
  { key: 'ciu', label: 'Ciudad' },
  { key: 'ina', label: 'Estado', type: 'select', options: [
    { value: 'si', label: 'Inactivo' },
  ]},
  { key: 'valor', label: 'Valor', type: 'number' },
]}
```

### 5. FilterBar - filtros
```tsx
<FilterBar
  fields={[
    { key: 'search', label: 'Buscar', placeholder: 'Texto...' },
    { key: 'estado', label: 'Estado', type: 'select', options: [
      { value: 'activos', label: 'Activos' },
    ]},
  ]}
  onSearch={(values) => fetchData(values)}
  onClear={() => setData([])}
/>
```
- No consulta automáticamente → el usuario debe hacer clic en "Consultar"
- "Limpiar" resetea filtros y vacía resultados

### 6. TabContext / TabBar (sistema multitabs)
```tsx
const { tabs, activeTab, collapsed, openTab, closeTab, setActive, toggleCollapse, setTabDirty } = useTabs()

openTab('mi-modulo', 'Mi Módulo', <MiComponente />, <Icon size={14} />)
```
- Máx 10 pestañas
- Dashboard es fija (no cerrable)
- Las pestañas mantienen su estado al cambiar (no se desmontan)
- `setTabDirty(id, true, 'Mensaje')` → muestra confirmación al cerrar
- `collapsed` → oculta todas las tabs excepto Dashboard
- Drag & drop para reordenar
- Persistencia en localStorage

### 7. AlertDialog / useAlert
```tsx
// Como hook:
const { confirm, alert, dialog } = useAlert()
// Renderizar {dialog} en el JSX
const ok = await confirm({ title: '¿Eliminar?', message: '...', confirmLabel: 'Eliminar' })

// O como componente:
<AlertDialog open={open} message="..." onConfirm={handleConfirm} onCancel={handleCancel} />
```

### 8. Nombres de tablas en Supabase
| Tabla | Nombre correcto |
|---|---|
| Empresas | `empresas` |
| Planes | `tipos_suscripcion` |
| Suscripciones | `suscripciones` |
| Usuarios | `usuarios` |
| PUC | `puc_cuentas` |

### 9. Autenticación
- `useAuth()` devuelve `{ user, session, profile, loading, signIn, signOut }`
- `profile.role` es `'admin'` o `'superadmin'`
- Proteger páginas admin: `if (profile?.role !== 'superadmin') return <p>Acceso no autorizado</p>`

### 10. Estilos
- Tailwind CSS v4 con `@theme inline` en `index.css`
- Tema claro/oscuro via clase `.dark`
- Usar variables CSS: `bg-card`, `border-input`, `text-muted-foreground`, etc.
- Para clases condicionales: `cn()` de `@/lib/utils`

### 11. Cómo crear una página admin nueva
1. Crear archivo en `src/pages/admin/`
2. Definir `filterFields` para filtros
3. Definir `fields` para el formulario de creación
4. Definir `columns` para la tabla
5. `handleSearch` llama a fetch con filtros (sin carga automática)
6. `handleClear` vacía resultados
7. Usar `<CrudPage>` con todas las props arriba
8. Proteger con `if (profile?.role !== 'superadmin') return`
9. Servicios van en `src/services/admin.ts`

### 12. Cómo agregar un módulo nuevo al sistema de tabs
1. Agregar entrada en `src/hooks/useModuleContent.tsx` → `useModuleContent()`
2. El sidebar y el sistema de tabs lo detectan automáticamente
3. Crear el componente de la página donde corresponda
