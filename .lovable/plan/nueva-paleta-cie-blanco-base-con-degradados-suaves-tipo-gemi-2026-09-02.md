# Nueva paleta CIE — blanco base con degradados suaves tipo Gemini

Reemplazar la paleta actual (base crema, primario terracota, acento sage) por
un sistema de blanco limpio con azul índigo como marca y amarillo, rojo y verde
desaturados como acentos, aplicando principios de neuromarketing: baja
saturación, alto contraste solo donde importa, y color con significado fijo.

## Decisiones ya tomadas

- **Paleta Gemini Soft**: blanco `#ffffff`, azul `#4f7cf7`, amarillo `#f2b53d`,
  rojo coral `#e8705f`, más un verde de la misma familia para estados.
- **Degradado en acentos de marca y tarjetas de KPI**: logo, encabezados de
  sección, botón principal y los indicadores del dashboard. El resto de la
  interfaz queda plano y blanco.
- **Rojo, verde y amarillo reservados para estados**: verde = cumplido o
  aprobado, amarillo = pendiente, rojo = alerta o vencido. Nunca decorativos
  donde puedan confundirse con un dato.

## Lo que hay hoy

`src/styles.css` ya tiene un sistema de tokens completo y bien armado: superficies,
primario, acento, estados, paleta por área terapéutica y tokens de barra lateral.
Ese archivo es el punto de cambio y se propaga solo.

El obstáculo real: hay **687 valores `oklch(...)` escritos a mano** dentro de
componentes y rutas, más 66 usos de `bg-white` / `text-white`. Los más cargados
son `comparativo-quincenas.tsx` (51), `_app.matricula.tsx` (29),
`cierre-quincena.tsx` (26) y `_app.asistencia.tsx` (21). Si solo se cambian los
tokens, esas 687 ocurrencias siguen mostrando terracota y crema, y la interfaz
queda mezclada. Migrarlas es la mayor parte del trabajo.

## Parte 1 · Redefinir los tokens

En `src/styles.css`, sobre el bloque `:root` existente, en formato `oklch`:

| Token | Rol | Valor aproximado |
| --- | --- | --- |
| `--background` | lienzo | blanco casi puro, matiz azul mínimo |
| `--card` | superficies | blanco puro |
| `--foreground` | texto | gris azulado muy oscuro, no negro puro |
| `--primary` | marca | azul índigo `#4f7cf7` |
| `--primary-glow` | par del degradado | azul más claro y luminoso |
| `--accent` | acento secundario | amarillo `#f2b53d` desaturado |
| `--success` | estado cumplido | verde de la misma familia |
| `--warning` | estado pendiente | el amarillo de marca |
| `--destructive` | estado alerta | rojo coral `#e8705f` |
| `--border` / `--input` | separadores | gris azulado claro, muy tenue |
| `--muted` / `--muted-foreground` | fondos y texto secundario | grises fríos |

Tokens nuevos de degradado, para no repetir valores en componentes:

- `--gradient-marca`: azul → amarillo → coral, el gesto tipo Gemini.
- `--gradient-kpi`: variante muy tenue del anterior para fondos de tarjeta.
- `--gradient-suave`: azul → azul claro, para botones y encabezados.
- `--shadow-suave`: sombra difusa teñida de azul en lugar de gris neutro.

La paleta por área terapéutica (diagnóstico, fisio, logopedia, conducta) se
recalibra a la nueva familia fría manteniendo las cuatro identidades separables.

Se conserva la tipografía actual (Fraunces para títulos, Inter para cuerpo) y
los radios, que ya funcionan bien con este lenguaje.

## Parte 2 · Migrar los colores escritos a mano

El paso que hace que el rediseño se vea completo. Sustituir los `oklch(...)`
inline por clases de token (`text-success`, `bg-warning/10`, `border-primary/30`)
y los `bg-white` por `bg-card`. Se hace por bloques, verificando cada pantalla:

1. Facturación: `comparativo-quincenas`, `cierre-quincena`, `billing-summary`,
   `facturacion.index`, `facturacion.$loteId`, `depuracion`.
2. Operación: `asistencia`, `matricula`, `ejecucion`, `planificacion`.
3. Clínico: `ninos.$id`, `clinico.graficas`, `fase-chart`,
   `grafica-programa-modal`, `ioa-badge`, `masterizacion-badge`.
4. Resto: `dashboard`, `reportes`, `pagadores`, `sedes`, `admision`,
   `seguridad-mfa`.

## Parte 3 · Aplicar el degradado donde se decidió

- **Logo y marca** en la barra lateral: el bloque del logo con
  `--gradient-marca`.
- **Encabezados de sección**: una línea o subrayado corto con el degradado, sin
  bloques grandes de color.
- **Botón principal** (por ejemplo "Tomar asistencia"): `--gradient-suave`.
- **Tarjetas de KPI del dashboard**: fondo `--gradient-kpi` muy tenue y borde
  superior con acento; las tarjetas con tono de estado (`success`, `warning`)
  mantienen su color semántico por encima del degradado.
- Barra lateral, tablas y gráficas quedan planas: es donde se lee y se decide.

## Parte 4 · Criterios de neuromarketing aplicados

- Saturación baja en superficies grandes y saturación alta solo en el elemento
  que se quiere que el ojo encuentre primero (una acción por pantalla).
- Azul como base de marca por su asociación con confianza y calma, adecuado para
  un contexto clínico y para jornadas largas frente a la pantalla.
- Amarillo y coral en dosis pequeñas: llaman atención sin generar alarma.
- Contraste de texto verificado sobre blanco y sobre las tarjetas con degradado,
  para que ningún dato quede en gris bajo contraste.
- Menos ruido cromático en tablas de facturación, donde el color debe significar
  algo y no decorar.

## Verificación

Recorrer con capturas las pantallas más cargadas de color —dashboard,
facturación comparativa, asistencia, matrícula y perfil del niño— y confirmar
que no queda ningún resto terracota o crema mezclado con la paleta nueva, y que
verde, amarillo y rojo solo aparecen con significado de estado.

## Fuera de alcance

Cambios de tipografía, de layout o de estructura de pantallas; el rediseño es
únicamente de color, degradados y sombras.
