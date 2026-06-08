## Objetivo

Mover el diagnóstico clínico al lugar donde realmente pertenece: **dentro del expediente de cada niño**, como una pestaña más. Y limpiar el sidebar quitando el ítem "Diagnóstico" de Administración (hoy duplica Gráficas ABA).

## Cambios

### 1. Nueva pestaña "Diagnóstico" en el expediente del niño
Archivo: `src/routes/_app.ninos.$id.tsx`

Se agrega una pestaña entre **Áreas terapéuticas** y **Sesiones**, con el siguiente contenido:

**a) Diagnóstico vigente** (tarjeta principal)
- Diagnóstico principal con código CIE-10 (ej. `F84.0 — Trastorno del espectro autista`)
- Nivel de severidad (TEA nivel 1/2/3 cuando aplique)
- Fecha del diagnóstico
- Profesional emisor (nombre, especialidad, número de colegiatura)
- Centro / institución emisora
- Estado: `Confirmado` / `Pre-diagnóstico` / `En evaluación`

**b) Diagnósticos secundarios / comorbilidades**
- Lista de diagnósticos adicionales con su CIE-10 (TDAH, ansiedad, retraso del lenguaje, etc.)
- Botón para agregar uno nuevo

**c) Proceso de evaluación**
- Tarjeta con estado actual del proceso: evaluaciones programadas, completadas, pendientes
- Lista de instrumentos aplicados (ADOS-2, ADI-R, CARS, M-CHAT-R, etc.) con fecha y resultado breve
- Botón "Registrar evaluación"

**d) Informes diagnósticos adjuntos**
- Lista de PDFs con fecha, autor y un botón de descarga/vista previa
- Botón "Subir informe diagnóstico" (PDF, JPG, PNG)
- Cuando se sube un informe nuevo, se marca el ítem **"Diagnóstico médico o pre-diagnóstico"** del checklist INSS como cumplido (esto desbloquea el banner naranja que aparece arriba del expediente)

**e) Historial de actualizaciones**
- Timeline mostrando: cambios de diagnóstico, reevaluaciones, actualizaciones de severidad, autor y fecha de cada cambio
- Útil para auditoría y para el seguimiento clínico longitudinal

### 2. Limpieza del sidebar
Archivo: `src/components/app-sidebar.tsx` (o donde esté definida la navegación)

- Eliminar el ítem **"Diagnóstico"** que hoy está en la sección **Administración** y apunta a `/clinico/graficas`
- **Gráficas ABA** queda como única entrada analítica del sidebar (sin cambios)
- El acceso al diagnóstico de cada niño ahora es contextual: se entra desde el expediente

### 3. Integración con el checklist INSS
- El banner naranja "Expediente bloqueado por checklist INSS" enlaza al ítem "Diagnóstico médico o pre-diagnóstico"
- Al hacer clic en ese ítem desde el banner, lleva directamente a la nueva pestaña Diagnóstico
- Al subir un informe diagnóstico válido, el ítem se marca como cumplido automáticamente y, si los demás requisitos están OK, se levanta el bloqueo

## Detalles técnicos

- Tipos nuevos en el mock de datos del niño:
  ```ts
  type Diagnostico = {
    cie10: string;
    nombre: string;
    severidad?: string;
    fecha: string;
    profesional: { nombre: string; especialidad: string; colegiatura: string };
    centro: string;
    estado: "confirmado" | "pre-diagnostico" | "en-evaluacion";
    esPrincipal: boolean;
  };
  type Evaluacion = { instrumento: string; fecha: string; resultado: string; profesional: string };
  type InformeDiagnostico = { id: string; nombre: string; fecha: string; autor: string; url: string };
  type CambioDiagnostico = { fecha: string; tipo: string; descripcion: string; autor: string };
  ```
- Todo se mantiene en estado local con datos mock (mismo patrón que el resto del expediente)
- Componentes shadcn: `Tabs`, `Card`, `Badge`, `Button`, `Dialog` (para subir informe / agregar diagnóstico), `Table` para evaluaciones
- Sin cambios de backend ni de rutas — la pestaña vive dentro de la ruta existente `/ninos/$id`

## Lo que NO se toca
- Gráficas ABA en sidebar y su ruta `/clinico/graficas`
- Resto de pestañas del expediente
- Lógica de QR, asistencia, constancias médicas
