import { defineMcp } from "@lovable.dev/mcp-js";
import catalogoServiciosTool from "./tools/catalogo-servicios";
import listNinosTool from "./tools/list-ninos";
import listSedesTool from "./tools/list-sedes";
import reportePuntualidadTool from "./tools/reporte-puntualidad";
import resumenFacturacionTool from "./tools/resumen-facturacion";
import resumenPlanificacionTool from "./tools/resumen-planificacion";

export default defineMcp({
  name: "cie-excellence-benchmark",
  title: "CIE Excellence Benchmark",
  version: "0.1.0",
  instructions:
    "Herramientas de consulta del sistema CIE (Centro de Intervención Eduterapéutica): sedes, niños atendidos, resumen de facturación INSS por quincena, puntualidad/asistencia diaria, planificación de horas y catálogo de servicios clínicos. Todos los datos son de demostración y de solo lectura.",
  tools: [
    listSedesTool,
    listNinosTool,
    resumenFacturacionTool,
    reportePuntualidadTool,
    resumenPlanificacionTool,
    catalogoServiciosTool,
  ],
});
