import { createFileRoute } from "@tanstack/react-router";
import { Gauge, TrendingUp, TrendingDown, Eye, Timer } from "lucide-react";
import { useRol } from "@/lib/roles-tdr";
import { alcancePorRol, grupoLabel, kpis, kpisVisibles, slaRendimiento, type Grupo } from "@/lib/kpis-data";

export const Route = createFileRoute("/_app/kpis")({
  head: () => ({
    meta: [
      { title: "Indicadores de gestión (KPIs) · CIE" },
      {
        name: "description",
        content: "Tablero de indicadores operativos, clínicos y administrativos con visibilidad segmentada por rol.",
      },
      { property: "og:title", content: "Indicadores de gestión (KPIs) · CIE" },
      { property: "og:description", content: "KPIs operativos, clínicos y administrativos del CIE con reglas de visibilidad por rol." },
    ],
  }),
  component: Kpis,
});

const tono = {
  ok: "border-[oklch(0.88_0.053_160)] bg-[oklch(0.98_0.014_265)]",
  atencion: "border-[oklch(0.88_0.062_80)] bg-[oklch(0.99_0.014_265)]",
  critico: "border-[oklch(0.88_0.062_30)] bg-[oklch(0.99_0.014_265)]",
} as const;

function Kpis() {
  const { rol } = useRol();
  const visibles = kpisVisibles(rol);
  const alcance = alcancePorRol[rol];
  const ocultos = kpis.length - visibles.length;

  return (
    <div className="max-w-[1400px] space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Gauge className="h-4 w-4" /> Gestión
        </div>
        <h1 className="mt-1 font-display text-3xl">Indicadores de gestión y desempeño</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Tablero de KPIs operativos, clínicos y administrativos. Los indicadores visibles dependen del rol y los
          permisos del usuario activo (regla 10.4).
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Eye className="h-4 w-4 text-primary" /> Alcance del rol {rol}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{alcance.alcance}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {visibles.length} de {kpis.length} indicadores visibles
          {ocultos > 0 ? ` · ${ocultos} restringidos por permisos` : " · acceso global"}
        </p>
      </div>

      {(["operativos", "clinicos", "administrativos"] as Grupo[]).map((g) => {
        const items = visibles.filter((k) => k.grupo === g);
        if (!items.length) return null;
        return (
          <section key={g} className="space-y-3">
            <h2 className="font-display text-lg">{grupoLabel[g]}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((k) => (
                <div key={k.id} className={`rounded-xl border p-4 ${tono[k.estado]}`}>
                  <div className="text-xs text-muted-foreground">{k.nombre}</div>
                  <div className="mt-1 font-display text-2xl">{k.valor}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs">
                    {k.tendencia >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5 text-[oklch(0.55_0.123_160)]" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-[oklch(0.55_0.132_30)]" />
                    )}
                    <span className="text-muted-foreground">
                      {k.tendencia > 0 ? "+" : ""}
                      {k.tendencia}% vs período anterior
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">{k.detalle}</div>
                  {k.meta && <div className="mt-1 text-xs font-medium">Meta: {k.meta}</div>}
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <section className="rounded-xl border border-border/60 p-4">
        <h2 className="flex items-center gap-2 font-display text-lg">
          <Timer className="h-4 w-4" /> 10.5 Rendimiento objetivo (P95)
        </h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Proceso</th>
                <th className="px-3 py-2 text-left">Objetivo</th>
                <th className="px-3 py-2 text-left">Medido</th>
                <th className="px-3 py-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {slaRendimiento.map((s) => (
                <tr key={s.proceso} className="border-t border-border/50">
                  <td className="px-3 py-2">{s.proceso}</td>
                  <td className="px-3 py-2 text-xs">{s.objetivo}</td>
                  <td className="px-3 py-2 text-xs">{s.medido}</td>
                  <td className="px-3 py-2 text-xs">
                    <span className="rounded-full bg-[oklch(0.94_0.044_160)] px-2 py-0.5 text-[oklch(0.36_0.097_160)]">
                      {s.ok ? "Dentro del SLA" : "Fuera del SLA"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
