import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ninos, areaLabels, type Area } from "@/lib/demo-data";
import { AreaBadge } from "@/components/area-badge";
import { Avatar } from "@/components/avatar";
import { Search, Plus, Filter } from "lucide-react";

export const Route = createFileRoute("/_app/ninos/")({
  head: () => ({ meta: [{ title: "Niños · CIE" }] }),
  component: NinosList,
});

function NinosList() {
  const [q, setQ] = useState("");
  const [filtroArea, setFiltroArea] = useState<Area | "todas">("todas");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  const filtered = ninos.filter((n) => {
    if (q && !n.nombre.toLowerCase().includes(q.toLowerCase()) && !n.id.includes(q)) return false;
    if (filtroArea !== "todas" && !n.areas.includes(filtroArea)) return false;
    if (filtroEstado !== "todos" && n.estado !== filtroEstado) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Niños y niñas</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} de {ninos.length} expedientes</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Nuevo ingreso
        </button>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border/60">
          <div className="flex items-center gap-2 flex-1 min-w-60 rounded-lg border border-border bg-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Buscar por nombre o ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={filtroArea} onChange={setFiltroArea as any} options={[
              { v: "todas", l: "Todas las áreas" },
              ...(["diagnostico", "fisio", "logopedia", "conducta"] as Area[]).map((a) => ({ v: a, l: areaLabels[a] })),
            ]} />
            <Select value={filtroEstado} onChange={setFiltroEstado} options={[
              { v: "todos", l: "Todos los estados" },
              { v: "activo", l: "Activo" },
              { v: "evaluacion", l: "En evaluación" },
              { v: "pausa", l: "En pausa" },
            ]} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="text-left font-medium px-4 py-3">Niño/a</th>
                <th className="text-left font-medium px-4 py-3">Diagnóstico</th>
                <th className="text-left font-medium px-4 py-3">Áreas</th>
                <th className="text-left font-medium px-4 py-3">Terapeuta</th>
                <th className="text-left font-medium px-4 py-3">Progreso</th>
                <th className="text-left font-medium px-4 py-3">INSS</th>
                <th className="text-left font-medium px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((n) => (
                <tr key={n.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <Link to="/ninos/$id" params={{ id: n.id }} className="flex items-center gap-3 group">
                      <Avatar nombre={n.nombre} size={34} />
                      <div>
                        <div className="font-medium group-hover:text-primary">{n.nombre}</div>
                        <div className="text-xs text-muted-foreground tabular">#{n.id} · {n.edad} años · {n.sede}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{n.diagnostico}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {n.areas.map((a) => <AreaBadge key={a} area={a} />)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{n.terapeuta}</td>
                  <td className="px-4 py-3 w-40">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${n.progreso}%` }} />
                      </div>
                      <span className="text-xs tabular text-muted-foreground w-8">{n.progreso}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {n.inss ? <span className="text-xs text-[oklch(0.5_0.088_160)]">● Cubierto</span> : <span className="text-xs text-muted-foreground">Privado</span>}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoPill estado={n.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Select<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; l: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-ring/30"
    >
      {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

function EstadoPill({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    activo: "bg-[oklch(0.94_0.044_160)] text-[oklch(0.4_0.088_160)]",
    evaluacion: "bg-[oklch(0.94_0.044_80)] text-[oklch(0.4_0.114_80)]",
    pausa: "bg-muted text-muted-foreground",
  };
  const labels: Record<string, string> = { activo: "Activo", evaluacion: "Evaluación", pausa: "En pausa" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[estado]}`}>{labels[estado]}</span>;
}
