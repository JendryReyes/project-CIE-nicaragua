import { defineTool } from "@lovable.dev/mcp-js";
import { catalogoCIE } from "@/lib/catalogo-cie";

export default defineTool({
  name: "catalogo_servicios",
  title: "Catálogo de servicios",
  description:
    "Lista los servicios clínicos del CIE con área, rango de edad, modalidad, cupo INSS, cupo ocupado y modelos clínicos aplicados.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const servicios = catalogoCIE.map((s) => ({
      ...s,
      disponibles: Math.max(0, s.cupoINSS - s.cupoOcupado),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(servicios, null, 2) }],
      structuredContent: { servicios },
    };
  },
});
