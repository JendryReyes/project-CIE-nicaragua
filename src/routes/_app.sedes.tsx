import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  ChevronDown,
  Star,
  X,
  Eye,
  Pencil,
  LayoutGrid,
} from "lucide-react";
import { sedesInfo, type SedeInfo, type EstadoSede } from "@/lib/sedes-admin-data";
import { cupos, ocupacion, estadoCupo, type Cupo } from "@/lib/cupos-data";

export const Route = createFileRoute("/_app/sedes")({
  head: () => ({
    meta: [
      { title: "Sedes Clínicas · Evolua" },
      { name: "description", content: "Gestión de sedes clínicas: contacto, estado operativo y capacidad por disciplina." },
      { property: "og:title", content: "Sedes Clínicas · Evolua" },
      { property: "og:description", content: "Gestión de sedes clínicas: contacto, estado operativo y capacidad por disciplina." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SedesClinicas,
});

type Dialogo =
  | { tipo: "nueva" }
  | { tipo: "editar"; sede: SedeInfo }
  | { tipo: "detalle"; sede: SedeInfo }
  | null;

function SedesClinicas() {
  const [lista, setLista] = useState<SedeInfo[]>(sedesInfo);
  const [busqueda, setBusqueda] = useState("");
  const [expandida, setExpandida] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [dialogo, setDialogo] = useState<Dialogo>(null);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((s) =>
      [s.nombre, s.codigo, s.ciudad, s.direccion, s.telefono, s.correo]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [lista, busqueda]);

  const capacidadDe = (nombre: string) => {
    const cs = cupos.filter((c) => c.sede === nombre);
    const cap = cs.reduce((a, c) => a + c.capacidad, 0);
    const occ = cs.reduce((a, c) => a + c.ocupados + c.reservados, 0);
    return { cs, cap, occ, pct: cap ? Math.round((occ / cap) * 100) : 0 };
  };

  const toggleEstado = (codigo: string) =>
    setLista((ls) =>
      ls.map((s) =>
        s.codigo === codigo
          ? { ...s, estado: (s.estado === "activa" ? "pausada" : "activa") as EstadoSede }
          : s,
      ),
    );

  const guardarSede = (sede: SedeInfo, original?: SedeInfo) =>
    setLista((ls) =>
      original ? ls.map((s) => (s.codigo === original.codigo ? sede : s)) : [...ls, sede],
    );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Encabezado */}
        <div className="px-6 pt-6 pb-5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Gestión de Sedes Clínicas</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Administra y supervisa todas las ubicaciones de tu red.
            </p>
          </div>
          <button
            onClick={() => setDialogo({ tipo: "nueva" })}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity active:scale-95"
          >
            <Plus className="h-4 w-4" /> Nueva Sede
          </button>
        </div>

        {/* Toolbar: solo búsqueda */}
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xl group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, código, dirección, teléfono o correo…"
              className="block w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:block shrink-0">
            {visibles.length} sedes registradas
          </span>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40">
                <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sede / Info</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Capacidad</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {visibles.map((s) => {
                const { cs, cap, occ, pct } = capacidadDe(s.nombre);
                const abierta = expandida === s.codigo;
                const tonoBarra =
                  pct >= 100 ? "bg-[oklch(0.65_0.132_45)]" : pct >= 90 ? "bg-[oklch(0.7_0.114_80)]" : "bg-primary";
                return (
                  <FilaSede
                    key={s.codigo}
                    s={s}
                    cap={cap}
                    occ={occ}
                    pct={pct}
                    tonoBarra={tonoBarra}
                    abierta={abierta}
                    menuAbierto={menu === s.codigo}
                    disciplinas={cs}
                    onToggle={() => setExpandida(abierta ? null : s.codigo)}
                    onMenu={() => setMenu(menu === s.codigo ? null : s.codigo)}
                    onAccion={(a) => {
                      setMenu(null);
                      if (a === "detalle") setDialogo({ tipo: "detalle", sede: s });
                      if (a === "editar") setDialogo({ tipo: "editar", sede: s });
                      if (a === "capacidad") setExpandida(s.codigo);
                    }}
                    onEstado={() => toggleEstado(s.codigo)}
                  />
                );
              })}
              {visibles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    Ninguna sede coincide con “{busqueda}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pie */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border/60 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <div>
            Mostrando {visibles.length} de {lista.length} sedes
          </div>
        </div>
      </div>

      {dialogo && dialogo.tipo !== "detalle" && (
        <FormularioSede
          sede={dialogo.tipo === "editar" ? dialogo.sede : undefined}
          onCerrar={() => setDialogo(null)}
          onGuardar={(s) => {
            guardarSede(s, dialogo.tipo === "editar" ? dialogo.sede : undefined);
            setDialogo(null);
          }}
        />
      )}
      {dialogo && dialogo.tipo === "detalle" && (
        <DetalleSede sede={dialogo.sede} onCerrar={() => setDialogo(null)} />
      )}
    </div>
  );
}

function FilaSede(props: {
  s: SedeInfo;
  cap: number;
  occ: number;
  pct: number;
  tonoBarra: string;
  abierta: boolean;
  menuAbierto: boolean;
  disciplinas: Cupo[];
  onToggle: () => void;
  onMenu: () => void;
  onAccion: (a: "detalle" | "editar" | "capacidad") => void;
  onEstado: () => void;
}) {
  const { s, cap, occ, pct, tonoBarra, abierta, menuAbierto, disciplinas } = props;
  return (
    <>
      <tr className="hover:bg-muted/40 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-semibold text-primary">
              {s.sigla}
            </span>
            <div className="flex flex-col">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                {s.nombre}
                {s.matriz && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary">
                    <Star className="h-2.5 w-2.5 fill-current" /> Matriz
                  </span>
                )}
              </span>
              <span className="text-xs text-muted-foreground font-mono">{s.codigo}</span>
              <span className="text-xs text-muted-foreground">{s.direccion} · {s.ciudad}</span>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col text-xs space-y-0.5">
            <span className="text-foreground font-medium">{s.telefono}</span>
            <span className="text-muted-foreground">{s.correo}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <button onClick={props.onToggle} className="flex items-center gap-2 group" title="Ver capacidad por disciplina">
            <div className="w-14 bg-muted rounded-full h-1.5">
              <div className={`${tonoBarra} h-1.5 rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <span className="text-xs font-medium text-muted-foreground tabular">
              {occ}/{cap}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${abierta ? "rotate-180" : ""}`} />
          </button>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={props.onEstado}
              role="switch"
              aria-checked={s.estado === "activa"}
              aria-label={`Cambiar estado de ${s.nombre}`}
              className={`relative h-5 w-9 rounded-full transition-colors ${s.estado === "activa" ? "bg-[oklch(0.63_0.078_160)]" : "bg-muted-foreground/30"}`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-card shadow transition-all ${s.estado === "activa" ? "left-[18px]" : "left-0.5"}`}
              />
            </button>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-tight border ${
                s.estado === "activa"
                  ? "bg-[oklch(0.94_0.053_160)] text-[oklch(0.4_0.106_160)] border-[oklch(0.85_0.06_160)]"
                  : "bg-[oklch(0.94_0.062_80)] text-[oklch(0.45_0.114_80)] border-[oklch(0.86_0.07_80)]"
              }`}
            >
              {s.estado === "activa" ? "Activa" : "En pausa"}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-right relative">
          <button
            onClick={props.onMenu}
            aria-label={`Acciones de ${s.nombre}`}
            className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-md hover:bg-muted"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {menuAbierto && (
            <div className="absolute right-6 top-full z-30 -mt-1 w-48 rounded-lg border border-border bg-popover p-1 shadow-lg text-left">
              <MenuItem icon={<Eye className="h-3.5 w-3.5" />} label="Ver detalles" onClick={() => props.onAccion("detalle")} />
              <MenuItem icon={<Pencil className="h-3.5 w-3.5" />} label="Editar sede" onClick={() => props.onAccion("editar")} />
              <MenuItem icon={<LayoutGrid className="h-3.5 w-3.5" />} label="Gestionar capacidad" onClick={() => props.onAccion("capacidad")} />
            </div>
          )}
        </td>
      </tr>
      {abierta && (
        <tr className="bg-muted/25">
          <td colSpan={5} className="px-6 py-4 border-t border-border/50">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Capacidad por disciplina
            </div>
            {disciplinas.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin disciplinas configuradas en esta sede.</p>
            ) : (
              <div className="divide-y divide-border/40 rounded-lg border border-border/60 bg-card overflow-hidden">
                {disciplinas.map((c) => {
                  const est = estadoCupo(c);
                  const dot =
                    est.tone === "ok"
                      ? "bg-[oklch(0.63_0.078_160)]"
                      : est.tone === "ambar"
                        ? "bg-[oklch(0.7_0.114_80)]"
                        : "bg-[oklch(0.65_0.132_45)]";
                  return (
                    <div key={c.disciplina} className="grid grid-cols-[1fr_110px_110px_110px_130px] items-center gap-4 px-4 py-2.5 text-sm">
                      <span className="font-medium text-foreground">{c.disciplina}</span>
                      <span className="text-xs text-muted-foreground tabular">
                        Cupos <span className="font-semibold text-foreground">{c.ocupados + c.reservados}/{c.capacidad}</span>
                      </span>
                      <span className="text-xs text-muted-foreground tabular">
                        Espera <span className="font-semibold text-foreground">{c.listaEspera}</span>
                      </span>
                      <span className="text-xs text-muted-foreground tabular">
                        {c.horasSemanaProgramadas}/{c.horasSemanaCapacidad} h/sem
                      </span>
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className={`h-2 w-2 rounded-full ${dot}`} />
                        <span className="text-muted-foreground">{est.label} · {ocupacion(c)}%</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-muted">
      {icon} {label}
    </button>
  );
}

function DetalleSede({ sede, onCerrar }: { sede: SedeInfo; onCerrar: () => void }) {
  const campos: Array<[string, string]> = [
    ["Código", sede.codigo],
    ["Ciudad", sede.ciudad],
    ["Dirección", sede.direccion],
    ["Teléfono", sede.telefono],
    ["Correo", sede.correo],
    ["Tipo", sede.matriz ? "Sede matriz" : "Sede regular"],
    ["Estado", sede.estado === "activa" ? "Activa" : "En pausa"],
  ];
  return (
    <Modal titulo={`Detalle de ${sede.nombre}`} onCerrar={onCerrar}>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
        {campos.map(([k, v]) => (
          <div key={k}>
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</dt>
            <dd className="text-sm text-foreground mt-0.5">{v}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}

function FormularioSede({
  sede,
  onCerrar,
  onGuardar,
}: {
  sede?: SedeInfo;
  onCerrar: () => void;
  onGuardar: (s: SedeInfo) => void;
}) {
  const [f, setF] = useState<SedeInfo>(
    sede ?? {
      nombre: "",
      codigo: "",
      sigla: "",
      ciudad: "",
      direccion: "",
      telefono: "",
      correo: "",
      matriz: false,
      estado: "activa",
    },
  );
  const set = (k: keyof SedeInfo, v: string) =>
    setF((p) => ({
      ...p,
      [k]: v,
      ...(k === "nombre" && !sede
        ? { sigla: v.split(" ").map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase() }
        : {}),
    }));

  const valido = f.nombre.trim() && f.codigo.trim();
  return (
    <Modal titulo={sede ? `Editar ${sede.nombre}` : "Nueva sede"} onCerrar={onCerrar}>
      <div className="grid grid-cols-2 gap-4">
        <Campo label="Nombre" value={f.nombre} onChange={(v) => set("nombre", v)} autoFocus />
        <Campo label="Código" value={f.codigo} onChange={(v) => set("codigo", v)} placeholder="XX-000" />
        <Campo label="Ciudad" value={f.ciudad} onChange={(v) => set("ciudad", v)} />
        <Campo label="Teléfono" value={f.telefono} onChange={(v) => set("telefono", v)} />
        <div className="col-span-2">
          <Campo label="Dirección" value={f.direccion} onChange={(v) => set("direccion", v)} />
        </div>
        <div className="col-span-2">
          <Campo label="Correo" value={f.correo} onChange={(v) => set("correo", v)} type="email" />
        </div>
        <label className="col-span-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={f.matriz}
            onChange={(e) => setF((p) => ({ ...p, matriz: e.target.checked }))}
            className="h-4 w-4 rounded border-border accent-[oklch(0.55_0.18_260)]"
          />
          Es sede matriz
        </label>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onCerrar} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">
          Cancelar
        </button>
        <button
          disabled={!valido}
          onClick={() => onGuardar(f)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40"
        >
          {sede ? "Guardar cambios" : "Crear sede"}
        </button>
      </div>
    </Modal>
  );
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
    </label>
  );
}

function Modal({ titulo, children, onCerrar }: { titulo: string; children: React.ReactNode; onCerrar: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" onClick={onCerrar}>
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">{titulo}</h2>
          <button onClick={onCerrar} aria-label="Cerrar" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
