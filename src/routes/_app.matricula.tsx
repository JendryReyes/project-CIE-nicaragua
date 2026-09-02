import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { UserPlus, UserMinus, AlertCircle, Search, Plus, Clock, X, Phone, Mail, MapPin, MessageSquare, FileText, CheckCircle2, Circle as CircleIcon, Download, ExternalLink, Calendar, RotateCcw } from "lucide-react";
import { movimientosNinos, resumenMatricula, type MovimientoNino, type MatriculaArea } from "@/lib/modulos-data";

export const Route = createFileRoute("/_app/matricula")({
  head: () => ({ meta: [{ title: "Módulo de Matrícula · CIE" }] }),
  component: Matricula,
});

const tabs = ["Resumen general", "Activos", "Ingresos", "Egresos", "Suspensiones"] as const;
type Tab = typeof tabs[number];

const areaLabel: Record<MatriculaArea, string> = { conducta: "Conducta / ABA", logopedia: "Logopedia", fisio: "Fisioterapia", ocupacional: "T. Ocupacional" };
const areaColor: Record<MatriculaArea, string> = {
  conducta: "bg-[oklch(0.93_0.053_160)] text-[oklch(0.35_0.097_160)]",
  logopedia: "bg-[oklch(0.93_0.044_258)] text-[oklch(0.4_0.106_258)]",
  fisio: "bg-[oklch(0.95_0.062_80)] text-[oklch(0.45_0.114_80)]",
  ocupacional: "bg-[oklch(0.93_0.053_292)] text-[oklch(0.4_0.106_292)]",
};

const fmt = (f: string) => new Date(f).toLocaleDateString("es-NI", { day: "numeric", month: "short", year: "numeric" });

function Matricula() {
  const [tab, setTab] = useState<Tab>("Resumen general");
  const [selected, setSelected] = useState<MovimientoNino | null>(null);
  const [q, setQ] = useState("");
  const [sede, setSede] = useState<string>("todas");
  const r = resumenMatricula;

  const ingresos = movimientosNinos.filter((m) => m.tipo === "ingreso");
  const egresos = movimientosNinos.filter((m) => m.tipo === "egreso");
  const suspensiones = movimientosNinos.filter((m) => m.tipo === "suspension");

  const filtered = (list: MovimientoNino[]) =>
    list
      .filter((m) => sede === "todas" || m.sede === sede)
      .filter((m) => !q || m.nino.toLowerCase().includes(q.toLowerCase()) || m.expediente.toLowerCase().includes(q.toLowerCase()) || m.tutor.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Módulo de Matrícula</h1>
          <p className="text-sm text-muted-foreground mt-1">Ingresos · Egresos · Suspensiones · Mayo 2026</p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-[oklch(0.63_0.096_160)] text-primary-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Nuevo ingreso
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border/60 -mb-2 flex-wrap">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-sm border-b-2 -mb-px ${tab === t ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t}
            {t === "Suspensiones" && r.suspendidos > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[oklch(0.6_0.158_45)] text-primary-foreground text-[10px] px-1">{r.suspendidos}</span>
            )}
          </button>
        ))}
      </div>

      {/* KPIs siempre visibles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button onClick={() => setTab("Activos")} className="text-left">
          <KPI icon={<UserPlus className="h-4 w-4 text-[oklch(0.63_0.096_160)]" />} label="Activos" value={r.activos} hint={`+${r.ingresosMes} este mes · ver lista →`} clickable />
        </button>
        <button onClick={() => setTab("Ingresos")} className="text-left">
          <KPI icon={<UserPlus className="h-4 w-4" />} label="Ingresos · mes" value={r.ingresosMes} hint="alta clínica" clickable />
        </button>
        <button onClick={() => setTab("Egresos")} className="text-left">
          <KPI icon={<UserMinus className="h-4 w-4" />} label="Egresos · mes" value={r.egresosMes} hint="mudanza familiar" clickable />
        </button>
        <button onClick={() => setTab("Suspensiones")} className="text-left">
          <KPI icon={<AlertCircle className="h-4 w-4 text-[oklch(0.6_0.158_45)]" />} label="Suspensiones" value={r.suspendidos} hint="revisar conducta" warn clickable />
        </button>
      </div>

      {tab === "Resumen general" && <ResumenGeneral onOpen={setSelected} />}
      {tab === "Activos" && (
        <ListaActivos
          onOpen={setSelected}
          q={q} setQ={setQ} sede={sede} setSede={setSede}
        />
      )}
      {tab === "Ingresos" && (
        <TablaMovimientos titulo="Ingresos del mes" rows={filtered(ingresos)} onOpen={setSelected} q={q} setQ={setQ} sede={sede} setSede={setSede} variante="ingreso" />
      )}
      {tab === "Egresos" && (
        <TablaMovimientos titulo="Egresos del mes" rows={filtered(egresos)} onOpen={setSelected} q={q} setQ={setQ} sede={sede} setSede={setSede} variante="egreso" />
      )}
      {tab === "Suspensiones" && (
        <Suspensiones rows={filtered(suspensiones)} onOpen={setSelected} q={q} setQ={setQ} sede={sede} setSede={setSede} />
      )}

      {selected && <DetalleDrawer m={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ResumenGeneral({ onOpen }: { onOpen: (m: MovimientoNino) => void }) {
  const r = resumenMatricula;
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/70 bg-card p-5 lg:col-span-2">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-display text-base">Movimiento de niños</h3>
            <span className="text-xs text-muted-foreground">últimas 7 semanas · todas las sedes</span>
          </div>
          <MiniBars />
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-display text-base inline-flex items-center gap-2"><Clock className="h-4 w-4" /> Horas del mes</h3>
            <span className="text-xs text-muted-foreground">planificadas vs INSS</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Horas planificadas</span>
                <span className="tabular font-medium">{r.horasProgramadas}h</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "100%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Acreditadas por INSS</span>
                <span className="tabular font-medium text-[oklch(0.45_0.114_160)]">{Math.round(r.horasProgramadas * (r.cobertura / 100))}h</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-[oklch(0.6_0.106_160)]" style={{ width: `${r.cobertura}%` }} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 tabular">{r.cobertura}% cobertura · {r.horasSubrogadas}h subrogadas</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
            Checklist del Manual: 1ª evaluación · entrevista a padres · consentimiento · colilla INSS · diagnóstico · contrato.
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between gap-3">
          <h3 className="font-display text-base">Movimientos recientes</h3>
          <span className="text-xs text-muted-foreground">Clic en una tarjeta para ver detalle</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
          {movimientosNinos.slice(0, 6).map((m, i) => (
            <button key={i} onClick={() => onOpen(m)} className="rounded-xl border border-border/70 p-3 text-left hover:border-primary/60 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-muted grid place-items-center text-xs font-medium">{m.iniciales}</div>
                  <div>
                    <div className="font-medium text-sm">{m.nino}</div>
                    <div className="text-[11px] text-muted-foreground">{m.expediente} · {m.sede}</div>
                  </div>
                </div>
                <Pill tipo={m.tipo} />
              </div>
              <div className="text-[11px] text-muted-foreground mt-2 tabular">{fmt(m.fecha)} · {m.tutor}</div>
              <p className="text-xs mt-1 line-clamp-2">{m.motivo}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Toolbar({ q, setQ, sede, setSede, onExport }: { q: string; setQ: (s: string) => void; sede: string; setSede: (s: string) => void; onExport?: () => void }) {
  return (
    <div className="p-4 border-b border-border/60 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 flex-1 min-w-[240px]">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar niño, expediente o tutor…" className="w-full rounded-md border border-border bg-background pl-7 pr-2 py-1.5 text-xs" />
        </div>
        <select value={sede} onChange={(e) => setSede(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 text-xs">
          <option value="todas">Todas las sedes</option>
          <option value="Managua">Managua</option>
          <option value="León">León</option>
          <option value="Granada">Granada</option>
        </select>
      </div>
      <button onClick={onExport} className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-muted">
        <Download className="h-3 w-3" /> Exportar CSV
      </button>
    </div>
  );
}

function TablaMovimientos({ titulo, rows, onOpen, q, setQ, sede, setSede, variante }: { titulo: string; rows: MovimientoNino[]; onOpen: (m: MovimientoNino) => void; q: string; setQ: (s: string) => void; sede: string; setSede: (s: string) => void; variante: "ingreso" | "egreso" }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      <div className="p-4 border-b border-border/60">
        <h3 className="font-display text-base">{titulo}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{rows.length} {rows.length === 1 ? "registro" : "registros"}</p>
      </div>
      <Toolbar q={q} setQ={setQ} sede={sede} setSede={setSede} />
      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Sin resultados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Niño</th>
                <th className="text-left px-4 py-2 font-medium">Edad</th>
                <th className="text-left px-4 py-2 font-medium">Sede</th>
                <th className="text-left px-4 py-2 font-medium">Tutor</th>
                <th className="text-left px-4 py-2 font-medium">Teléfono</th>
                <th className="text-left px-4 py-2 font-medium">Áreas</th>
                <th className="text-left px-4 py-2 font-medium">Fecha {variante === "ingreso" ? "ingreso" : "egreso"}</th>
                <th className="text-left px-4 py-2 font-medium">{variante === "ingreso" ? "Cobertura" : "Destino"}</th>
                <th className="text-left px-4 py-2 font-medium">{variante === "ingreso" ? "Docs." : "Informe"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.expediente} onClick={() => onOpen(m)} className="border-t border-border/40 cursor-pointer hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-muted grid place-items-center text-[11px] font-medium">{m.iniciales}</div>
                      <div>
                        <div className="font-medium">{m.nino}</div>
                        <div className="text-[11px] text-muted-foreground">{m.expediente}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular">{m.edad} años</td>
                  <td className="px-4 py-3">{m.sede}</td>
                  <td className="px-4 py-3">{m.tutor} <span className="text-[11px] text-muted-foreground">· {m.parentesco}</span></td>
                  <td className="px-4 py-3 tabular text-xs">{m.telefono}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {m.areas.map((a) => <span key={a} className={`text-[10px] px-1.5 py-0.5 rounded ${areaColor[a]}`}>{areaLabel[a]}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular text-xs">{fmt(m.fecha)}</td>
                  <td className="px-4 py-3 text-xs">
                    {variante === "ingreso" ? (
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${m.cobertura === "INSS" ? "bg-[oklch(0.93_0.044_258)] text-[oklch(0.4_0.106_258)]" : "bg-muted text-muted-foreground"}`}>{m.cobertura}</span>
                    ) : (
                      m.destino ?? "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {variante === "ingreso" ? (
                      m.documentosFaltantes.length === 0
                        ? <span className="inline-flex items-center gap-1 text-[oklch(0.45_0.114_160)]"><CheckCircle2 className="h-3.5 w-3.5" /> Completos</span>
                        : <span className="inline-flex items-center gap-1 text-[oklch(0.55_0.114_80)]"><AlertCircle className="h-3.5 w-3.5" /> Faltan {m.documentosFaltantes.length}</span>
                    ) : (
                      m.informeEgreso ? <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {m.informeEgreso}</span> : "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Suspensiones({ rows, onOpen, q, setQ, sede, setSede }: { rows: MovimientoNino[]; onOpen: (m: MovimientoNino) => void; q: string; setQ: (s: string) => void; sede: string; setSede: (s: string) => void }) {
  return (
    <div className="rounded-2xl border border-[oklch(0.88_0.088_45)] bg-[oklch(0.98_0.014_265)]/60 overflow-hidden">
      <div className="p-4 border-b border-[oklch(0.88_0.088_45)]/60">
        <h3 className="font-display text-base inline-flex items-center gap-2"><AlertCircle className="h-4 w-4 text-[oklch(0.6_0.158_45)]" /> Suspensiones activas</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{rows.length} expediente{rows.length === 1 ? "" : "s"} con seguimiento pendiente.</p>
      </div>
      <Toolbar q={q} setQ={setQ} sede={sede} setSede={setSede} />
      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Sin suspensiones.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
          {rows.map((m) => (
            <article key={m.expediente} className="rounded-xl border border-[oklch(0.88_0.088_45)] bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-full bg-muted grid place-items-center text-xs font-medium">{m.iniciales}</div>
                  <div>
                    <div className="font-medium">{m.nino}</div>
                    <div className="text-[11px] text-muted-foreground">{m.expediente} · {m.sede}</div>
                  </div>
                </div>
                <Pill tipo="suspension" />
              </div>
              <p className="text-sm mt-3">{m.motivoSuspension ?? m.motivo}</p>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border/40 text-xs">
                <div><div className="text-muted-foreground">Suspendido desde</div><div className="tabular mt-0.5">{fmt(m.fecha)}</div></div>
                <div><div className="text-muted-foreground">Reinicio estimado</div><div className="tabular mt-0.5">{m.fechaReinicio ? fmt(m.fechaReinicio) : "—"}</div></div>
                <div className="col-span-2"><div className="text-muted-foreground">Responsable</div><div className="mt-0.5">{m.responsable ?? "—"}</div></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => onOpen(m)} className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">Ver detalle</button>
                <button className="flex-1 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs inline-flex items-center justify-center gap-1.5 hover:opacity-90">
                  <RotateCcw className="h-3 w-3" /> Reactivar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ListaActivos({ onOpen, q, setQ, sede, setSede }: { onOpen: (m: MovimientoNino) => void; q: string; setQ: (s: string) => void; sede: string; setSede: (s: string) => void }) {
  // Mock: completar hasta los "27 activos" combinando los ingresos + niños mock
  const base = movimientosNinos.filter((m) => m.tipo === "ingreso" || m.tipo === "suspension");
  const extras: MovimientoNino[] = useMemo(() => {
    const nombres = ["Lucas Rivera", "Emilia Castro", "Joaquín Morales", "Renata Solís", "Diego Ramírez", "Antonella Vega", "Sebastián Torres", "Isabella Núñez", "Tomás Mejía", "Catalina Reyes", "Adrián Cordero", "Julieta Espinoza", "Ignacio Salazar", "Mía Bermúdez", "Felipe Aguilar", "Regina Ortega", "Bruno Cárdenas", "Olivia Pacheco", "Maximiliano Cruz", "Valentina Herrera", "Santiago Báez", "Constanza Lacayo"];
    const sedes = ["Managua", "León", "Granada"] as const;
    const areas: MatriculaArea[][] = [["conducta"], ["logopedia"], ["conducta", "logopedia"], ["fisio"], ["ocupacional", "conducta"], ["logopedia", "ocupacional"]];
    return nombres.slice(0, 27 - base.length).map((n, i) => {
      const ini = n.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
      return {
        nino: n, iniciales: ini, expediente: `EXP-2025-${String(100 + i).padStart(3, "0")}`,
        tipo: "ingreso", fecha: `2025-${String((i % 12) + 1).padStart(2, "0")}-15`, motivo: "Alta clínica regular",
        edad: 3 + (i % 7), fechaNacimiento: "2020-01-01", sede: sedes[i % 3],
        tutor: `Tutor de ${n.split(" ")[0]}`, parentesco: i % 2 === 0 ? "Madre" : "Padre", telefono: `+505 87${String(10 + i).padStart(2, "0")} ${String(1000 + i * 7).padStart(4, "0")}`,
        correo: `${n.split(" ")[0].toLowerCase()}@correo.com`, direccion: `${sedes[i % 3]}, sector ${i + 1}`,
        cobertura: i % 3 === 0 ? "Privado" : "INSS", areas: areas[i % areas.length], terapeutaAsignado: ["Lic. Andrea Rivas", "Lic. Sofía Hernández", "Lic. Carlos Bermúdez"][i % 3],
        documentosOk: ["Acta de nacimiento", "Diagnóstico médico"], documentosFaltantes: i % 4 === 0 ? ["Contrato firmado"] : [],
      } as MovimientoNino;
    });
  }, [base.length]);

  const all = [...base, ...extras];
  const rows = all
    .filter((m) => sede === "todas" || m.sede === sede)
    .filter((m) => !q || m.nino.toLowerCase().includes(q.toLowerCase()) || m.expediente.toLowerCase().includes(q.toLowerCase()) || m.tutor.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      <div className="p-4 border-b border-border/60">
        <h3 className="font-display text-base">Niños activos</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{rows.length} de {all.length} expedientes actualmente matriculados.</p>
      </div>
      <Toolbar q={q} setQ={setQ} sede={sede} setSede={setSede} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Niño</th>
              <th className="text-left px-4 py-2 font-medium">Edad</th>
              <th className="text-left px-4 py-2 font-medium">Sede</th>
              <th className="text-left px-4 py-2 font-medium">Tutor · contacto</th>
              <th className="text-left px-4 py-2 font-medium">Áreas</th>
              <th className="text-left px-4 py-2 font-medium">Terapeuta</th>
              <th className="text-left px-4 py-2 font-medium">Cobertura</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.expediente} onClick={() => onOpen(m)} className="border-t border-border/40 cursor-pointer hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-muted grid place-items-center text-[11px] font-medium">{m.iniciales}</div>
                    <div>
                      <div className="font-medium">{m.nino}</div>
                      <div className="text-[11px] text-muted-foreground">{m.expediente}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 tabular">{m.edad} años</td>
                <td className="px-4 py-3">{m.sede}</td>
                <td className="px-4 py-3"><div>{m.tutor}</div><div className="text-[11px] text-muted-foreground tabular">{m.telefono}</div></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {m.areas.map((a) => <span key={a} className={`text-[10px] px-1.5 py-0.5 rounded ${areaColor[a]}`}>{areaLabel[a]}</span>)}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">{m.terapeutaAsignado}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${m.cobertura === "INSS" ? "bg-[oklch(0.93_0.044_258)] text-[oklch(0.4_0.106_258)]" : "bg-muted text-muted-foreground"}`}>{m.cobertura}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DetalleDrawer({ m, onClose }: { m: MovimientoNino; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-foreground/40" />
      <aside className="w-full max-w-[520px] h-full bg-card border-l border-border overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-start justify-between gap-3 z-10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted grid place-items-center text-sm font-medium">{m.iniciales}</div>
            <div>
              <div className="text-[11px] text-muted-foreground">{m.expediente}</div>
              <h2 className="font-display text-xl">{m.nino}</h2>
              <div className="text-xs text-muted-foreground">{m.edad} años · {m.sede}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill tipo={m.tipo} />
            <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <Section title="Datos personales">
            <Row k="Fecha de nacimiento" v={fmt(m.fechaNacimiento)} />
            <Row k="Dirección" v={m.direccion} />
          </Section>

          <Section title="Familia">
            <div className="text-sm font-medium">{m.tutor} <span className="text-xs text-muted-foreground font-normal">· {m.parentesco}</span></div>
            <div className="mt-2 space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /><span className="text-foreground tabular">{m.telefono}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /><span className="text-foreground">{m.correo}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /><span className="text-foreground">{m.direccion}</span></div>
            </div>
            <button className="mt-3 w-full rounded-lg bg-accent/30 text-accent-foreground py-2 text-sm font-medium hover:bg-accent/50 inline-flex items-center justify-center gap-2">
              <MessageSquare className="h-4 w-4" /> Enviar mensaje
            </button>
          </Section>

          <Section title="Plan terapéutico">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {m.areas.map((a) => <span key={a} className={`text-[11px] px-2 py-0.5 rounded ${areaColor[a]}`}>{areaLabel[a]}</span>)}
            </div>
            <Row k="Terapeuta principal" v={m.terapeutaAsignado} />
            <Row k="Cobertura" v={m.cobertura} />
          </Section>

          <Section title="Documentación · checklist INSS">
            <ul className="space-y-1.5 text-sm">
              {m.documentosOk.map((d) => (
                <li key={d} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[oklch(0.5_0.097_160)]" /><span>{d}</span></li>
              ))}
              {m.documentosFaltantes.map((d) => (
                <li key={d} className="flex items-center gap-2"><CircleIcon className="h-4 w-4 text-[oklch(0.55_0.114_80)]" /><span className="text-[oklch(0.45_0.114_80)]">{d}</span></li>
              ))}
              {m.documentosOk.length === 0 && m.documentosFaltantes.length === 0 && (
                <li className="text-xs text-muted-foreground">Sin documentación registrada.</li>
              )}
            </ul>
          </Section>

          <Section title="Movimiento registrado">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{fmt(m.fecha)}</div>
              <div className="mt-1 font-medium capitalize">{m.tipo}</div>
              <p className="text-xs text-muted-foreground mt-1">{m.motivo}</p>
              {m.tipo === "suspension" && (
                <div className="mt-2 pt-2 border-t border-border/40 grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Reinicio: </span><span className="tabular">{m.fechaReinicio ? fmt(m.fechaReinicio) : "—"}</span></div>
                  <div><span className="text-muted-foreground">Responsable: </span>{m.responsable ?? "—"}</div>
                </div>
              )}
              {m.tipo === "egreso" && (
                <div className="mt-2 pt-2 border-t border-border/40 grid grid-cols-1 gap-1 text-xs">
                  <div><span className="text-muted-foreground">Destino: </span>{m.destino ?? "—"}</div>
                  {m.informeEgreso && <div className="inline-flex items-center gap-1"><FileText className="h-3 w-3" />{m.informeEgreso}</div>}
                </div>
              )}
            </div>
          </Section>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border p-4 flex gap-2">
          {m.ninoIdRef ? (
            <Link to="/ninos/$id" params={{ id: m.ninoIdRef }} className="flex-1 rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90 inline-flex items-center justify-center gap-2">
              <ExternalLink className="h-4 w-4" /> Abrir expediente
            </Link>
          ) : (
            <button className="flex-1 rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:opacity-90 inline-flex items-center justify-center gap-2" title="Expediente clínico no vinculado en esta demo">
              <ExternalLink className="h-4 w-4" /> Abrir expediente
            </button>
          )}
          <button className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Editar matrícula</button>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">{title}</h3>
      <div className="rounded-xl border border-border/60 bg-background/50 p-3 space-y-1.5">
        {children}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}

function KPI({ icon, label, value, hint, warn, clickable }: { icon: React.ReactNode; label: string; value: string | number; hint?: string; warn?: boolean; clickable?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 transition-colors ${warn ? "border-[oklch(0.88_0.088_45)] bg-[oklch(0.98_0.014_265)]" : "border-border/70 bg-card"} ${clickable ? "hover:border-primary/60 hover:bg-muted/30" : ""}`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">{icon}<span>{label}</span></div>
      <div className="font-display text-3xl mt-1 tabular">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

function Pill({ tipo }: { tipo: "ingreso" | "egreso" | "suspension" }) {
  const map = {
    ingreso: "bg-[oklch(0.94_0.053_160)] text-[oklch(0.35_0.114_160)]",
    egreso: "bg-muted text-muted-foreground",
    suspension: "bg-[oklch(0.95_0.07_45)] text-[oklch(0.45_0.132_45)]",
  } as const;
  const label = { ingreso: "Ingreso", egreso: "Egreso", suspension: "Suspensión" }[tipo];
  return <span className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 font-medium ${map[tipo]}`}>{label}</span>;
}

function MiniBars() {
  // ingresos / egresos / suspensiones por semana
  const data = [
    { ing: 3, egr: 1, sus: 0 },
    { ing: 5, egr: 2, sus: 1 },
    { ing: 2, egr: 1, sus: 0 },
    { ing: 6, egr: 1, sus: 1 },
    { ing: 4, egr: 3, sus: 0 },
    { ing: 7, egr: 2, sus: 2 },
    { ing: 5, egr: 1, sus: 1 },
  ];
  const max = Math.max(...data.map((d) => d.ing + d.egr + d.sus));
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-3 h-36">
        {data.map((d, i) => {
          const total = d.ing + d.egr + d.sus;
          const h = (total / max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <span className="text-[10px] tabular text-muted-foreground">{total}</span>
              <div className="w-full flex flex-col-reverse rounded-md overflow-hidden border border-border/40" style={{ height: `${h}%`, minHeight: 8 }}>
                <div style={{ flexGrow: d.ing }} className="bg-[oklch(0.66_0.084_160)]" title={`Ingresos: ${d.ing}`} />
                <div style={{ flexGrow: d.egr }} className="bg-[oklch(0.65_0.106_80)]" title={`Egresos: ${d.egr}`} />
                <div style={{ flexGrow: d.sus }} className="bg-[oklch(0.6_0.158_45)]" title={`Suspensiones: ${d.sus}`} />
              </div>
              <span className="text-[10px] text-muted-foreground tabular">S{i + 1}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-2 border-t border-border/40">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[oklch(0.66_0.084_160)]" /> Ingresos</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[oklch(0.65_0.106_80)]" /> Egresos</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[oklch(0.6_0.158_45)]" /> Suspensiones</span>
      </div>
    </div>
  );
}
