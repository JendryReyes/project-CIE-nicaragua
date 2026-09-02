import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ChevronDown, ChevronRight, FileText, Info, ShieldCheck } from "lucide-react";
import { sedesFact, tarifa, type AreaFact } from "@/lib/modulos-data";
import {
  generarSesionesQuincena,
  pagadorActivo,
  estadoMatricula,
  type SesionDepuracion,
} from "@/lib/facturacion-modelo";

export const Route = createFileRoute("/_app/facturacion/depuracion")({
  head: () => ({
    meta: [{ title: "Depuración pre-facturación · CIE" }],
  }),
  component: DepuracionPage,
});

type Clasif = SesionDepuracion["clasificacion"];

const colorClasif: Record<Clasif, string> = {
  INSS: "oklch(0.6 0.123 258)",
  Privada: "oklch(0.55 0.141 292)",
  "Pro-bono": "oklch(0.66 0.084 160)",
  "Fuera de Contrato": "oklch(0.6 0.158 45)",
};

function DepuracionPage() {
  const [quincena, setQuincena] = useState<"Q1" | "Q2">("Q2");
  const [mes] = useState(5);
  const [anio] = useState(2026);
  const [sedeId, setSedeId] = useState<string | "todas">("todas");
  const [disciplina, setDisciplina] = useState<AreaFact | "todas">("todas");
  const [busca, setBusca] = useState("");
  const [expandido, setExpandido] = useState<Record<string, boolean>>({});

  // Estado de sesiones (toggle facturable) en sessionStorage
  const key = `dep-${quincena}-${mes}-${anio}`;
  const [overrides, setOverrides] = useState<Record<string, { facturable: boolean; motivo?: string }>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(sessionStorage.getItem(key) ?? "{}");
    } catch {
      return {};
    }
  });
  const setOverride = (id: string, facturable: boolean, motivo?: string) => {
    setOverrides((prev) => {
      const next = { ...prev, [id]: { facturable, motivo } };
      try {
        sessionStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const sesiones = useMemo(() => {
    const base = generarSesionesQuincena(quincena, mes, anio);
    return base.map((s) => {
      const o = overrides[s.id];
      return o ? { ...s, facturable: o.facturable, motivoNoFact: o.motivo ?? s.motivoNoFact } : s;
    });
  }, [quincena, mes, anio, overrides]);

  const filtradas = useMemo(
    () =>
      sesiones.filter((s) => {
        if (sedeId !== "todas" && s.sedeId !== sedeId) return false;
        if (disciplina !== "todas" && s.area !== disciplina) return false;
        if (busca && !s.ninoNombre.toLowerCase().includes(busca.toLowerCase())) return false;
        return true;
      }),
    [sesiones, sedeId, disciplina, busca]
  );

  // Agrupar por niño
  const porNino = useMemo(() => {
    const map = new Map<
      string,
      {
        ninoId: string;
        nombre: string;
        sedeId: string;
        pagador: ReturnType<typeof pagadorActivo>;
        matricula: ReturnType<typeof estadoMatricula>;
        sesiones: SesionDepuracion[];
        totales: Record<Clasif, { horas: number; monto: number }>;
      }
    >();
    for (const s of filtradas) {
      let g = map.get(s.ninoId);
      if (!g) {
        g = {
          ninoId: s.ninoId,
          nombre: s.ninoNombre,
          sedeId: s.sedeId,
          pagador: pagadorActivo(s.ninoId),
          matricula: estadoMatricula(s.ninoId),
          sesiones: [],
          totales: {
            INSS: { horas: 0, monto: 0 },
            Privada: { horas: 0, monto: 0 },
            "Pro-bono": { horas: 0, monto: 0 },
            "Fuera de Contrato": { horas: 0, monto: 0 },
          },
        };
        map.set(s.ninoId, g);
      }
      g.sesiones.push(s);
      if (s.facturable || s.clasificacion === "Fuera de Contrato") {
        const c = s.facturable ? s.clasificacion : "Fuera de Contrato";
        g.totales[c].horas += s.duracion;
        g.totales[c].monto += s.duracion * tarifa[s.area];
      } else {
        g.totales["Fuera de Contrato"].horas += s.duracion;
        g.totales["Fuera de Contrato"].monto += s.duracion * tarifa[s.area];
      }
    }
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [filtradas]);

  // Alertas
  const excedentesSinConstancia = porNino.filter((g) => g.totales["Fuera de Contrato"].horas > 0);

  const totalGlobal = useMemo(() => {
    const t: Record<Clasif, { horas: number; monto: number }> = {
      INSS: { horas: 0, monto: 0 },
      Privada: { horas: 0, monto: 0 },
      "Pro-bono": { horas: 0, monto: 0 },
      "Fuera de Contrato": { horas: 0, monto: 0 },
    };
    for (const g of porNino) {
      (Object.keys(t) as Clasif[]).forEach((k) => {
        t[k].horas += g.totales[k].horas;
        t[k].monto += g.totales[k].monto;
      });
    }
    return t;
  }, [porNino]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <Link to="/facturacion" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Facturación
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs">Depuración pre-facturación</span>
      </div>

      <div>
        <h1 className="font-display text-3xl">Depuración pre-facturación</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Revisa el desglose por niño y disciplina antes de cerrar el lote. Marcar una sesión como no facturable solo
          afecta el atributo contable; el registro clínico permanece intacto.
        </p>
      </div>

      {/* Aviso clínico */}
      <div className="rounded-xl border border-border/70 bg-muted/30 p-3 flex gap-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          <strong className="text-foreground">Separación clínico ↔ contable:</strong> al desmarcar una sesión, el sistema
          la excluye del cobro al INSS pero la mantiene visible en el expediente del niño con su nota completa. Toda
          reclasificación queda registrada con motivo y usuario para auditoría.
        </span>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-border/70 bg-card p-3 flex flex-wrap items-center gap-3 text-sm">
        <Field label="Quincena">
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            {(["Q1", "Q2"] as const).map((q) => (
              <button
                key={q}
                onClick={() => setQuincena(q)}
                className={`px-3 py-1 text-xs ${quincena === q ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {q === "Q1" ? "1ra · 1-15" : "2da · 16-30"}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Sede">
          <select
            value={sedeId}
            onChange={(e) => setSedeId(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          >
            <option value="todas">Todas</option>
            {sedesFact.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Disciplina">
          <select
            value={disciplina}
            onChange={(e) => setDisciplina(e.target.value as AreaFact | "todas")}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          >
            <option value="todas">Todas</option>
            <option value="ABA">ABA</option>
            <option value="Logo">Logopedia</option>
            <option value="Fisio">Fisioterapia</option>
          </select>
        </Field>
        <Field label="Niño">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar…"
            className="rounded-md border border-border bg-background px-2 py-1 text-sm w-44"
          />
        </Field>
        <div className="ml-auto inline-flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4" /> {porNino.length} niños · {filtradas.length} sesiones
        </div>
      </div>

      {/* KPIs por clasificación */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(totalGlobal) as Clasif[]).map((k) => (
          <div key={k} className="rounded-2xl border border-border/70 bg-card p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ background: colorClasif[k] }} />
              {k}
            </div>
            <div className="font-display text-2xl tabular mt-1">${totalGlobal[k].monto.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground tabular">{totalGlobal[k].horas} h</div>
          </div>
        ))}
      </div>

      {/* Alerta destacada */}
      {excedentesSinConstancia.length > 0 && (
        <div className="rounded-2xl border border-[oklch(0.85_0.106_45)] bg-[oklch(0.97_0.035_45)] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-[oklch(0.4_0.141_45)]">
            <AlertTriangle className="h-4 w-4" />
            {excedentesSinConstancia.length} {excedentesSinConstancia.length === 1 ? "niño con" : "niños con"} horas
            clasificadas Fuera de Contrato
          </div>
          <div className="text-xs text-[oklch(0.4_0.123_45)] mt-1">
            Excedentes sin constancia médica de soporte. Adjunta la constancia o confirma la clasificación.
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {excedentesSinConstancia.map((g) => (
              <button
                key={g.ninoId}
                onClick={() => setExpandido((p) => ({ ...p, [g.ninoId]: true }))}
                className="rounded-full bg-card border border-[oklch(0.85_0.106_45)] px-2.5 py-1 text-[11px] font-medium text-[oklch(0.4_0.141_45)] hover:bg-[oklch(0.95_0.044_45)]"
              >
                {g.nombre} · {g.totales["Fuera de Contrato"].horas}h
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabla por niño */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_repeat(4,minmax(0,1fr))] text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40 px-3 py-2">
          <div>Niño</div>
          <div>Pagador</div>
          <div className="text-right">INSS</div>
          <div className="text-right">Privada</div>
          <div className="text-right">Pro-bono</div>
          <div className="text-right">Fuera Contrato</div>
        </div>
        <div className="divide-y divide-border/50">
          {porNino.map((g) => {
            const open = expandido[g.ninoId];
            const sede = sedesFact.find((s) => s.id === g.sedeId)?.nombre ?? g.sedeId;
            return (
              <div key={g.ninoId}>
                <button
                  onClick={() => setExpandido((p) => ({ ...p, [g.ninoId]: !p[g.ninoId] }))}
                  className="w-full grid grid-cols-[1fr_120px_repeat(4,minmax(0,1fr))] items-center px-3 py-2.5 text-sm hover:bg-muted/30 text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                    <div className="min-w-0">
                      <div className="font-medium truncate">{g.nombre}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {sede}
                        {g.matricula !== "activo" && (
                          <span className="ml-1.5 rounded bg-[oklch(0.95_0.044_80)] px-1 py-0.5 text-[10px]">
                            {g.matricula}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs">
                    <span
                      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
                      style={{
                        background:
                          g.pagador === "INSS"
                            ? "oklch(0.94 0.044 258)"
                            : g.pagador === "Privado"
                            ? "oklch(0.95 0.035 292)"
                            : "oklch(0.94 0.044 160)",
                        color:
                          g.pagador === "INSS"
                            ? "oklch(0.35 0.106 258)"
                            : g.pagador === "Privado"
                            ? "oklch(0.35 0.123 292)"
                            : "oklch(0.35 0.106 160)",
                      }}
                    >
                      {g.pagador}
                    </span>
                  </div>
                  {(["INSS", "Privada", "Pro-bono", "Fuera de Contrato"] as Clasif[]).map((k) => (
                    <div key={k} className="text-right tabular">
                      <div className="text-xs">{g.totales[k].horas > 0 ? `${g.totales[k].horas}h` : "—"}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {g.totales[k].monto > 0 ? `$${g.totales[k].monto.toFixed(2)}` : ""}
                      </div>
                    </div>
                  ))}
                </button>

                {open && (
                  <div className="bg-muted/20 border-t border-border/40">
                    <table className="w-full text-xs">
                      <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Fecha</th>
                          <th className="px-3 py-2 text-left font-medium">Área</th>
                          <th className="px-3 py-2 text-left font-medium">Terapeuta</th>
                          <th className="px-3 py-2 text-left font-medium">Clasificación</th>
                          <th className="px-3 py-2 text-right font-medium">Horas</th>
                          <th className="px-3 py-2 text-right font-medium">Subtotal</th>
                          <th className="px-3 py-2 text-center font-medium">Facturable</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.sesiones.map((s) => (
                          <tr key={s.id} className="border-t border-border/30">
                            <td className="px-3 py-1.5 tabular">{new Date(s.fecha).toLocaleDateString("es-NI", { day: "2-digit", month: "short" })}</td>
                            <td className="px-3 py-1.5">{s.area}</td>
                            <td className="px-3 py-1.5 text-muted-foreground">{s.terapeuta}</td>
                            <td className="px-3 py-1.5">
                              <span
                                className="inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                                style={{
                                  background: colorClasif[s.clasificacion] + "22",
                                  color: colorClasif[s.clasificacion],
                                }}
                              >
                                {s.clasificacion}
                              </span>
                              {s.motivoNoFact && <div className="text-[10px] text-muted-foreground mt-0.5">{s.motivoNoFact}</div>}
                            </td>
                            <td className="px-3 py-1.5 text-right tabular">{s.duracion}</td>
                            <td className="px-3 py-1.5 text-right tabular">${(s.duracion * tarifa[s.area]).toFixed(2)}</td>
                            <td className="px-3 py-1.5 text-center">
                              <label className="inline-flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={s.facturable}
                                  onChange={(e) => {
                                    const v = e.target.checked;
                                    if (!v) {
                                      const motivo = prompt("Motivo de exclusión contable (queda en auditoría):") ?? "Excluida manualmente";
                                      setOverride(s.id, false, motivo);
                                    } else {
                                      setOverride(s.id, true);
                                    }
                                  }}
                                  className="h-3.5 w-3.5"
                                />
                              </label>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
          {porNino.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">Sin sesiones con los filtros actuales.</div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Link
          to="/facturacion"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-xs hover:bg-muted"
        >
          <FileText className="h-3.5 w-3.5" /> Volver a Facturación
        </Link>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span className="uppercase tracking-wider text-[10px]">{label}</span>
      {children}
    </label>
  );
}
