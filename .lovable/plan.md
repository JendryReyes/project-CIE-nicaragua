# Harness de ingeniería para CIE + reorganización del frontend

Aplicar al proyecto CIE las prácticas de las dos presentaciones: un harness
completo (instrucciones, herramientas, entorno, estado, retroalimentación),
una reorganización del frontend por dominios, y un roster de agentes
versionado en el repo.

## Diagnóstico actual

- 43 archivos de ruta planos en `src/routes`, con la página completa dentro
  del archivo de ruta (asistencia 777 líneas, ninos/$id 655, matrícula 570).
- 44 módulos sueltos en `src/lib` sin fronteras de dominio: facturación,
  clínica, admisión, agenda y auditoría conviven en la misma carpeta.
- `comparativo-quincenas.tsx` con 1.309 líneas concentra tabla, drawers,
  edición inline, KPIs y exportaciones.
- Cero pruebas y ningún comando único de verificación.
- Sin archivos de instrucciones: no existe AGENTS.md, ARCHITECTURE.md,
  PROGRESS.md ni glosario del dominio.

La prueba ácida de la presentación ("abre una sesión sin contexto y hazle
cinco preguntas") hoy falla en las cinco.

## Parte 1 · Instrucciones (mapa, no enciclopedia)

Archivos cortos, de 50 a 200 líneas, con `AGENTS.md` como tabla de contenidos
y carga bajo demanda:

- `AGENTS.md` — índice: qué es CIE, dónde está cada cosa, comandos, reglas
  duras y enlaces al resto. Nunca crece: enlaza.
- `docs/ARCHITECTURE.md` — stack, mapa de carpetas, flujo de datos demo,
  frontera cliente/servidor, MCP y agente interno.
- `docs/FRONTEND.md` — convenciones: rutas delgadas, features, tokens
  semánticos de color (prohibido `text-white`/`bg-[#...]`), tamaños máximos
  de archivo, cuándo crear un componente.
- `docs/DOMAIN.md` — glosario CIE: periodo 1/2, brecha, colilla INSS,
  masterización, cupo, pagador, IOA. Evita que el agente invente nombres.
- `docs/ROLES.md` — los 7 roles y qué módulo ve cada uno.
- `docs/TESTING.md` — qué se prueba, qué no, cómo correr.

## Parte 2 · Estado (el diario en disco)

- `PROGRESS.md` — un bloque por turno: estado, hecho, pendiente, siguiente
  paso. Se escribe antes de cerrar el turno.
- `docs/DECISIONS.md` — decisiones y su motivo (por qué datos demo en
  memoria, por qué no hay backend aún, por qué se eliminó multi-tenant, por
  qué "Periodo" y no "Quincena").
- `specs/` — carpeta estilo SDD: `specs/` es lo que ya es verdad,
  `changes/` lo que se propone; archivar mueve una propuesta a verdad.

## Parte 3 · Reorganización del frontend por features

Las rutas se quedan en `src/routes` (lo exige el router) pero pasan a ser
cascarones de 20 a 40 líneas: `head()`, guardia de rol y un componente
importado. La lógica se muda a `src/features/<dominio>/`.

```text
src/features/
  facturacion/   components/  data/  hooks/  export/
  clinico/       components/  data/  hooks/
  admision/      components/  data/
  agenda/        components/  data/
  operacion/     asistencia, ejecucion, planificacion
  gobernanza/    roles, auditoria, seguridad
src/components/  solo ui/ (shadcn) y componentes realmente transversales
src/lib/         utilidades genéricas puras (utils, auth, config)
```

Cada feature expone un `index.ts` como única puerta de entrada. Regla dura:
una feature no importa de `internals` de otra; comparte solo por su `index.ts`.

Orden de ejecución, una feature por turno (WIP = 1):

1. `facturacion` (la más pesada y la de más riesgo).
2. `clinico` (niños, sesión, gráficas, biblioteca, diagnóstico).
3. `operacion` (asistencia, ejecución, planificación, agenda, horario).
4. `admision` y `cupos`.
5. `gobernanza` (equipo, auditoría, KPIs).

Partición de los archivos gigantes dentro de su feature:

- `comparativo-quincenas.tsx` → `ComparativoPeriodos` (contenedor),
  `TablaComparativa`, `DetalleFila`, `KpisMensuales`, `AccionesExport`, y la
  lógica de brecha/edición a `hooks/use-comparativo.ts`.
- `_app.asistencia.tsx` → tabla, filtros, panel de puntualidad y QR.
- `_app.ninos.$id.tsx` → un componente por pestaña.

## Parte 4 · Retroalimentación (listo = comando ejecutable)

- Configurar Vitest + Testing Library.
- Script `verify`: typecheck, lint y pruebas en un solo comando. "Terminé"
  significa que `verify` pasa.
- Pruebas de lógica crítica: motor de facturación y prorrateo, cálculo de
  brecha entre periodos, límites de 25h/45h, `puedeModulo` por rol,
  cumplimiento de colillas INSS.
- Smoke tests de UI en facturación: la tabla comparativa renderiza los dos
  periodos y la diferencia; el drawer de detalle abre con datos del niño.

## Parte 5 · Roster completo de agentes

Un archivo versionado por agente, con alcance, herramientas permitidas
(allowlist) y modelo sugerido:

| Agente | Alcance | Permisos |
| --- | --- | --- |
| architecture | carpetas, tipos, contratos entre features | lectura + escritura de esqueletos |
| frontend-ui | componentes, estilos, estados | escritura en `src/features/*/components` |
| testing | Vitest y RTL | escritura solo en archivos de prueba |
| code-review | diagnostica el diff | solo lectura, no parcha |
| security-reviewer | datos sensibles y visibilidad por rol | solo lectura |
| devops | scripts, verify, configuración | escritura en raíz de config |
| documentador | AGENTS.md, docs/, PROGRESS.md | escritura solo en documentos |
| comunicador | resúmenes para dirección del CIE | solo lectura |

Reglas escritas: `code-review` corre al final y nunca edita; ningún cambio se
declara listo sin que `testing` reporte verde; el skill de solución mínima
(sin wrappers ni abstracciones de un solo uso, diffs revisables) se aplica
antes de escribir.

## Detalles técnicos

- Los archivos de ruta conservan su nombre y su `createFileRoute` para no
  romper `routeTree.gen.ts`; solo se vacía su cuerpo.
- El movimiento a features se hace con `mv` más actualización de imports,
  sin reescribir lógica, para que el diff sea revisable.
- Se mantienen los datos demo en memoria tal como están; esta reorganización
  no toca reglas de negocio ni cálculos.
- `head()` de cada ruta se conserva y se completa donde falte.
- El agente interno y el servidor MCP se documentan en ARCHITECTURE.md como
  parte del harness (herramientas), sin cambios de código.

## Fuera de alcance en esta vuelta

Backend o persistencia, cambios visuales de la interfaz, nuevos módulos
funcionales y modificación de fórmulas de facturación.
