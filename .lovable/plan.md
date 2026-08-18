# Crear agentes IA en el proyecto CIE

## Resumen

El proyecto ya tiene un servidor MCP público en `/mcp` con 6 herramientas de consulta del CIE. Esta propuesta aprovecha esa base para agregar un **asistente de IA dentro de la app** que use las mismas herramientas de datos, y deja documentado cómo usar el MCP externo.

## Opción 1: MCP externo (ya disponible)

El servidor MCP ya está publicado en `/mcp` con estas herramientas de solo lectura:

- `list_sedes`: sedes del CIE con ciudad y cantidad de niños.
- `list_ninos`: niños atendidos, filtrables por sede o pagador INSS.
- `resumen_facturacion`: resumen de facturación INSS por periodo, sede o niño.
- `reporte_puntualidad`: reporte de puntualidad y asistencia del día.
- `resumen_planificacion`: totales y desglose de planificación de horas.
- `catalogo_servicios`: servicios clínicos con cupos y modelos aplicados.

Para usarlo desde ChatGPT, Claude, Cursor o cualquier cliente MCP, basta con que la app esté publicada y apuntar al endpoint `/mcp` de la URL publicada. No requiere autenticación actualmente.

## Opción 2: Asistente IA dentro de la app (propuesta)

Construir un chatbot embebido en el CIE que responda preguntas sobre sedes, niños, facturación, planificación y asistencia. El agente tendrá acceso a las mismas herramientas de datos del MCP, pero invocadas directamente desde el servidor para evitar latencia extra.

### Tareas técnicas

1. **Activar Lovable AI Gateway**
   - Provisionar `LOVABLE_API_KEY` en los secretos del proyecto con `ai_gateway--create`.

2. **Crear helper de gateway**
   - Archivo: `src/lib/ai-gateway.server.ts`.
   - Implementar `createLovableAiGatewayProvider` usando `@ai-sdk/openai-compatible` con la URL `https://ai.gateway.lovable.dev/v1` y el header `Lovable-API-Key`.

3. **Crear endpoint de chat streaming**
   - Archivo: `src/routes/api/chat.ts`.
   - Usar `streamText` con `convertToModelMessages` y devolver `toUIMessageStreamResponse`.
   - Modelo: `google/gemini-3.7-flash` (rápido y económico para consultas institucionales).
   - Sin persistencia de historial (según preferencia del usuario): solo enviar mensajes actuales del cliente.

4. **Definir herramientas del agente**
   - Archivo: `src/lib/agent-tools.ts`.
   - Reutilizar las funciones de datos ya existentes (`src/lib/modulos-data.ts`, `src/lib/puntualidad-data.ts`, `src/lib/planificacion-data.ts`, `src/lib/catalogo-cie.ts`).
   - Herramientas: `listarSedes`, `listarNinos`, `resumenFacturacion`, `reportePuntualidad`, `resumenPlanificacion`, `catalogoServicios`.

5. **Crear UI del chatbot**
   - Archivo: `src/components/agente-cie.tsx`.
   - Usar `useChat` de `@ai-sdk/react` con `DefaultChatTransport` apuntando a `/api/chat`.
   - Mostrar burbujas de mensaje, entrada de texto y estado de carga.
   - Renderizar respuestas en markdown.
   - Montar el componente inicialmente en el dashboard (`src/routes/_app.dashboard.tsx`) o en un panel flotante accesible desde el header.

6. **Verificar**
   - Probar el endpoint `/api/chat` con un mensaje de prueba.
   - Verificar que el chatbot responda con datos reales de demostración.
   - Validar que el MCP externo sigue respondiendo correctamente tras los cambios.

## Alcance fuera de esta propuesta

- Persistencia de conversaciones (el usuario eligió "sin historial").
- Acciones destructivas o escritura mediante el agente (solo lectura en esta primera versión).
- Autenticación en el servidor MCP (actualmente es público; se puede agregar OAuth más adelante si se requiere).

## Entregables

- Asistente de IA visible dentro del dashboard del CIE.
- Endpoint `/api/chat` funcional con streaming.
- Herramientas de datos reutilizadas tanto por el chatbot interno como por el MCP externo.
- Documentación breve de uso del MCP externo.
