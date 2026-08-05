import { defineTool } from "@lovable.dev/mcp-js";
import { sedesFact } from "@/lib/modulos-data";

export default defineTool({
  name: "list_sedes",
  title: "Listar sedes",
  description:
    "Lista las sedes del CIE con su ciudad y la cantidad de niños registrados (datos de demostración).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const sedes = sedesFact.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      ciudad: s.ciudad,
      ninos: s.ninos.length,
      ninosINSS: s.ninos.filter((n) => n.inss).length,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(sedes, null, 2) }],
      structuredContent: { sedes },
    };
  },
});
