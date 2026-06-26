# SYSPRO - ERP

> **Empresa:** SYSKOFT
> **Proyecto:** SYSPRO - Sistema ERP multiinquilino
> **Stack:** React 19 + Vite 8 + TypeScript + Tailwind CSS v4 + Shadcn/ui + Supabase

---

## Setup Guide (para probar)

### 1. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Copia las credenciales a `.env`:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...  (anon public key)
   SUPABASE_SERVICE_KEY=eyJ...    (service_role key)
   ```
3. En el SQL Editor de Supabase, ejecuta en orden:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_contabilidad.sql`
   - `supabase/seed_completo.sql`

### 2. Crear usuario demo

```bash
npm run seed
```

Esto crea: **admin@demo.com** / **Demo1234!** (empresa `SYSPRO_DEMO`)

### 3. Iniciar

```bash
npm run dev
```

---

## Fases Completadas

### Fase 0 — Scaffolding ✅
### Fase 1 — Base de Datos y Autenticación ✅
### Fase 2 — Onboarding / Creación de Empresa ✅
### Fase 3 — Dashboard y Navegación ✅

---

## Fase 4 — Módulo de Contabilidad ✅

### Arquitectura de datos

| Tabla | Propósito |
|---|---|
| `puc_cuentas` | Plan Único de Cuentas (jerárquico, multiinquilino) |
| `tipo_comprobante` | Tipos de comprobante (AP, DI, IN, EG, NO, CI) |
| `comprobantes` | Cabecera de asientos contables (con consecutivo automático) |
| `asientos_contables` | Detalle débito/crédito de cada comprobante |
| `comprobante_seq` | Control de consecutivos por empresa y tipo |

### Funcionalidades implementadas

| Ruta | Pantalla |
|---|---|
| `/dashboard/contabilidad/comprobantes` | Listado de comprobantes con totales |
| `/dashboard/contabilidad/comprobantes/nuevo` | Crear asiento (selección de cuenta PUC, débito/crédito, validación de cuadre) |
| `/dashboard/contabilidad/comprobantes/:ide` | Detalle del comprobante con desglose de asientos |
| `/dashboard/contabilidad/puc` | Árbol jerárquico del PUC con expansión, creación de nuevas cuentas |
| `/dashboard/contabilidad/libro-mayor` | Saldos por cuenta con búsqueda |
| `/dashboard/contabilidad/balance-prueba` | Balance de prueba con totales y verificación de cuadre |

### Seed PUC Colombiano incluido

Se sembraron las 7 clases del PUC estándar colombiano:
- **Clase 1** Activo (Disponible, Inversiones, Deudores, Inventarios, PP&E, Intangibles, Diferidos)
- **Clase 2** Pasivo (Obligaciones Financieras, Proveedores, Cuentas por Pagar, Impuestos, Laborales)
- **Clase 3** Patrimonio (Capital, Utilidades, Reservas, Dividendos)
- **Clase 4** Ingresos (Operacionales, No Operacionales)
- **Clase 5** Gastos (Administración, Ventas, No Operacionales)
- **Clase 6** Costos de Ventas
- **Clase 7** Costos de Producción

### Datos de muestra (demo)

- Empresa: **SYSPRO_DEMO**
- Comprobante de apertura (capital $50M)
- Compra de mercancía ($5M)
- Pago de nómina ($3M)
- Usuario: **admin@demo.com** / **Demo1234!**

### Pendiente para próximas fases:
- [ ] Facturación electrónica (DIAN) — documentos, consecutivos, XML
- [ ] Inventarios — productos, categorías, bodegas, movimientos
- [ ] POS — caja, ventas rápidas, tiquetes
- [ ] Restaurante — mesas, pedidos, comandas
- [ ] CRM — clientes, contactos, oportunidades
- [ ] Informes — reportes, gráficos, exportación
