## Objetivo

Eliminar la duplicación entre **Facturación** y **Cartas INSS** integrando la gestión de cartas como una pestaña más dentro de `/facturacion`, manteniendo toda la funcionalidad actual (filtros, renovar, descargar PDF).

## Cambios

### 1. Extraer el contenido de Cartas INSS a un componente reutilizable
- Nuevo archivo: `src/components/facturacion/cartas-inss-panel.tsx`
- Mueve toda la lógica/UI actual de `src/routes/_app.facturacion.cartas.tsx` (filtros por sede/área/estado, búsqueda, tabla, contadores, renovar, descargar PDF) a un componente `<CartasINSSPanel />` sin la cabecera de página ni el `createFileRoute`.

### 2. Añadir la pestaña en Facturación
- En `src/routes/_app.facturacion.tsx`:
  - Ampliar el tipo del estado `tab` a `"general" | "cierre" | "cartas"`.
  - Añadir el tercer botón **"Cartas INSS"** en la barra de tabs.
  - Renderizar `<CartasINSSPanel />` cuando `tab === "cartas"`.
  - Ajustar el subtítulo del header para que refleje la pestaña activa.

### 3. Convertir la ruta antigua en redirect
- `src/routes/_app.facturacion.cartas.tsx` queda como redirect a `/facturacion` (mismo patrón que ya se usó con `_app.facturacion.cierre.tsx`), para no romper enlaces existentes.

### 4. Limpiar el sidebar
- En `src/components/app-sidebar.tsx`: quitar la entrada **"Cartas INSS"** del menú. Queda solo **"Facturación"**, que internamente contiene Vista general · Cierre · Cartas INSS.

## Resultado

El sidebar deja de mostrar dos módulos que se sentían duplicados. Toda la operativa del INSS (consumo quincenal, cierre y cartas de aprobación) vive bajo `/facturacion` con tres pestañas claras.
