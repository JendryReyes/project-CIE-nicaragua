import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ejecucionAnual, ejecucionSedes, mesesCorto } from "@/lib/modulos-data";
import { CheckCircle2, AlertTriangle, Calendar } from "lucide-react";

export const Route = createFileRoute("/_app/ejecucion")({
  head: () => ({ meta: [{ title: "Módulo de Ejecución · CIE" }] }),
  component: Ejecucion,
});

function Ejecucion() {
  const [vista, setVista] = useState<"Anual"|"Mensual">("Anual");

  const totalProg = ejecucionAnual[0].valores.reduce((a,b)=>a+b,0);
  const totalEjec = ejecucionAnual[3].valores.reduce((a,b)=>a+b,0);
  const totalNo   = ejecucionAnual[4].valores.reduce((a,b)=>a+b,0);
  const cumple = Math.round((totalEjec / totalProg) * 100);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Módulo de Ejecución</h1>
          <p className="text-sm text-muted-foreground mt-1">Vista general · todas las sedes</p>
        </div>
        <div className="inline-flex rounded-md border border-border overflow-hidden text-xs">
          {(["Anual","Mensual"] as const).map((v)=>(
            <button key={v} onClick={()=>setVista(v)} className={`px-3 py-1.5 ${vista===v ? "bg-primary text-primary-foreground":"hover:bg-muted"}`}>{v}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="Programadas" value={totalProg} icon={<Calendar className="h-4 w-4" />} />
        <KPI label="Ejecutadas" value={totalEjec} icon={<CheckCircle2 className="h-4 w-4 text-[oklch(0.55_0.16_155)]" />} />
        <KPI label="No ejecutadas" value={totalNo} icon={<AlertTriangle className="h-4 w-4 text-[oklch(0.6_0.18_25)]" />} warn />
        <KPI label="% Cumplimiento" value={`${cumple}%`} accent />
      </div>

      {/* Tabla anual estilo "heatmap" */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-baseline justify-between">
          <h3 className="font-display text-base">{vista === "Anual" ? "Vista anual 2026" : "Mayo 2026 – por semana"}</h3>
          <span className="text-xs text-muted-foreground">Clic en celda para ver detalle</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-3 py-2 sticky left-0 bg-muted/40">Métrica</th>
                {mesesCorto.map((m,i)=>(
                  <th key={m} className={`px-3 py-2 text-right font-medium ${i===4?"text-primary":""}`}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ejecucionAnual.map((fila, ri) => {
                const colorRow = ri===1 ? "text-[oklch(0.45_0.15_155)]" : ri===4 ? "text-[oklch(0.45_0.15_25)]" : "";
                return (
                  <tr key={fila.fila} className="border-t border-border/40">
                    <td className={`px-3 py-2 font-medium sticky left-0 bg-card ${colorRow}`}>{fila.fila}</td>
                    {fila.valores.map((v, i) => (
                      <td key={i} className={`px-3 py-2 text-right tabular ${v===0?"text-muted-foreground/40":""}`}>
                        {v === 0 ? "–" : v.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Por sede */}
      <div>
        <h3 className="font-display text-lg mb-3">Por sede</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {ejecucionSedes.map((s) => (
            <article key={s.sede} className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-display text-lg">{s.sede}</div>
                  <div className="text-[11px] text-muted-foreground">{s.ciudad}</div>
                </div>
                <div className={`font-display text-2xl tabular ${s.cumple >= 90 ? "text-[oklch(0.5_0.14_155)]" : s.cumple >= 85 ? "text-foreground" : "text-[oklch(0.55_0.16_25)]"}`}>
                  {s.cumple}%
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full ${s.cumple >= 90 ? "bg-[oklch(0.6_0.16_155)]" : s.cumple >= 85 ? "bg-primary" : "bg-[oklch(0.6_0.18_25)]"}`} style={{ width: `${s.cumple}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5 tabular">
                <span>{s.ejec}h ejecutadas</span><span>Total {s.prog}h</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, hint, icon, accent, warn }: { label: string; value: string|number; hint?: string; icon?: React.ReactNode; accent?: boolean; warn?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${warn ? "border-[oklch(0.88_0.1_25)] bg-[oklch(0.98_0.03_25)]" : "border-border/70 bg-card"}`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">{icon}<span>{label}</span></div>
      <div className={`font-display text-3xl mt-1 tabular ${accent ? "text-primary":""}`}>{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}
