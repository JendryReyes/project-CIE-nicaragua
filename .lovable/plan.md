
## Visión

Construir un prototipo navegable del **sistema operativo del CIE Nicaragua** para terapeutas y coordinadores. La ventaja sobre Hi Rasmus / CentralReach / Office Puzzle:

1. **Modelo integral edu-terapéutico** (diagnóstico + fisioterapia sensorial + logopedia + conducta en un solo expediente) — no solo ABA.
2. **Adaptado a Nicaragua / INSS** — flujo de colillas, facturación INSS, español nativo, marco jurídico local.
3. **Experiencia para familias** integrada — portal de padres simple, consentimientos digitales, reportes claros.

## Benchmark express (incorporado en el diseño)

| Plataforma | Fortaleza | Debilidad que explotamos |
|---|---|---|
| **CentralReach** | Suite ABA completa, billing US | UI cargada, gringa, cara, no INSS |
| **Hi Rasmus** | Data collection moderna, EU | Solo ABA, sin fisio/logopedia, sin facturación local |
| **Office Puzzle** | Bilingüe, scheduling | UX anticuada, foco clínico estrecho |

CIE gana siendo **integral + local + cálido**.

## Pantallas del prototipo (rutas)

```
/                       Login (mock, entra como Coordinador)
/dashboard              Resumen del día: sesiones, asistencia, alertas INSS
/ninos                  Lista de niños/as con filtros por área y estado
/ninos/$id              Expediente integral (4 tabs):
                        - Resumen + diagnóstico
                        - Diagnóstico / Fisio / Logopedia / Conducta
                        - Sesiones y progreso
                        - Familia y documentos
/horario                Grilla semanal de sesiones por terapeuta/sala
/asistencia             Toma de asistencia del día + colilla INSS
/facturacion            Cobro INSS — lotes, soportes, estado
/familias               Portal: comunicación con padres, consentimientos
/benchmark              Página comparativa CIE vs los 3 competidores
```

Todo con `_authenticated` layout + sidebar shadcn colapsable.

## Dirección visual — "Cálido y humano"

- **Paleta** (tokens HSL en `src/styles.css`):
  - Fondo crema `#FBF7F2`, superficie blanca rota
  - Primario terracota suave `#C26B4D` (el corazón del logo CIE)
  - Acento verde salvia `#7BA68C` (terapia, calma)
  - Texto carbón cálido `#2B2420`
  - Estados: éxito salvia, alerta ámbar miel, error coral
- **Tipografía**: Fraunces (display, headings) + Inter (UI/body). Headings con tracking ajustado, números tabulares para datos.
- **Forma**: bordes 14px, sombras suaves multicapa, separadores con opacidad baja
- **Motivo visual**: pieza de rompecabezas como acento sutil (no decoración pesada), avatares con iniciales en círculos pastel por área terapéutica
- **Densidad**: cómoda — no SaaS frío denso, no infantil de más; cards generosas, números grandes en KPIs

## Datos demo

`src/lib/demo-data.ts` con ~12 niños, 6 terapeutas, sesiones de la semana, lotes INSS. Sin backend — todo en memoria con `@tanstack/react-query` para que se sienta real.

## Aspectos técnicos

- **Stack**: TanStack Start + Tailwind v4 + shadcn. Sin Cloud todavía (es prototipo demo).
- **Rutas** bajo `_authenticated` con login mock que solo setea un flag en localStorage.
- **Sidebar** shadcn con navegación entre módulos, colapsable.
- **Componentes clave**: `KpiCard`, `SesionRow`, `ExpedienteHeader`, `AreaBadge` (color por área: diagnóstico/fisio/logopedia/conducta), `INSSStatusPill`.
- **i18n**: todo en español de Nicaragua (no es i18n real, copy directo).
- **Página `/benchmark`** como pieza comercial dentro del producto: tabla comparativa visual CIE vs los 3, con secciones "lo que ellos no hacen" centradas en INSS, integralidad y familias.

## Lo que NO entra en esta fase

- Backend real / autenticación real / persistencia
- Recolección de datos de sesión ABA detallada (gráficas de comportamiento)
- App móvil de padres
- Reportes PDF reales

Se dejan los espacios diseñados para sumarlos después.

## Resultado esperado

Un prototipo que cualquier persona del CIE pueda recorrer y entender en 3 minutos por qué es mejor que las plataformas extranjeras — y que sirva como base real para construir el producto.
