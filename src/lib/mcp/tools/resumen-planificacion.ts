import { defineTool } from "@lovable.dev/mcp-js";
import {
  motivosResumen,
  ninosPlan,
  sedesPlan,
  supervisoresPlan,
  totales,
} from "@/lib/planificacion-data";

export default defineTool({
  name: "resumen_planificacion",
  title: "Resumen de planificación",
  description:
    "Devuelve la planificación de horas: totales, desglose por sede y por supervisor, motivos de horas no programadas y el detalle por niño. Datos de demostración.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const payload = {
      totales: totales(),
      porSede: sedesPlan,
      porSupervisor: supervisoresPlan,
      motivos: motivosResumen(),
      porNino: ninosPlan,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
