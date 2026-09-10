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
  ArrowRight,
} from "lucide-react";
import { sedesInfo, type SedeInfo, type EstadoSede } from "@/lib/sedes-admin-data";
import { cupos, disciplinas, type Cupo, type Disciplina } from "@/lib/cupos-data";

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
  const [registros, setRegistros] = useState<Cupo[]>(cupos);
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
    const cs = registros.filter((c) => c.sede === nombre);
    const cap = cs.reduce((a, c) => a + c.capacidad, 0);
    const occ = cs.reduce((a, c) => a + c.ocupados + c.reservados, 0);
    return { cs, cap, occ, pct: cap ? Math.round((occ / cap) * 100) : 0 };
  };

  const cambiarCupo = (sede: string, disciplina: Disciplina, valor: number) =>
    setRegistros((rs) => {
      const existe = rs.some((r) => r.sede === sede && r.disciplina === disciplina);
      if (!existe) {
        return [
          ...rs,
          {
            sede,
            disciplina,
            capacidad: valor,
            ocupados: 0,
            reservados: 0,
            listaEspera: 0,
            horasSemanaCapacidad: valor * 6,
            horasSemanaProgramadas: 0,
          },
        ];
      }
      return rs.map((r) =>
        r.sede === sede && r.disciplina === disciplina ? { ...r, capacidad: valor } : r,
      );
    });

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
                <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saturación</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {visibles.map((s) => {
                const { cs, cap, occ, pct } = capacidadDe(s.nombre);
                const abierta = expandida === s.codigo;
                const tonoBarra =
                  pct >= 85 ? "bg-[oklch(0.65_0.132_45)]" : pct >= 70 ? "bg-[oklch(0.7_0.114_80)]" : "bg-[oklch(0.63_0.078_160)]";
                const tonoChip =
                  pct >= 85
                    ? "bg-[oklch(0.96_0.03_45)] text-[oklch(0.5_0.13_45)]"
                    : pct >= 70
                      ? "bg-[oklch(0.96_0.04_80)] text-[oklch(0.5_0.11_80)]"
                      : "bg-[oklch(0.95_0.04_160)] text-[oklch(0.44_0.09_160)]";
                return (
                  <FilaSede
                    key={s.codigo}
                    s={s}
                    cap={cap}
                    occ={occ}
                    pct={pct}
                    tonoBarra={tonoBarra}
                    tonoChip={tonoChip}
                    abierta={abierta}
                    menuAbierto={menu === s.codigo}
                    registros={cs}
                    disciplinasCatalogo={disciplinas}
                    onCupo={(d, v) => cambiarCupo(s.nombre, d, v)}
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
  tonoChip: string;
  abierta: boolean;
  menuAbierto: boolean;
  registros: Cupo[];
  disciplinasCatalogo: Disciplina[];
  onToggle: () => void;
  onMenu: () => void;
  onAccion: (a: "detalle" | "editar" | "capacidad") => void;
  onEstado: () => void;
  onCupo: (d: Disciplina, valor: number) => void;
}) {
  const { s, cap, occ, pct, tonoBarra, tonoChip, abierta, menuAbierto, registros, disciplinasCatalogo } = props;
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
          <button
            onClick={props.onToggle}
            className="flex items-center gap-2"
            title="Ver capacidad por disciplina"
            aria-expanded={abierta}
          >
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tonoChip}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${tonoBarra}`} />
              {pct}%
            </span>
            <span className="text-xs text-muted-foreground tabular">{occ}/{cap}</span>
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
          <td colSpan={5} className="px-6 py-5 border-t border-border/50">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {disciplinasCatalogo.map((d) => {
                const c = registros.find((r) => r.disciplina === d);
                const usados = c ? c.ocupados + c.reservados : 0;
                const pctD = c && c.capacidad ? Math.round((usados / c.capacidad) * 100) : 0;
                const sinDatos = !c || (c.ocupados === 0 && c.reservados === 0);
                const tono =
                  pctD >= 85
                    ? { txt: "text-[oklch(0.58_0.132_45)]", bar: "bg-[oklch(0.65_0.132_45)]", chip: "bg-[oklch(0.96_0.03_45)] text-[oklch(0.5_0.13_45)]", label: "Crítico" }
                    : pctD >= 70
                      ? { txt: "text-[oklch(0.6_0.114_80)]", bar: "bg-[oklch(0.7_0.114_80)]", chip: "bg-[oklch(0.96_0.04_80)] text-[oklch(0.5_0.11_80)]", label: "Alerta" }
                      : { txt: "text-[oklch(0.55_0.078_160)]", bar: "bg-[oklch(0.63_0.078_160)]", chip: "bg-[oklch(0.95_0.04_160)] text-[oklch(0.44_0.09_160)]", label: "Óptimo" };
                return (
                  <div
                    key={d}
                    className={`rounded-xl border border-border/70 bg-card p-4 ${sinDatos ? "opacity-70" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {d}
                      </span>
                      <label className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-muted-foreground">Cupo Máx.</span>
                        <input
                          type="number"
                          min={0}
                          value={c?.capacidad ?? 0}
                          onChange={(e) => props.onCupo(d, Math.max(0, Number(e.target.value) || 0))}
                          aria-label={`Cupo máximo de ${d} en ${s.nombre}`}
                          className="w-16 rounded-md border border-border bg-background px-2 py-1 text-sm font-semibold text-foreground text-center tabular focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </label>
                    </div>
                    {sinDatos ? (
                      <>
                        <div className="mt-4 h-1.5 rounded-full bg-muted" />
                        <p className="mt-2 text-xs text-muted-foreground">Sin datos registrados</p>
                      </>
                    ) : (
                      <>
                        <div className="mt-3 flex items-end justify-between gap-3">
                          <span className={`text-lg font-semibold tabular ${tono.txt}`}>
                            {usados} / {c!.capacidad}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tono.chip}`}>
                            {pctD}% {tono.label}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-1.5 rounded-full ${tono.bar}`} style={{ width: `${Math.min(pctD, 100)}%` }} />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground tabular">
                          <span>Lista de espera: {c!.listaEspera}</span>
                          <span>{c!.horasSemanaProgramadas}/{c!.horasSemanaCapacidad} h/sem</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => props.onAccion("detalle")}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
              >
                Gestionar capacidad detallada <ArrowRight className="h-4 w-4" />
              </button>
            </div>
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
      horaApertura: "08:00",
      horaCierre: "17:00",
      umbralAlerta: 85,
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

  const umbral = f.umbralAlerta ?? 85;
  const valido = f.nombre.trim() && f.codigo.trim();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div className="mx-auto max-w-3xl px-6 pb-40 pt-10 md:px-10">
        {/* Breadcrumb + cerrar */}
        <div className="mb-14 flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Configuración <span className="mx-1.5 text-border">·</span> Sedes clínicas
          </p>
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Eyebrow + titular editable */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
          {sede ? "Editar sede" : "Nueva sede"}
        </p>
        <input
          value={f.nombre}
          autoFocus={!sede}
          onChange={(e) => set("nombre", e.target.value)}
          placeholder="Nombre de la sede"
          aria-label="Nombre de la sede"
          className="mt-3 w-full border-b border-border bg-transparent pb-3 font-display text-4xl text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary md:text-5xl"
        />
        <p className="mt-3 text-sm text-muted-foreground">
          Datos generales, horario de atención y umbral de alerta de capacidad.
        </p>

        {/* 01 · Identidad */}
        <Seccion numero="01" titulo="Identidad">
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            <Campo label="Código" value={f.codigo} onChange={(v) => set("codigo", v)} placeholder="XX-000" mono />
            <Campo label="Ciudad" value={f.ciudad} onChange={(v) => set("ciudad", v)} placeholder="Managua" />
            <div className="sm:col-span-2">
              <Campo label="Dirección física" value={f.direccion} onChange={(v) => set("direccion", v)} placeholder="Dirección exacta de la clínica" />
            </div>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground sm:col-span-2">
              <input
                type="checkbox"
                checked={f.matriz}
                onChange={(e) => setF((p) => ({ ...p, matriz: e.target.checked }))}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              Marcar como sede matriz
            </label>
          </div>
        </Seccion>

        {/* 02 · Contacto */}
        <Seccion numero="02" titulo="Contacto">
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            <Campo label="Teléfono de recepción" value={f.telefono} onChange={(v) => set("telefono", v)} placeholder="+505 0000 0000" />
            <Campo label="Correo institucional" value={f.correo} onChange={(v) => set("correo", v)} type="email" placeholder="sede@evolua.app" />
          </div>
        </Seccion>

        {/* 03 · Operación */}
        <Seccion numero="03" titulo="Operación">
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            <Campo label="Hora de apertura" value={f.horaApertura ?? ""} onChange={(v) => set("horaApertura", v)} type="time" />
            <Campo label="Hora de cierre" value={f.horaCierre ?? ""} onChange={(v) => set("horaCierre", v)} type="time" />
          </div>

          <div className="mt-12">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Umbral de alerta de capacidad
              </span>
              <span
                className={`tabular font-display text-3xl ${
                  umbral >= 95 ? "text-destructive" : umbral >= 85 ? "text-warning" : "text-success"
                }`}
              >
                {umbral}%
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              value={umbral}
              aria-label="Umbral de alerta de capacidad"
              onChange={(e) => setF((p) => ({ ...p, umbralAlerta: Number(e.target.value) }))}
              className="mt-4 h-1 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Dispara alertas cuando la ocupación de la sede supere este porcentaje.
            </p>
          </div>
        </Seccion>

        {/* Barra flotante de acciones */}
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-10 flex justify-center px-6">
          <div className="pointer-events-auto flex items-center gap-5 rounded-full border border-border bg-card px-6 py-3 shadow-suave">
            <button
              onClick={onCerrar}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Descartar
            </button>
            <span className="h-4 w-px bg-border" />
            <button
              disabled={!valido}
              onClick={() => onGuardar(f)}
              className="rounded-full bg-gradient-suave px-6 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:opacity-40"
            >
              {sede ? "Guardar cambios" : "Crear sede"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Seccion({
  numero,
  titulo,
  children,
}: {
  numero: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 border-t border-border pt-8">
      <h2 className="mb-10 flex items-baseline gap-3 font-display text-xl text-foreground">
        <span className="text-xs font-semibold tracking-widest text-primary">{numero}</span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
  mono?: boolean;
}) {
  return (
    <label className="group block">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1.5 w-full border-b border-border bg-transparent pb-2.5 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary ${
          mono ? "font-mono uppercase tracking-wider" : ""
        }`}
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
