# Plan — Sprint demo 1 + 2 (CIE Nicaragua)

Acercar el prototipo a lo que pide el TDR v2: sistema clínico defendible, no solo dashboard. Todo sigue siendo mock (sin backend), pero la UI ya refleja el modelo del CIE.

## Qué se agrega (visible para el usuario)

### Sprint demo 1 — núcleo clínico + multi-sede

1. **Selector de sede en el header** (Santo Domingo, Las Colinas, Estelí, Masaya, León) + opción "Consolidado nacional". Filtra dashboard, niños, horario y facturación.
2. **Nueva pestaña "Programas clínicos"** dentro del expediente `/ninos/:id`, con:
   - Selector de **modelo clínico**: ABA · ESDM-Denver · Hanley/PFA.
   - Jerarquía visible: Dominio → Programa → Target → Ítem/SD.
   - 1 programa de ejemplo por modelo, ya cargado con datos demo.
   - **Gráfico de línea de fase** (Recharts) con líneas verticales de cambio de fase y badge de masterización (umbral · consistencia · generalización).
   - **Plan de crisis Hanley** visible como tarjeta destacada cuando el niño tiene modelo Hanley y riesgo alto.
3. **Catálogo CIE** en `/biblioteca` (nueva ruta): servicios nativos (IT, PFA, Habilidades Sociales, Fisio, Logo, Evaluaciones, Familia) con cupos INSS, rango de edad y modalidad.

### Sprint demo 2 — gobernanza y calidad

4. **Matriz RBAC visual** en `/equipo` (nueva ruta): roles del organigrama CIE (Dir. Clínica, Subdirección, Supervisor, Coordinador, Terapeuta, Esp. Familia, TI) × permisos. Solo lectura, demostrativa.
5. **Checklist INSS bloqueante** en el expediente: si faltan documentos requeridos, el botón "Activar intervención" queda deshabilitado con tooltip explicando qué falta.
6. **Badge IOA** (acuerdo entre observadores) en sesiones marcadas como dobles, con % de acuerdo simulado.
7. **Alerta de estancamiento** en el dashboard: tarjeta que lista niños sin progreso > 3 semanas en algún target.

## Arquitectura (sección técnica)

```text
src/lib/
  sedes.ts                 -> catálogo de sedes + hook useSedeActiva (localStorage)
  modelos-clinicos.ts      -> ABA | ESDM | Hanley + programas demo por modelo
  rbac.ts                  -> roles, permisos, matriz
  catalogo-cie.ts          -> servicios CIE con cupos INSS
  checklist-inss.ts        -> documentos requeridos + estado por niño

src/components/
  sede-selector.tsx        -> dropdown en header
  programa-clinico-card.tsx
  fase-chart.tsx           -> Recharts line + ReferenceLine
  masterizacion-badge.tsx
  hanley-crisis-card.tsx
  rbac-matriz.tsx
  ioa-badge.tsx
  alerta-estancamiento.tsx

src/routes/
  _app.biblioteca.tsx      -> catálogo CIE
  _app.equipo.tsx          -> matriz RBAC
  _app.ninos.$id.tsx       -> añadir tab "Programas clínicos" + checklist INSS bloqueante
  _app.tsx                 -> integrar SedeSelector en header
  _app.dashboard.tsx       -> añadir alerta de estancamiento + filtro por sede
```

- Toda la data sigue en `demo-data.ts` extendida; sin Cloud.
- El filtro por sede vive en un `useSedeActiva()` (Context + localStorage) que cada vista consume.
- Sidebar: agregar "Biblioteca clínica" en Operación y "Equipo y permisos" en Gestión.

## Lo que NO entra (queda para fase real con backend)

- Offline-first en sesión, log inmutable 7 años, firmas digitales.
- Motor de reglas de versionado (semver clínico) editable.
- IOA real con doble registro en vivo.
- Reportes INSS firmados/exportables a PDF oficial.

Estos quedan documentados como "Fase real" pero no se prototipan ahora para mantener el demo navegable y honesto.

## Resultado esperado del demo

El prototipo podrá mostrar al CIE:
- Multi-sede con consolidación.
- Un expediente con los 3 modelos clínicos del TDR funcionando visualmente.
- Gráfico de fase + masterización + crisis Hanley.
- Gobernanza (RBAC + checklist bloqueante) que diferencia del software importado.
