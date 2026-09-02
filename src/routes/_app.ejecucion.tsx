import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ejecucionAnual, ejecucionSedes, mesesCorto } from "@/lib/modulos-data";
import { CheckCircle2, AlertTriangle, Calendar, X, TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/_app/ejecucion")({
  head: () => ({ meta: [{ title: "Módulo de Ejecución · CIE" }] }),
  component: Ejecucion,
});

type DetalleCelda = {
  tipo: "mes" | "semana" | "sede";
  titulo: string;
  subtitulo?: string;
  programadas: number;
  ejecutadas: number;
  reprog: number;
  noEjec: number;
  desglose?: { label: string; prog: number; ejec: number }[];
  motivos?: { motivo: string; cantidad: number }[];
};

// Datos sintéticos por semana de mayo
const semanasMayo = [
  { sem: "Sem 1 (1-7 May)",  prog: 165, ejec: 152, reprog: 4, noEjec: 9 },
  { sem: "Sem 2 (8-14 May)", prog: 168, ejec: 156, reprog: 5, noEjec: 7 },
  { sem: "Sem 3 (15-21 May)",prog: 164, ejec: 148, reprog: 6, noEjec: 10 },
  { sem: "Sem 4 (22-28 May)",prog: 163, ejec: 146, reprog: 6, noEjec: 11 },
];

const motivosNoEjec = [
  { motivo: "Inasistencia del niño", cantidad: 18 },
  { motivo: "Terapeuta de licencia", cantidad: 9 },
  { motivo: "Sala no disponible", cantidad: 5 },
  { motivo: "Feriado / cierre", cantidad: 3 },
  { motivo: "Otro", cantidad: 2 },
];

function Ejecucion() {
  const [vista, setVista] = useState<"Anual"|"Mensual">("Anual");
  const [detalle, setDetalle] = useState<DetalleCelda | null>(null);

  const totalProg = ejecucionAnual[0].valores.reduce((a,b)=>a+b,0);
  const totalEjec = ejecucionAnual[3].valores.reduce((a,b)=>a+b,0);
  const totalNo   = ejecucionAnual[4].valores.reduce((a,b)=>a+b,0);
  const cumple = Math.round((totalEjec / totalProg) * 100);

  // datos mensuales (mayo)
  const mesIdx = 4;
  const mensual = useMemo(() => ({
    prog: ejecucionAnual[0].valores[mesIdx],
    ejec: ejecucionAnual[1].valores[mesIdx],
    reprog: ejecucionAnual[2].valores[mesIdx],
    totalEjec: ejecucionAnual[3].valores[mesIdx],
    noEjec: ejecucionAnual[4].valores[mesIdx],
  }), []);

  const abrirMes = (i: number) => {
    const prog = ejecucionAnual[0].valores[i];
    if (!prog) return;
    setDetalle({
      tipo: "mes",
      titulo: `${mesesCorto[i]} 2026`,
      subtitulo: "Resumen del mes · todas las sedes",
      programadas: prog,
      ejecutadas: ejecucionAnual[1].valores[i],
      reprog: ejecucionAnual[2].valores[i],
      noEjec: ejecucionAnual[4].valores[i],
      desglose: ejecucionSedes.map(s => ({
        label: `${s.sede} – ${s.ciudad}`,
        prog: Math.round(prog * (s.prog / ejecucionSedes.reduce((a,b)=>a+b.prog,0))),
        ejec: Math.round(ejecucionAnual[1].valores[i] * (s.ejec / ejecucionSedes.reduce((a,b)=>a+b.ejec,0))),
      })),
      motivos: motivosNoEjec,
    });
  };

  const abrirSemana = (idx: number) => {
    const w = semanasMayo[idx];
    setDetalle({
      tipo: "semana",
      titulo: w.sem,
      subtitulo: "Mayo 2026 · todas las sedes",
      programadas: w.prog,
      ejecutadas: w.ejec,
      reprog: w.reprog,
      noEjec: w.noEjec,
      desglose: ejecucionSedes.map(s => ({
        label: `${s.sede} – ${s.ciudad}`,
        prog: Math.round(w.prog * (s.prog / ejecucionSedes.reduce((a,b)=>a+b.prog,0))),
        ejec: Math.round(w.ejec * (s.ejec / ejecucionSedes.reduce((a,b)=>a+b.ejec,0))),
      })),
      motivos: motivosNoEjec.map(m => ({ motivo: m.motivo, cantidad: Math.max(1, Math.round(m.cantidad/4)) })),
    });
  };

  const abrirSede = (s: typeof ejecucionSedes[number]) => {
    setDetalle({
      tipo: "sede",
      titulo: `${s.sede} – ${s.ciudad}`,
      subtitulo: "Acumulado año · todas las áreas",
      programadas: s.prog * 12,
      ejecutadas: s.ejec * 12,
      reprog: Math.round(s.prog * 0.04 * 12),
      noEjec: (s.prog - s.ejec) * 12,
      desglose: [
        { label: "Psicología", prog: Math.round(s.prog*0.25*12), ejec: Math.round(s.ejec*0.25*12) },
        { label: "Lenguaje",   prog: Math.round(s.prog*0.22*12), ejec: Math.round(s.ejec*0.22*12) },
        { label: "Ocupacional",prog: Math.round(s.prog*0.20*12), ejec: Math.round(s.ejec*0.20*12) },
        { label: "Físico",     prog: Math.round(s.prog*0.18*12), ejec: Math.round(s.ejec*0.18*12) },
        { label: "Educativa",  prog: Math.round(s.prog*0.15*12), ejec: Math.round(s.ejec*0.15*12) },
      ],
      motivos: motivosNoEjec,
    });
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Módulo de Ejecución</h1>
          <p className="text-sm text-muted-foreground mt-1">Vista general · todas las sedes</p>
        </div>
        <div className="inline-flex rounded-md border border-border overflow-hidden text-xs">
          {(["Anual","Mensual"] as const).map((v)=>(
            <button key={v} onClick={()=>setVista(v)} className={`px-3 py-1.5 transition-colors ${vista===v ? "bg-primary text-primary-foreground":"hover:bg-muted"}`}>{v}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {vista === "Anual" ? (
          <>
            <KPI label="Programadas" value={totalProg} icon={<Calendar className="h-4 w-4" />} />
            <KPI label="Ejecutadas" value={totalEjec} icon={<CheckCircle2 className="h-4 w-4 text-[oklch(0.55_0.141_160)]" />} />
            <KPI label="No ejecutadas" value={totalNo} icon={<AlertTriangle className="h-4 w-4 text-[oklch(0.6_0.158_30)]" />} warn />
            <KPI label="% Cumplimiento" value={`${cumple}%`} accent />
          </>
        ) : (
          <>
            <KPI label="Programadas (May)" value={mensual.prog} icon={<Calendar className="h-4 w-4" />} />
            <KPI label="Ejecutadas (May)" value={mensual.ejec} icon={<CheckCircle2 className="h-4 w-4 text-[oklch(0.55_0.141_160)]" />} />
            <KPI label="No ejecutadas" value={mensual.noEjec} icon={<AlertTriangle className="h-4 w-4 text-[oklch(0.6_0.158_30)]" />} warn />
            <KPI label="% Cumplimiento" value={`${Math.round((mensual.ejec/mensual.prog)*100)}%`} accent />
          </>
        )}
      </div>

      {vista === "Anual" ? (
        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
          <div className="p-4 border-b border-border/60 flex items-baseline justify-between">
            <h3 className="font-display text-base">Vista anual 2026</h3>
            <span className="text-xs text-muted-foreground">Clic en una columna para ver detalle del mes</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-3 py-2 sticky left-0 bg-muted/40">Métrica</th>
                  {mesesCorto.map((m,i)=>(
                    <th key={m} className={`px-3 py-2 text-right font-medium ${i===4?"text-primary":""}`}>
                      <button
                        onClick={() => abrirMes(i)}
                        disabled={!ejecucionAnual[0].valores[i]}
                        className="hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                      >{m}</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ejecucionAnual.map((fila, ri) => {
                  const colorRow = ri===1 ? "text-[oklch(0.45_0.132_160)]" : ri===4 ? "text-[oklch(0.45_0.132_30)]" : "";
                  return (
                    <tr key={fila.fila} className="border-t border-border/40">
                      <td className={`px-3 py-2 font-medium sticky left-0 bg-card ${colorRow}`}>{fila.fila}</td>
                      {fila.valores.map((v, i) => (
                        <td key={i} className={`px-1 py-1 text-right tabular ${v===0?"text-muted-foreground/40":""}`}>
                          <button
                            onClick={() => abrirMes(i)}
                            disabled={v === 0}
                            className="w-full px-2 py-1 rounded hover:bg-primary/10 disabled:hover:bg-transparent disabled:cursor-not-allowed text-right"
                          >
                            {v === 0 ? "–" : v.toLocaleString()}
                          </button>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
          <div className="p-4 border-b border-border/60 flex items-baseline justify-between">
            <h3 className="font-display text-base">Mayo 2026 – por semana</h3>
            <span className="text-xs text-muted-foreground">Clic en una fila para ver detalle</span>
          </div>
          <div className="divide-y divide-border/40">
            {semanasMayo.map((w, i) => {
              const pct = Math.round((w.ejec / w.prog) * 100);
              return (
                <button
                  key={w.sem}
                  onClick={() => abrirSemana(i)}
                  className="w-full grid grid-cols-12 items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
                >
                  <div className="col-span-3 font-medium text-sm">{w.sem}</div>
                  <div className="col-span-6">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full ${pct >= 90 ? "bg-[oklch(0.6_0.141_160)]" : pct >= 85 ? "bg-primary" : "bg-[oklch(0.6_0.158_30)]"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground mt-1 tabular">
                      <span>{w.ejec} ejecutadas</span><span>{w.noEjec} no ejec · {w.reprog} reprog</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-right tabular text-sm">{w.prog} prog</div>
                  <div className={`col-span-1 text-right font-display text-lg tabular ${pct >= 90 ? "text-[oklch(0.5_0.123_160)]" : pct >= 85 ? "text-foreground" : "text-[oklch(0.55_0.141_30)]"}`}>{pct}%</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Por sede */}
      <div>
        <h3 className="font-display text-lg mb-3">Por sede</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {ejecucionSedes.map((s) => (
            <button
              key={s.sede}
              onClick={() => abrirSede(s)}
              className="text-left rounded-2xl border border-border/70 bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-display text-lg">{s.sede}</div>
                  <div className="text-[11px] text-muted-foreground">{s.ciudad}</div>
                </div>
                <div className={`font-display text-2xl tabular ${s.cumple >= 90 ? "text-[oklch(0.5_0.123_160)]" : s.cumple >= 85 ? "text-foreground" : "text-[oklch(0.55_0.141_30)]"}`}>
                  {s.cumple}%
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full ${s.cumple >= 90 ? "bg-[oklch(0.6_0.141_160)]" : s.cumple >= 85 ? "bg-primary" : "bg-[oklch(0.6_0.158_30)]"}`} style={{ width: `${s.cumple}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5 tabular">
                <span>{s.ejec}h ejecutadas</span><span>Total {s.prog}h</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {detalle && <DetalleDrawer detalle={detalle} onClose={() => setDetalle(null)} />}
    </div>
  );
}

function DetalleDrawer({ detalle, onClose }: { detalle: DetalleCelda; onClose: () => void }) {
  const pct = Math.round((detalle.ejecutadas / detalle.programadas) * 100);
  const trend = pct >= 90;
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 w-full max-w-[480px] bg-background border-l border-border/70 z-50 shadow-2xl overflow-y-auto">
        <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border/60 p-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {detalle.tipo === "mes" ? "Mes" : detalle.tipo === "semana" ? "Semana" : "Sede"}
            </div>
            <h2 className="font-display text-xl mt-0.5">{detalle.titulo}</h2>
            {detalle.subtitulo && <p className="text-xs text-muted-foreground mt-0.5">{detalle.subtitulo}</p>}
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
        </header>

        <div className="p-4 space-y-5">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Programadas" value={detalle.programadas} />
            <Stat label="Ejecutadas" value={detalle.ejecutadas} color="text-[oklch(0.45_0.132_160)]" />
            <Stat label="Reprogramadas" value={detalle.reprog} />
            <Stat label="No ejecutadas" value={detalle.noEjec} color="text-[oklch(0.5_0.141_30)]" />
          </div>

          <div className="rounded-xl border border-border/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Cumplimiento</span>
              <span className={`flex items-center gap-1 text-xs ${trend ? "text-[oklch(0.5_0.123_160)]":"text-[oklch(0.55_0.141_30)]"}`}>
                {trend ? <TrendingUp className="h-3 w-3"/> : <TrendingDown className="h-3 w-3"/>}
                {trend ? "Sobre meta" : "Bajo meta (90%)"}
              </span>
            </div>
            <div className="font-display text-4xl tabular">{pct}%</div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full ${pct >= 90 ? "bg-[oklch(0.6_0.141_160)]" : pct >= 85 ? "bg-primary" : "bg-[oklch(0.6_0.158_30)]"}`} style={{ width: `${pct}%` }} />
            </div>
          </div>

          {detalle.desglose && (
            <section>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {detalle.tipo === "sede" ? "Por área terapéutica" : "Por sede"}
              </h3>
              <div className="rounded-xl border border-border/70 divide-y divide-border/40">
                {detalle.desglose.map((d) => {
                  const p = Math.round((d.ejec / d.prog) * 100);
                  return (
                    <div key={d.label} className="p-3">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">{d.label}</span>
                        <span className="tabular text-muted-foreground">{d.ejec}/{d.prog} · <span className={p>=90?"text-[oklch(0.5_0.123_160)]":""}>{p}%</span></span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full ${p >= 90 ? "bg-[oklch(0.6_0.141_160)]" : p >= 85 ? "bg-primary" : "bg-[oklch(0.6_0.158_30)]"}`} style={{ width: `${p}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {detalle.motivos && (
            <section>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Motivos de no ejecución</h3>
              <div className="rounded-xl border border-border/70 divide-y divide-border/40">
                {detalle.motivos.map((m) => (
                  <div key={m.motivo} className="flex justify-between items-center p-3 text-sm">
                    <span>{m.motivo}</span>
                    <span className="tabular text-muted-foreground">{m.cantidad}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-xl border border-border/70 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display text-2xl tabular mt-0.5 ${color ?? ""}`}>{value.toLocaleString()}</div>
    </div>
  );
}

function KPI({ label, value, hint, icon, accent, warn }: { label: string; value: string|number; hint?: string; icon?: React.ReactNode; accent?: boolean; warn?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${warn ? "border-[oklch(0.88_0.088_30)] bg-[oklch(0.98_0.014_265)]" : "border-border/70 bg-card"}`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">{icon}<span>{label}</span></div>
      <div className={`font-display text-3xl mt-1 tabular ${accent ? "text-primary":""}`}>{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}
