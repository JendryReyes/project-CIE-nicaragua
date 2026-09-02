# Plan: eliminar el rojo puro y usar coral suave

## Objetivo
Sustituir todo el rojo puro de la interfaz por un **coral suave** (`oklch` con matiz cálido pero baja saturación) y reservar ese color para estados de alerta/vencido, sin que se sienta agresivo a la vista. Se conserva la base blanca/azul índigo y los acentos ámbar/verde de la paleta Gemini Soft.

## Qué se va a cambiar

### 1. Tokens de color en `src/styles.css`
- Reemplazar `--destructive` (rojo actual) por un coral suave con buen contraste sobre blanco.
- Ajustar `--destructive-foreground` para mantener texto legible.
- Revisar el degradado `--gradient-marca` para que termine en coral/ámbar en lugar de rojo puro.
- Añadir/actualizar un token semántico `--status-expired` o similar si no existe, para que los componentes usen el color de alerta sin hardcodear.
- Actualizar la memoria de proyecto para que diga que el estado de alerta/vencido ahora es coral suave, no rojo puro.

### 2. Auditoría y reemplazo de colores inline
- Buscar todos los usos de `oklch(...)` con matiz de rojo (típicamente `hue` cerca de 30 o 0) y de clases Tailwind tipo `bg-red-*`, `text-red-*`, `border-red-*`, `rose-*`, etc.
- Priorizar los archivos más cargados de color: facturación (`comparativo-quincenas`, `cierre-quincena`, etc.), matrícula, asistencia, dashboard y perfil del niño.
- Sustituir colores inline por tokens semánticos (`bg-destructive`, `text-destructive`, `bg-warning`, `text-warning`, etc.) o por el nuevo token de alerta.
- En gráficas, cambiar la serie de “egresos/vencidos” del rojo puro al coral suave.

### 3. Componentes de estado y alertas
- Revisar `Badge`, `Alert`, `AlertDialog`, `Toast`/`Sonner` y cualquier pill de estado para que usen el nuevo color coral.
- Asegurar que verde siga siendo “cumplido/aprobado”, ámbar “pendiente” y coral “alerta/vencido”.

### 4. Verificación visual
- Revisar Dashboard, facturación, matrícula, asistencia y perfil del niño en preview.
- Confirmar que no queda ningún `#ff`, `red`, `rose` o `oklch(... 30)` con matiz rojo puro.
- Ejecutar `tsgo` o `bun run build` para asegurar que los cambios de clase no rompen la compilación.

## Qué NO se cambia
- No se toca la estructura de rutas ni componentes.
- No se agregan funciones nuevas ni backend.
- No se alteran los degradados principales más allá de suavizar el último color a coral/ámbar.

## Criterio de aceptación
- La interfaz no muestra rojos puros ni saturados; las alertas se leen en coral suave.
- La compilación y el preview continúan funcionando.
- El usuario confirma visualmente que la paleta sigue siendo amigable y sin colores chillones.
