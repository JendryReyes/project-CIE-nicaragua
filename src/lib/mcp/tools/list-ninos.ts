import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { sedesFact } from "@/lib/modulos-data";

export default defineTool({
  name: "list_ninos",
  title: "Listar niños",
  description:
    "Lista los niños atendidos (datos de demostración), opcionalmente filtrados por sede o por pagador INSS.",
  inputSchema: {
    sedeId: z.string().describe("Filtra por id de sede, p. ej. 'sd', 'lc', 'esteli'.").optional(),
    soloINSS: z.boolean().describe("Si es true, solo devuelve casos INSS.").optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ sedeId, soloINSS }) => {
    const ninos = sedesFact
      .filter((s) => !sedeId || s.id === sedeId)
      .flatMap((s) =>
        s.ninos
          .filter((n) => (soloINSS ? n.inss : true))
          .map((n) => ({
            id: n.id,
            nombre: n.nombre,
            sede: s.nombre,
            expediente: n.expediente,
            codigoINSS: n.codigoINSS ?? null,
            pagador: n.inss ? "INSS" : n.privado ? "Privado" : "Otro",
            aprobadasMes: n.aprobadasMes,
          })),
      );
    return {
      content: [{ type: "text", text: JSON.stringify(ninos, null, 2) }],
      structuredContent: { ninos, total: ninos.length },
    };
  },
});
