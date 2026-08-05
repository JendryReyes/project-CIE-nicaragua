import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { calcularNino, sedesFact } from "@/lib/modulos-data";

export default defineTool({
  name: "resumen_facturacion",
  title: "Resumen de facturación INSS",
  description:
    "Calcula el resumen de facturación de la quincena (horas aprobadas, periodo 1, ejecutadas, facturables, excedentes y monto) por sede o para un niño específico. Datos de demostración.",
  inputSchema: {
    sedeId: z.string().describe("Id de sede para limitar el resumen.").optional(),
    ninoId: z.string().describe("Id del niño para un detalle individual.").optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ sedeId, ninoId }) => {
    const filas = sedesFact
      .filter((s) => !sedeId || s.id === sedeId)
      .flatMap((s) =>
        s.ninos
          .filter((n) => !ninoId || n.id === ninoId)
          .map((n) => {
            const c = calcularNino(n);
            return {
              ninoId: n.id,
              nombre: n.nombre,
              sede: s.nombre,
              pagador: n.inss ? "INSS" : "Privado",
              horasFacturables: c.totalHoras,
              montoUSD: Number(c.total.toFixed(2)),
              excedeAprobado: c.tieneExcede,
              constanciaMedica: !!n.constancia,
              detallePorArea: c.detalles,
            };
          }),
      );

    if (filas.length === 0) {
      throw new ToolError("No se encontraron casos con esos filtros.");
    }

    const resumen = {
      casos: filas.length,
      horasFacturables: filas.reduce((a, f) => a + f.horasFacturables, 0),
      montoUSD: Number(filas.reduce((a, f) => a + f.montoUSD, 0).toFixed(2)),
      casosConExcedente: filas.filter((f) => f.excedeAprobado).length,
      casosConExcedenteSinConstancia: filas.filter((f) => f.excedeAprobado && !f.constanciaMedica)
        .length,
    };

    return {
      content: [{ type: "text", text: JSON.stringify({ resumen, filas }, null, 2) }],
      structuredContent: { resumen, filas },
    };
  },
});
