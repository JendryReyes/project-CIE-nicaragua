## Alcance

El módulo de facturación ya tiene una base sólida (motor de cálculo Q1/Q2, comparativo quincenal, cartas INSS, suspensiones, colillas, exportaciones PDF). Este plan **completa lo que falta** del spec sin reescribir lo existente, manteniendo todo como demo/mock en frontend (sin tocar backend ni base de datos por ahora).

## Lo que ya existe (no se rehace)
- Motor `calcularResumenNino` con clasificación Privada/Pro-bono/INSS/Fuera-de-Contrato y aplicación de constancia médica (`src/lib/facturacion-motor.ts`, `facturacion-inss.ts`).
- Cartas INSS vigentes por niño y disciplina (`cartas-inss.ts` + `_app.facturacion.cartas.tsx`).
- Comparativo Q1/Q2 con alertas de excedente sin constancia, exportaciones (carta de cobro, formato facturación, recibo, carátula, PDF).
- Suspensiones horarias (`suspensiones.ts`).

## Lo que se añade

### 1. Modelo de datos (mocks) — `src/lib/facturacion-modelo.ts` (nuevo)
- `Pagador` (INSS / Privado / Pro-bono) — un solo activo por niño, con historial.
- `EstadoMatricula` (activo / baja / suspension) con fecha efectiva.
- `ServicioEventual` (ADOS-2, Eval Fisio, Eval Logo, Visita escolar, Neuropediatría) con: tipo, niño, fecha, monto, informe adjunto, recibo conformidad firmado, carta INSS si aplica, estado de facturación.
- Helpers: `pagadorActivo(ninoId)`, `estadoMatricula(ninoId, fecha)`, `serviciosEventualesDelCorte(corte)`.
- Regla: no se puede marcar facturable a INSS sin carta vigente (ya lo aplica el motor; se añade validación visible).

### 2. Pantalla de depuración pre-facturación — `src/routes/_app.facturacion.depuracion.tsx` (nuevo)
- Filtros: corte (Q1/Q2/rango), sede, niño, disciplina.
- Tabla expandible por niño → sesiones individuales con toggle **facturable / no facturable** (atributo contable, sin tocar el registro clínico — bandera visible "el registro clínico no se modifica").
- Columnas resumen por niño: Privada / Pro-bono / INSS-facturable / Fuera-de-Contrato (horas y monto).
- Banda destacada arriba: casos con excedente sin constancia médica, con CTA "Adjuntar constancia" y "Marcar como Fuera de Contrato (con justificación)".
- Estado local persistido en `sessionStorage` (demo).

### 3. Módulo de Servicios Eventuales — `src/routes/_app.facturacion.eventuales.tsx` (nuevo)
- Lista por corte con: tipo, niño, fecha, monto, estado de adjuntos (informe / recibo / carta INSS).
- Botón "Registrar servicio eventual" → modal con campos y subida simulada de adjuntos (preview, sin storage real).
- Checkbox "Incluir en lote de facturación del corte" → se suma al total del corte.

### 4. Alertas y trazabilidad — extensión de `facturacion-motor.ts`
- Alerta 80% por disciplina (ya hay `porcentajeUsado`; se añade banner en niño y badge en listas).
- Cada clasificación automática (Fuera-de-Contrato, alerta 80%) genera un `JustificacionAuditoria { motivo, constanciaId?, timestamp, usuario }` adjunto al resumen para mostrar en el detalle y en el PDF.

### 5. Reportes adicionales — `src/routes/_app.facturacion.reportes.tsx` (nuevo)
Un solo route con tabs y filtros comunes (corte / disciplina / niño / sede):
- Desglose por niño y disciplina (4 categorías).
- Horas no facturadas en Corte 2 (considerando constancias).
- Servicios brindados por corte (cantidades + montos), incluyendo eventuales.
- Horas no brindadas por inasistencia.
- Niños en suspensión horaria.
- Bajas de matrícula del período.
- Recibo oficial de caja.
Cada tab tiene botón "Exportar PDF" reutilizando los helpers existentes.

### 6. Integración en navegación
- `_app.facturacion.tsx`: añadir tarjetas/links a **Depuración**, **Eventuales**, **Reportes**.
- Validar en el flujo "Enviar al INSS" que el lote pasó por depuración (banderita visual, no bloqueante en demo).

## Lo que NO se hace en este pase
- Persistencia real (sigue todo en mocks; backend/Lovable Cloud queda para una iteración futura).
- Subida real de adjuntos a storage.
- Firma digital real de recibos (se simula como en `firmas-digitales.ts`).

## Archivos a tocar

```text
nuevo  src/lib/facturacion-modelo.ts
nuevo  src/lib/servicios-eventuales.ts
nuevo  src/routes/_app.facturacion.depuracion.tsx
nuevo  src/routes/_app.facturacion.eventuales.tsx
nuevo  src/routes/_app.facturacion.reportes.tsx
nuevo  src/components/facturacion/depuracion-tabla.tsx
nuevo  src/components/facturacion/eventuales-form.tsx
edit   src/lib/facturacion-motor.ts        (justificación auditoría + alerta 80%)
edit   src/routes/_app.facturacion.tsx     (links a nuevas vistas)
```

## Notas técnicas
- TanStack Start file-routes, shadcn/Tailwind, sin nuevas dependencias.
- Toda clasificación contable es una bandera **separada** del registro de sesión; el componente de depuración lo deja explícito en UI.
- Los exportadores PDF reutilizan `docs-comparativo.ts` y `carta-cobro-*.ts`.

¿Apruebas que arranque con este plan, o quieres ajustar el alcance (p. ej. dejar los reportes en una segunda iteración, o conectar ya backend real con Lovable Cloud)?
