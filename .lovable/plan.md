# Ajustes solicitados — reorganización por flujo operativo

Implementaré los 4 bloques en el orden en que se usan en el día a día: **Matrícula → Planificación → ABA → Ejecución/Puntualidad**.

---

## 1) Dashboard reordenado por flujo

Reescribir `src/routes/_app.dashboard.tsx` para que las secciones sigan el flujo real:

1. **Matrícula** (primero) — KPIs: activos, ingresos del mes, egresos, suspendidos, **horas planificadas vs. horas acreditadas por INSS**, % cobertura documental. Lista de niños con documentos faltantes del checklist del *Manual de Prestación de Servicios* (1ª evaluación, entrevista a padres, consentimiento, colilla INSS, diagnóstico, contrato).
2. **Planificación** — Horas programables vs. programadas (gap), causas de no programación, resumen por supervisor.
3. **ABA / Clínico** — Accesos rápidos a sesiones ABA, biblioteca, gráficas, alertas de estancamiento.
4. **Ejecución y puntualidad** — A tiempo / tarde / ausentes por sede, desviación promedio (min).
5. **Facturación INSS** — Lotes y cartas (se mantiene, al final).

Todo clickeable (ya está el patrón con `<Link>`).

## 2) Módulo Planificación (nuevo)

Nueva ruta `src/routes/_app.planificacion.tsx` + entrada en sidebar.

Vista de **lo general a lo particular** con tabs:
- **Vista general**: barras horizontales con horas programables vs. programadas por sede.
- **Por supervisor**: tabla — supervisor, niños asignados, h. programables, h. programadas, % cumplimiento.
- **Por niño**: tabla — niño, supervisor, área, h. INSS aprobadas, h. programadas, **motivo si hay gap** (sin disponibilidad de terapeuta, sala ocupada, falta de transporte, pendiente de checklist, etc.).
- **Asistencia & supervisión**: mini resumen con link a `/asistencia` y al módulo clínico.

Datos demo en `src/lib/planificacion-data.ts` (motivos de no programación, h. programables por sede, agregados por supervisor).

## 3) Módulo ABA (separar de biblioteca/clínico actual)

Crear sección **ABA** en el sidebar con sub-items:
- **Sesiones ABA** (renombrar la vista actual de sesiones, ya existe en clínico)
- **Biblioteca ABA** (mover `_app.biblioteca.tsx`)
- **Gráficas** (`_app.clinico.graficas.tsx`)

Cambios:
- Agrupar estos 3 ítems en el `app-sidebar` bajo el encabezado "ABA".
- Sacarlos de cualquier referencia que los mezcle con Matrícula/Planificación.
- Mantener las rutas actuales para no romper enlaces; sólo reordenar visualmente.

## 4) Ejecución — control de puntualidad

Ampliar `src/routes/_app.asistencia.tsx`:
- Cada check-in registra `horaProgramada` y `horaIngreso` → calcula `desviacionMin`.
- Estados: **A tiempo** (≤0 min), **Tarde leve** (1-14 min), **Tarde** (≥15 min), **Ausente**.

Nueva pestaña / panel **"Reporte de puntualidad por sede"**:
- Tabla por sede: total atendidos, a tiempo, tarde, ausentes, desviación promedio.
- Ejemplo: "Managua — 80 niños: 62 a tiempo, 14 tarde (prom. 18 min), 4 ausentes".
- Botón "Exportar" (visual, demo).

Datos demo extendidos en `src/lib/demo-data.ts` (añadir `horaIngresoReal` a sesiones con check-in).

## 5) Matrícula — checklist & horas INSS

Ampliar `src/routes/_app.matricula.tsx` con un panel arriba:
- **Horas planificadas vs. acreditadas INSS** (barra comparativa por sede).
- **Checklist del Manual** por niño (badge "Completo" / "Falta X documentos") usando y extendiendo `src/lib/checklist-inss.ts` con: 1ª evaluación, entrevista a padres, plan terapéutico inicial.

---

## Detalle técnico

**Archivos nuevos**
- `src/routes/_app.planificacion.tsx`
- `src/lib/planificacion-data.ts`
- `src/lib/puntualidad-data.ts`

**Archivos modificados**
- `src/routes/_app.dashboard.tsx` — reordenar secciones según flujo.
- `src/routes/_app.asistencia.tsx` — añadir reporte de puntualidad por sede.
- `src/routes/_app.matricula.tsx` — añadir panel horas INSS + checklist Manual.
- `src/components/app-sidebar.tsx` — agrupar ABA, añadir Planificación, reordenar.
- `src/lib/checklist-inss.ts` — añadir ítems del Manual (1ª evaluación, entrevista padres).
- `src/lib/demo-data.ts` — campos `horaIngresoReal`, `desviacionMin` en sesiones.

**Orden final del sidebar**
1. Dashboard
2. Matrícula
3. Planificación *(nuevo)*
4. Niños / Expedientes
5. ABA *(grupo: Sesiones, Biblioteca, Gráficas)*
6. Ejecución
7. Asistencia
8. Horario
9. Facturación (Lotes, Cartas, Cierre)
10. Familias · Equipo · Sedes · Reportes

Todo es UI/demo con datos mock — no toca backend ni autenticación.
