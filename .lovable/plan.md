
# Implementación de las 5 prioridades — CIETrack

Alcance: implementar todas las funciones como **frontend con datos demo en memoria** (sin backend real). Se mantienen los colores y la paleta actuales. Cada prioridad es un bloque entregable.

> Nota técnica: el proyecto usa **TanStack Start + Vite + Tailwind** (no Next.js 14 como dice el brief). Las rutas se crean como archivos en `src/routes/_app.<ruta>.tsx`. La paleta y tipografía actuales se respetan.

---

## Prioridad 1 — Asistencia → Facturación

**Datos / lógica (`src/lib/facturacion-motor.ts`)**
- Tipos `SesionRegistrada`, `ResumenFacturacionNino`, `CartaINSS`.
- `calcularFacturacionQuincena(ninoId, quincena, mes, anio, tarifas, carta)` con las reglas: IT/PFA 45h, TA/TS 25h, Fisio/Logo 15h, carta vencida → 0, suspensión → 0, baja → excluido.
- `getResumenSede(...)` que itera todos los niños y retorna estado verde/ámbar/rojo.

**Pantallas**
- `src/routes/_app.facturacion.cierre.tsx` — Panel de cierre de quincena (tabla con filas verde/ámbar/rojo, botón "Calcular quincena", botón "Confirmar y generar documentos").
- Modal de conciliación por niño dentro de la misma ruta (timeline de sesiones + carga de constancia inline + recálculo).
- Actualizar `_app.asistencia.tsx`: mini-barra "X / Y horas aprobadas" por sesión con color verde / ámbar / rojo y toast al pasar 100%.

---

## Prioridad 2 — Perfil del niño en Gestión Clínica

Reescribir `src/routes/_app.ninos.$id.tsx` con:
- Header rico (avatar, diagnóstico, estado, progreso global).
- 8 tabs: Resumen · Programas · Sesiones · Evaluaciones · Conducta · Familia · Expediente · Facturación.
- Datos demo extendidos en `src/lib/perfil-nino-data.ts` (programas, evaluaciones VB-MAPP, planes de conducta, documentos, historial de facturación).
- `calcularProgreso(ninoId)` usado también en la lista de Gestión Clínica.
- Botón "Ver gráfica" enlaza a Gráficas ABA con el programa preseleccionado.

---

## Prioridad 3 — Kiosko QR

- `src/routes/kiosko.tsx` (fuera del shell `_app`, pantalla completa fondo oscuro, animación de escáner, simulación de escaneo con input/cámara mock).
- `src/routes/_app.asistencia.carnets.tsx` — lista de niños + generación de PDF de carnet con QR (usando `qrcode` + `jspdf`), botón "Generar todos" → ZIP (`jszip`).
- En `_app.asistencia.tsx`: sección "Pendientes del día" con botón "Marcar manualmente" (modal Asistió / Ausente / Justificado + constancia).
- Helpers `generarQRNino` / `procesarScanQR` en `src/lib/qr-asistencia.ts`.

---

## Prioridad 4 — Familias

- `src/routes/_app.familias.tsx` rediseñado: lista con estado de portal, firmas pendientes, botón "Invitar".
- `src/routes/mi-hijo.tsx` (fuera del shell): portal cálido crema, secciones Resumen semana / Firmas pendientes (canvas de firma con `react-signature-canvas` o `<canvas>` propio) / Historial / Comunicación.
- `src/lib/firmas-digitales.ts` con tipo `FirmaDigital` y store en memoria; al firmar se actualiza estado en Asistencia.

---

## Prioridad 5 — Reportes

- `src/routes/_app.reportes.tsx` — grid con los 6 reportes y filtros (mes, quincena, sede, área).
- Generación real:
  - Excel: `exceljs` (Reporte 1, 2, 5) con cabeceras verdes y filas alternas.
  - PDF: `jspdf` + `jspdf-autotable` (Reportes 2, 3, 4 con mini-gráficas).
  - ZIP: `jszip` (Reporte 6 — Paquete INSS) con checklist de verificación previa.
- Nombres de archivo: `CIE_Facturacion_<Sede>_Q<n>_<Mes><Año>.xlsx`.

---

## Dependencias nuevas

`bun add exceljs jspdf jspdf-autotable jszip qrcode` (y tipos correspondientes).

## Integración cruzada

- Asistencia registra → motor recalcula → Facturación.cierre lo refleja → Familia firma → Reporte 6 lo empaqueta.
- Todo opera sobre un store demo compartido (`src/lib/store-demo.ts`) en memoria para que los flujos se vean conectados.

## Lo que NO incluye

- Backend real, base de datos, autenticación, envío de emails/WhatsApp.
- Cambios de paleta o tipografía.
- OCR de constancias médicas (sólo subida simulada).

¿Procedo con esta implementación completa, o quieres que arranque sólo por la Prioridad 1 y vayamos validando una a una?
