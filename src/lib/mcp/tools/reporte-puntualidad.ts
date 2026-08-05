import { defineTool } from "@lovable.dev/mcp-js";
import { puntualidadHoy, totalesPuntualidad } from "@/lib/puntualidad-data";

export default defineTool({
  name: "reporte_puntualidad",
  title: "Reporte de puntualidad",
  description:
    "Devuelve el reporte de puntualidad y asistencia del día por sede: atendidos, a tiempo, tarde leve (1-14 min), tarde (15+ min), ausentes y desviación promedio. Datos de demostración.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const payload = { totales: totalesPuntualidad(), porSede: puntualidadHoy };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
