# Plan de implementación — 5 pendientes CIETrack

Objetivo: cerrar las brechas restantes del checklist sin romper lo ya implementado ni cambiar la paleta. Todo es frontend con datos mock (`src/lib/`).

---

## 1. Alertas de vencimiento de cartas INSS (Problema #6)

**Qué se construye**
- Nuevo módulo de datos `src/lib/cartas-inss.ts`: estructura `CartaINSS { ninoId, numero, area, emitida, vence, estado: 'vigente'|'por_vencer'|'vencida'|'renovada' }` y semilla con ~20 cartas en distintos estados.
- Helpers `diasParaVencer(carta)` y `estadoDesdeFecha(carta)` (umbrales: 30 días = por_vencer, 0 = vencida).
- Widget "Cartas INSS por vencer" en `/dashboard` (top, junto a los KPIs): conteo + lista compacta de las 5 más próximas con badge ámbar/rojo.
- Nueva ruta `/_app.facturacion.cartas.tsx`: tabla filtrable por sede/área/estado, semáforo por fila, botón "Marcar como renovada" (mock), botón "Descargar carta vigente" (PDF jsPDF).
- Entrada en sidebar bajo "Administración → Cartas INSS".
- En el perfil del niño (`/ninos/$id`, tab Facturación) mostrar el bloque "Carta INSS vigente" con fecha y semáforo.

**Criterio de éxito:** desde el dashboard se ve cuántas cartas vencen en 30 días y un clic lleva al detalle por niño.

---

## 2. Suspensiones que descuentan horas en facturación (Problema #7)

**Qué se construye**
- Extender `src/lib/modulos-data.ts` (o `perfil-nino-data.ts`) con `suspensiones: { ninoId, desde, hasta?, motivo }[]`.
- En `src/lib/facturacion-motor.ts`:
  - Función `horasDescontadasPorSuspension(ninoId, periodo)` que calcula horas programadas dentro del rango de suspensión.
  - Modificar `calcularResumenSede` para restar esas horas de `horasFacturables` y exponer un campo nuevo `horasSuspension` por área.
- En `/facturacion/cierre`: nueva columna "Suspensión" y nota al pie por niño afectado ("12h descontadas — suspendido 14–28 may").
- En el reporte R1 del Excel agregar la columna "Horas suspensión" para auditoría.

**Criterio de éxito:** un niño suspendido en mayo aparece con horas reducidas en el cierre y el Excel del INSS lo refleja.

---

## 3. Carta de cobro personalizada (lo que pide el equipo)

**Qué se construye**
- Nuevo helper `src/lib/carta-cobro.ts` con función `generarCartaCobroPDF(periodo, sedeId, resumen)` usando jsPDF:
  - Encabezado: nombre del CIE, dirección, RUC, teléfono (mock realista nicaragüense).
  - Destinatario: INSS — Dirección de Atención al Asegurado.
  - Cuerpo dinámico: "Por medio de la presente, el Centro CIE solicita el cobro de NNN horas terapéuticas brindadas en el período XXX, distribuidas en…" con tabla por área.
  - Total a cobrar en córdobas + dólares.
  - Firma: Dra. directora + sello (placeholder).
  - Pie: número de carta (`CIE-2026-Q2-005`), fecha y QR de verificación interno (usa `qrcode`).
- Reemplazar el PDF genérico actual en el ZIP del reporte R6 por esta carta.
- Botón nuevo "Generar carta de cobro" en `/facturacion/cierre` (independiente del ZIP completo).
- Plantilla previsualizable desde el modal de vista previa del reporte R6.

**Criterio de éxito:** la carta descargada incluye membrete CIE, monto correcto del período y se ve presentable.

---

## 4. Vista consolidada multi-sede (Problema #4)

**Qué se construye**
- Nueva ruta `/_app.sedes.tsx` titulada "Panel de sedes" en el sidebar (sección Administración).
- Cards lado a lado por las 5 sedes con KPIs:
  - Niños activos · Sesiones hoy · Asistencia % · Horas facturables del período · Cartas por vencer · Suspensiones activas.
- Barra superior con tabs: Hoy · Semana · Quincena.
- Tabla comparativa al final ("Mejor / Peor" por métrica) usando los datos de `facturacion-motor.ts` y `cartas-inss.ts`.
- Mini-grafo de tendencia (sparkline SVG simple, sin librería extra) para sesiones por día.

**Criterio de éxito:** dirección ve las 5 sedes en una sola pantalla y detecta sede con menor asistencia.

---

## 5. Workflow "cerrar quincena → bloquear → enviar" (Problema #1, cierre del flujo)

**Qué se construye**
- Extender `facturacion-motor.ts` con estado de quincena: `EstadoQuincena = 'abierta' | 'lista' | 'cerrada' | 'enviada'`.
- En `/facturacion/cierre`:
  - Stepper visual en la cabecera: Revisar → Validar → Cerrar → Enviar al INSS.
  - Botón "Validar período" que ejecuta checklist (todas las firmas, sin excedentes sin justificar, cartas vigentes) y muestra modal con resultado.
  - Botón "Cerrar quincena" (deshabilitado hasta validar): cambia estado a `cerrada` (estado local en `useState` + `localStorage` para persistir entre recargas).
  - Cuando está `cerrada`, los datos de ese período se muestran en modo "solo lectura" con badge "Cerrada el DD/MM por Usuario X".
  - Botón "Marcar como enviada al INSS" registra fecha de envío y muestra confirmación.
- Banner en el dashboard cuando una quincena queda lista pero no enviada.

**Criterio de éxito:** el usuario puede recorrer el flujo completo desde "abierta" hasta "enviada" y los datos cerrados no se pueden re-editar.

---

## Notas técnicas

- Sin cambios de backend ni nuevas dependencias (ya están `jspdf`, `qrcode`, `jszip`, `exceljs`).
- Persistencia con `localStorage` solo donde aplica (estado de quincena, cartas renovadas) — el resto sigue siendo mock en memoria.
- Respeta paleta y tipografía actuales: `bg-card`, `border-border/70`, `font-display`, badges con `bg-primary/15`.
- Cada prioridad se entrega como commit lógico independiente para poder validar paso a paso.

## Orden de entrega sugerido

1 → 2 → 3 → 5 → 4 (dejar el panel multi-sede al final porque consume datos generados por las primeras 3).

¿Avanzo así o querés reordenar / recortar algo?