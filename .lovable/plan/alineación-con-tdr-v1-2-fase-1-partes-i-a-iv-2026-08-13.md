# Alineación con TDR v1.2 — Fase 1 (Partes I a IV)

Del PDF se pudieron leer las páginas 1–50, que cubren completas las Partes I (Gobernanza,
roles y seguridad), II (Arquitectura e integración ERP), III (Matrícula y cupos) y IV
(Gestión operativa, pagadores y depuración). La Parte V (Biblioteca clínica ABA) y las
Partes VI–XII empiezan en la página 57, así que quedan para la Fase 2 cuando subas la
segunda mitad del documento.

Todo se implementa sobre los datos de demostración actuales (sin base de datos), como
acordamos.

## Lo que hoy ya cumple el TDR

- Facturación por corte quincenal (Periodo 1 / Periodo 2) con comparativo, brecha y alertas.
- Depuración pre-facturación con marcado facturable/no facturable y motivo de exclusión.
- Servicios eventuales con control de adjuntos obligatorios.
- Colillas INSS, cartas de aprobación y cartas de cobro exportables a PDF.
- Multi-sede con selector global y matriz de permisos básica en Equipo.

## Fase 1 — Cambios propuestos

### 1. Gobernanza y roles (Parte I)

- **Jerarquía de roles completa del TDR**: reemplazar la lista actual por Administrador de
  Organización, Director Clínico, Subdirector Clínico, Supervisor (Analista ABA),
  Coordinador Clínico, Terapeuta y Personal Administrativo, más roles personalizados.
- **Matriz de acciones clínicas sensibles** (TDR 1.4.3) como pestaña propia en
  Equipo y permisos: biblioteca global, forzar estado de objetivo, revertir masterización,
  fase de reversión, leer nota cualitativa, toma de datos en sesión, editar intervalos,
  insertar eventos de fase.
- **Segregación de datos clínicos** (TDR 1.4.1): un selector "ver como rol" que aplica
  reglas reales en la interfaz:
  - Personal Administrativo no ve nota de progreso, nota cualitativa ni registro ABC.
  - Terapeuta no ve facturación ni horas autorizadas.
  - Regla transversal: **en perfiles de paciente y reportes operativos se muestran horas,
    no montos**; los montos quedan solo en el módulo de Facturación.
- **Bitácora de auditoría** (TDR 1.7): nueva vista con eventos inmutables (usuario, rol,
  acción, entidad, fecha, motivo), filtros y exportación. Las acciones sensibles que ya
  existen (excluir sesión, editar brecha, borrar excedente, enviar al INSS) pasan a
  registrar un asiento en esta bitácora.
- **Panel de plataforma (Super Admin / Billing Admin)**: vista separada con el listado de
  organizaciones (CIE como tenant 1 más tenants demo), estado Activa / Bloqueada
  parcialmente / Bloqueada totalmente / Suspendida, pacientes activos, en admisión,
  egresados, estado de cuenta y administrador principal; cambio de estado con motivo e
  historial, y **reporte facturable mensual por organización** en PDF (resumen ejecutivo,
  prorrateos por activación parcial, historial de estados, usuarios por rol, consumo).
- **Seguridad**: en la vista de seguridad, marcar 2FA como obligatorio para roles de
  plataforma y Administrador de Organización, y política de contraseñas del TDR.

### 2. Matrícula, cupos y ciclo de vida (Parte III)

- **Estados del paciente del TDR**: Prospecto, En proceso de admisión, Activo, Suspendido,
  Egresado, Archivado, con diagrama de transiciones y reglas de qué transición permite cada rol.
- **Pipeline de admisión tipo CRM**: etapas configurables en tablero, responsable asignado,
  checklist de documentos obligatorios por etapa y bloqueo de activación hasta que estén
  completos; lista de espera de prospectos.
- **Expediente del prospecto** con los campos de admisión del TDR (datos del paciente,
  padres/tutor, tipo de pagador institucional / seguro privado / particular, referencias).
- **Control de cupos por sede y disciplina**: cupo aprovisionado vs ocupado por disciplina,
  semáforo de capacidad, bloqueo operativo al llegar al límite y proyección de liberación
  de cupos según egresos programados.
- **Flujo de egreso**: motivos catalogados, autorización por rol, liberación de cupo al
  iniciar el egreso, cierre de programas clínicos y condiciones para pasar a Baja.
- **Código ERP** como identificador oficial junto al identificador interno de prospecto,
  visible en expediente y en las exportaciones.

### 3. Pagadores, autorizaciones y facturación (Parte IV)

- **Módulo de Pagadores**: registro con atributos del TDR y validación de **un solo pagador
  activo por paciente** en cada fecha, con historial de cambios de pagador.
- **Autorizaciones**: cartas de aprobación con vigencia y horas autorizadas por disciplina,
  monitoreo de consumo con los límites **25h / 45h** y alerta al acercarse o excederse
  (se apoya en el motor de comparativo que ya existe).
- **Unidades facturables adicionales** (TDR 1.1.2): además de horas de terapia, programas,
  diagnósticos y visitas escolares, cada una con **tarifa configurable por organización**
  en una pantalla de tarifas.
- **Prorrateo por activación parcial**: cálculo proporcional cuando el paciente se activa a
  mitad de mes, reflejado en el corte y en el reporte facturable.
- **Reporte consolidado de sesiones ejecutadas** con filtros y dos niveles de
  visualización (general y detallado) y agrupación jerárquica por Coordinador → Supervisor →
  Terapeuta.
- **Gestión de horas no facturadas** y **exportación a CRM/ERP** con selección de columnas,
  filtros y descarga CSV/Excel/PDF.

## Notas técnicas

- Nuevas rutas: `/plataforma` (panel global + reporte facturable), `/auditoria`,
  `/pagadores`, `/configuracion/tarifas`; ampliación de `/matricula` con
  `matricula.pipeline`, `matricula.egresos` y de `/equipo` con pestañas de matriz sensible
  y roles personalizados.
- Nuevos módulos de datos demo: `src/lib/tenants-data.ts`, `src/lib/auditoria.ts`,
  `src/lib/roles-tdr.ts`, `src/lib/admision-pipeline.ts`, `src/lib/cupos.ts`,
  `src/lib/tarifas.ts`; se extienden `src/lib/rbac.ts`, `src/lib/facturacion-modelo.ts`,
  `src/lib/modulos-data.ts` y `src/lib/perfil-nino-data.ts`.
- Los permisos y el rol activo se resuelven con un contexto de sesión demo (igual patrón que
  `SedeProvider`), para que "ver como rol" oculte datos de verdad en la interfaz.
- PDFs con el mismo enfoque jsPDF que ya usan las cartas de cobro.
- Las herramientas MCP existentes se ajustan para no exponer montos cuando el TDR lo
  prohíbe.

## Orden de entrega sugerido

1. Roles del TDR + segregación de datos + matriz sensible + bitácora de auditoría.
2. Matrícula: estados, pipeline de admisión, cupos por disciplina, egresos, código ERP.
3. Pagadores, autorizaciones 25h/45h, tarifas y unidades facturables, prorrateo.
4. Reportes consolidados y exportaciones ERP/CRM.
5. Panel de plataforma multitenant y reporte facturable por organización.

**Fase 2 (pendiente de documento):** Parte V y siguientes — biblioteca de programas ABA,
motor de masterización, fases de conducta, fidelidad, supervisión clínica, informes
clínicos automáticos y portal de familias. Sube las páginas 51–102 y planifico esa fase.
