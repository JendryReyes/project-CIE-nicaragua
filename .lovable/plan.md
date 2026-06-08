## Objetivo

Convertir el módulo de Matrícula en una vista que permita **ver detalle real** de cada niño matriculado, no solo conteos. Hoy las tarjetas de "Movimientos recientes" tienen nombre y motivo; las pestañas **Ingresos / Egresos / Suspensiones** están vacías. Vamos a llenarlas y agregar un panel de detalle.

## Cambios

### 1. Enriquecer el dataset (`src/lib/modulos-data.ts`)
Ampliar `MovimientoNino` con datos específicos que faltan:

- `edad`, `fechaNacimiento`, `sede`
- `tutor` (nombre + parentesco), `telefono`, `correo`, `direccion`
- `cobertura` ("INSS" | "Privado"), `areas` (conducta, logopedia, fisio, ocupacional)
- `terapeutaAsignado`
- `documentosOk` / `documentosFaltantes[]` (vinculado al checklist INSS)
- En suspensiones: `motivoSuspension`, `fechaReinicio`, `responsable`
- En egresos: `destino`, `informeEgreso`

Aumentar la lista a ~10–12 registros para que las tres pestañas tengan contenido real.

### 2. Pestañas con tablas detalladas (`src/routes/_app.matricula.tsx`)

Cada pestaña ya no muestra el mismo resumen:

- **Resumen general** → queda como está (KPIs + gráfico + "Movimientos recientes" actualizado).
- **Ingresos** → tabla con: Niño · Edad · Sede · Tutor · Teléfono · Áreas · Fecha ingreso · Cobertura · Estado documentos.
- **Egresos** → tabla con: Niño · Sede · Fecha egreso · Motivo · Destino · Informe.
- **Suspensiones** → tarjetas en alerta con: Niño · Sede · Motivo · Fecha suspensión · Fecha estimada de reinicio · Responsable del seguimiento. Botón "Reactivar" y "Ver expediente".

Todas las tablas con buscador, filtro por sede y orden por fecha. Botón "Exportar CSV" (mock).

### 3. Panel lateral de detalle (drawer)
Al hacer clic en cualquier fila o tarjeta se abre un **drawer derecho** con la ficha completa del niño matriculado:

- Cabecera: avatar, nombre, expediente, edad, sede, pill de tipo (ingreso/egreso/suspensión).
- Sección **Datos personales**: fecha de nacimiento, dirección.
- Sección **Familia**: tutor, parentesco, teléfono, correo, botón "Mensaje".
- Sección **Plan terapéutico**: áreas asignadas (badges), terapeuta principal, cobertura INSS / privado.
- Sección **Documentación**: lista de documentos cumplidos / pendientes (mini checklist INSS).
- Sección **Historial del movimiento**: fecha, motivo, responsable.
- Footer del drawer: enlaces "Abrir expediente completo" (a `/ninos/$id`) y "Editar matrícula".

### 4. KPI "Activos" clicable
Hacer que la tarjeta **Activos (27)** abra una vista/tabla con los 27 niños actualmente matriculados (no solo los movimientos del mes). Reutilizar el mismo drawer de detalle.

## Detalles técnicos

- Todo se mantiene con datos mock locales (mismo patrón actual).
- Drawer reutiliza estilo de `Dialog` lateral con `fixed inset-y-0 right-0 w-[480px]`. Sin librería nueva.
- El enlace "Abrir expediente completo" usa `Link to="/ninos/$id"` si el expediente existe; si es mock sin contraparte, queda como botón informativo.
- No se toca la lógica de Asistencia / QR / Diagnóstico.

## Lo que NO se toca
- Diseño de los KPIs ni gráfico de barras.
- Lista de niños en `/ninos` (este módulo se enfoca en altas/bajas/suspensiones, no reemplaza la gestión clínica).
- Backend: sigue siendo mock; cuando se conecte Lovable Cloud se mapea a tablas reales.
