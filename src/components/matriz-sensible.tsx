import { Check, X, AlertTriangle, UserCheck } from "lucide-react";
import {
  accionesSensibles,
  rolesOrg,
  rolSigla,
  rolDescripcion,
  datoLabel,
  rolesConAcceso,
  type DatoSensible,
  type NivelAccion,
} from "@/lib/roles-tdr";

const celda: Record<NivelAccion, { icon: typeof Check; cls: string; label: string }> = {
  si: { icon: Check, cls: "text-[oklch(0.48_0.13_155)] bg-[oklch(0.94_0.05_155)]", label: "Permitido" },
  no: { icon: X, cls: "text-muted-foreground bg-muted/60", label: "No permitido" },
  condicional: { icon: AlertTriangle, cls: "text-[oklch(0.5_0.14_70)] bg-[oklch(0.95_0.07_70)]", label: "Condicional / requiere justificación" },
  propios: { icon: UserCheck, cls: "text-[oklch(0.45_0.13_250)] bg-[oklch(0.94_0.05_250)]", label: "Solo casos asignados" },
};

const datos: DatoSensible[] = [
  "nota_progreso",
  "nota_cualitativa",
  "registro_abc",
  "horas_documentos",
  "justificaciones_salud",
  "facturacion_horas_autorizadas",
  "montos_monetarios",
];

export function MatrizSensible() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl">Matriz de acciones clínicas sensibles</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          Acciones con impacto metodológico o de auditoría. Toda ejecución queda registrada en la bitácora
          inmutable con actor, fecha, entidad y justificación cuando aplica.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium min-w-[320px]">Acción</th>
              {rolesOrg.map((r) => (
                <th key={r} className="px-2 py-3 font-medium text-center" title={rolDescripcion[r]}>
                  <span className="text-[0.7rem] tracking-wide">{rolSigla[r]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accionesSensibles.map((a) => (
              <tr key={a.id} className="border-t border-border/50">
                <td className="px-4 py-3 align-top">
                  <div>{a.nombre}</div>
                  {a.nota && <div className="text-xs text-muted-foreground mt-0.5">{a.nota}</div>}
                </td>
                {rolesOrg.map((r) => {
                  const c = celda[a.permisos[r]];
                  const Icon = c.icon;
                  return (
                    <td key={r} className="px-2 py-3 text-center">
                      <span
                        title={c.label}
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${c.cls}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {Object.values(celda).map((c) => {
          const Icon = c.icon;
          return (
            <span key={c.label} className="inline-flex items-center gap-1.5">
              <span className={`inline-flex h-5 w-5 items-center justify-center rounded ${c.cls}`}>
                <Icon className="h-3 w-3" />
              </span>
              {c.label}
            </span>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rolesOrg.map((r) => (
          <div key={r} className="rounded-xl border border-border/60 p-4">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 text-primary px-1.5 py-0.5 text-[0.65rem] font-semibold">
                {rolSigla[r]}
              </span>
              <span className="text-sm font-medium">{r}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{rolDescripcion[r]}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-display text-xl">Segregación de datos sensibles</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Qué roles pueden visualizar cada tipo de dato restringido.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium min-w-[280px]">Dato</th>
                {rolesOrg.map((r) => (
                  <th key={r} className="px-2 py-3 font-medium text-center text-[0.7rem]">
                    {rolSigla[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datos.map((d) => {
                const permitidos = rolesConAcceso(d);
                return (
                  <tr key={d} className="border-t border-border/50">
                    <td className="px-4 py-3">{datoLabel[d]}</td>
                    {rolesOrg.map((r) => (
                      <td key={r} className="px-2 py-3 text-center">
                        {permitidos.includes(r) ? (
                          <Check className="mx-auto h-4 w-4 text-[oklch(0.48_0.13_155)]" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-muted-foreground/50" />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
