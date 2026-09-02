import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, AlertTriangle, ShieldCheck, X, History, CalendarClock } from "lucide-react";
import {
  autorizaciones,
  autorizacionDe,
  estadoAutorizacion,
  pagadoresNinos,
  prorratear,
  type PagadorNino,
} from "@/lib/pagadores-tdr";
import { useRol } from "@/lib/roles-tdr";

export const Route = createFileRoute("/_app/pagadores")({
  head: () => ({
    meta: [
      { title: "Pagadores y autorizaciones · CIE" },
      { name: "description", content: "Pagador activo por niño, cartas de autorización INSS, límites de 25 h y 45 h y prorrateo de meses parciales." },
      { property: "og:title", content: "Pagadores y autorizaciones · CIE" },
      { property: "og:description", content: "Control de cobertura, vigencias y horas autorizadas por beneficiario." },
    ],
  }),
  component: Pagadores,
});

const fmt = (f: string) => new Date(f).toLocaleDateString("es-NI", { day: "numeric", month: "short", year: "numeric" });

const pagadorTono: Record<string, string> = {
  INSS: "bg-[oklch(0.94_0.044_160)] text-[oklch(0.36_0.097_160)]",
  Privado: "bg-[oklch(0.94_0.044_258)] text-[oklch(0.4_0.114_258)]",
  "Pro-bono": "bg-[oklch(0.94_0.044_292)] text-[oklch(0.4_0.114_292)]",
  "Otra aseguradora": "bg-muted text-muted-foreground",
};

function Pagadores() {
  const [sel, setSel] = useState<PagadorNino | null>(null);
  const alertas = autorizaciones.filter((a) => {
    const e = estadoAutorizacion(a);
    return e.excedeCarta || e.excedeTDR;
  });
  const porVencer = autorizaciones.filter((a) => estadoAutorizacion(a).porVencer);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4" /> Facturación
        </div>
        <h1 className="font-display text-3xl mt-1">Pagadores y autorizaciones</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Cada niño mantiene un solo pagador activo a la vez. Los cambios conservan historial con fecha y motivo, y
          las cartas de autorización controlan los topes de 25 h (TA/TS) y 45 h (IT/PFA) mensuales.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Beneficiarios", v: pagadoresNinos.length, s: "con pagador activo" },
          { l: "Cobertura INSS", v: pagadoresNinos.filter((p) => p.pagadorActivo === "INSS").length, s: "casos" },
          { l: "Autorizaciones vigentes", v: autorizaciones.length, s: "cartas activas" },
          { l: "Alertas de tope", v: alertas.length, s: "requieren revisión" },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border border-border/60 p-4">
            <div className="text-xs text-muted-foreground">{k.l}</div>
            <div className="font-display text-2xl mt-1">{k.v}</div>
            <div className="text-xs text-muted-foreground">{k.s}</div>
          </div>
        ))}
      </div>

      {alertas.length > 0 && (
        <div className="rounded-xl border border-[oklch(0.85_0.07_30)] bg-[oklch(0.98_0.014_265)] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-[oklch(0.45_0.132_30)]">
            <AlertTriangle className="h-4 w-4" /> Alerta automática · {alertas.length} autorizaciones fuera de rango
          </div>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {alertas.map((a) => {
              const e = estadoAutorizacion(a);
              return (
                <li key={a.id}>
                  <span className="font-medium text-foreground">{a.nino}</span> — {a.programa}:
                  {e.excedeCarta && ` ejecutó ${a.horasEjecutadasMes}h de ${a.horasAutorizadasMes}h autorizadas`}
                  {e.excedeTDR && ` · carta con ${a.horasAutorizadasMes}h supera el tope autorizado de ${a.limiteTDR}h`}
                  {a.constanciaMedica === false && " · sin constancia médica"}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {porVencer.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarClock className="h-4 w-4 text-muted-foreground" /> Vigencias que expiran en junio 2026
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
            {porVencer.map((a) => (
              <span key={a.id} className="rounded-full bg-background border border-border/60 px-2 py-0.5">
                {a.nino} · {a.numeroCarta} · hasta {fmt(a.vigenciaHasta)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Beneficiario</th>
              <th className="text-left px-4 py-3 font-medium">Sede</th>
              <th className="text-left px-4 py-3 font-medium">Pagador activo</th>
              <th className="text-left px-4 py-3 font-medium">Desde</th>
              <th className="text-left px-4 py-3 font-medium">Carta / programa</th>
              <th className="text-right px-4 py-3 font-medium">Autorizadas</th>
              <th className="text-right px-4 py-3 font-medium">Ejecutadas</th>
              <th className="text-left px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {pagadoresNinos.map((p) => {
              const a = autorizacionDe(p.ninoId);
              const e = a ? estadoAutorizacion(a) : null;
              return (
                <tr
                  key={p.ninoId}
                  onClick={() => setSel(p)}
                  className="border-t border-border/50 cursor-pointer hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[0.65rem] font-semibold">
                        {p.iniciales}
                      </span>
                      {p.nino}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.sede}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[0.7rem] ${pagadorTono[p.pagadorActivo]}`}>
                      {p.pagadorActivo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(p.desde)}</td>
                  <td className="px-4 py-3">
                    {a ? (
                      <div>
                        <div>{a.numeroCarta}</div>
                        <div className="text-xs text-muted-foreground">{a.programa}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Sin carta INSS</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">{a ? `${a.horasAutorizadasMes} h` : "—"}</td>
                  <td className="px-4 py-3 text-right">{a ? `${a.horasEjecutadasMes} h` : "—"}</td>
                  <td className="px-4 py-3">
                    {!a ? (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    ) : e!.excedeCarta ? (
                      <span className="rounded-full bg-[oklch(0.95_0.053_30)] px-2 py-0.5 text-[0.7rem] text-[oklch(0.45_0.132_30)]">
                        Excede carta
                      </span>
                    ) : e!.excedeTDR ? (
                      <span className="rounded-full bg-[oklch(0.95_0.062_80)] px-2 py-0.5 text-[0.7rem] text-[oklch(0.44_0.114_80)]">
                        Supera tope autorizado
                      </span>
                    ) : (
                      <span className="rounded-full bg-[oklch(0.94_0.044_160)] px-2 py-0.5 text-[0.7rem] text-[oklch(0.36_0.097_160)]">
                        {e!.pct}% usado
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sel && <DetallePagador p={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function DetallePagador({ p, onClose }: { p: PagadorNino; onClose: () => void }) {
  const { verMontos } = useRol();
  const a = autorizacionDe(p.ninoId);
  const pr = prorratear({ montoMensual: 480, mes: 6, anio: 2026, ingreso: p.ingresoMes, egreso: p.egresoMes });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl">{p.nino}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {p.sede} · Pagador activo desde {fmt(p.desde)}
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" /> Pagador activo (único)
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs ${pagadorTono[p.pagadorActivo]}`}>
              {p.pagadorActivo}
            </span>
            <span className="text-xs text-muted-foreground">
              El sistema impide dos pagadores simultáneos para el mismo período.
            </span>
          </div>
        </div>

        {a && (
          <div className="mt-3 rounded-xl border border-border/60 p-4">
            <div className="text-sm font-medium">Carta de autorización</div>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Número</dt>
                <dd>{a.numeroCarta}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Entidad</dt>
                <dd>{a.entidad}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Vigencia</dt>
                <dd>
                  {fmt(a.vigenciaDesde)} → {fmt(a.vigenciaHasta)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Programa / tope</dt>
                <dd>
                  {a.programa} · máx {a.limiteTDR} h
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Horas autorizadas</dt>
                <dd>{a.horasAutorizadasMes} h/mes</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Horas ejecutadas</dt>
                <dd>{a.horasEjecutadasMes} h</dd>
              </div>
            </dl>
            <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, estadoAutorizacion(a).pct)}%`,
                  background:
                    estadoAutorizacion(a).pct >= 100
                      ? "oklch(0.6 0.158 30)"
                      : estadoAutorizacion(a).pct >= 85
                        ? "oklch(0.72 0.132 80)"
                        : "oklch(0.66 0.084 160)",
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {estadoAutorizacion(a).pct}% de las horas autorizadas del mes
            </div>
          </div>
        )}

        <div className="mt-3 rounded-xl border border-border/60 p-4">
          <div className="text-sm font-medium">Prorrateo del mes (junio 2026)</div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Días del mes</div>
              <div>{pr.diasMes}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Días facturables</div>
              <div>{pr.diasFacturables}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Factor</div>
              <div>{(pr.factor * 100).toFixed(1)}%</div>
            </div>
          </div>
          {verMontos ? (
            <div className="mt-2 text-sm">
              Cuota prorrateada: <span className="font-medium">US$ {pr.monto.toFixed(2)}</span>
              <span className="text-muted-foreground"> (base US$ 480.00)</span>
            </div>
          ) : (
            <div className="mt-2 text-xs text-muted-foreground">
              Montos ocultos para tu rol: solo Facturación y Dirección visualizan valores monetarios.
            </div>
          )}
          {pr.parcial && (
            <div className="mt-2 text-xs text-[oklch(0.45_0.123_80)]">
              Mes parcial detectado ({p.ingresoMes ? `ingreso ${fmt(p.ingresoMes)}` : ""}
              {p.egresoMes ? ` egreso ${fmt(p.egresoMes)}` : ""}). Se factura solo el período efectivo.
            </div>
          )}
        </div>

        <div className="mt-3 rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <History className="h-4 w-4 text-muted-foreground" /> Historial de pagadores
          </div>
          {p.historial.length === 0 ? (
            <p className="text-xs text-muted-foreground mt-2">Sin cambios de pagador registrados.</p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {p.historial.map((h, i) => (
                <li key={i} className="rounded-lg bg-muted/50 p-2.5">
                  <div className="flex items-center justify-between">
                    <span>{h.pagador}</span>
                    <span className="text-xs text-muted-foreground">
                      {fmt(h.desde)} → {fmt(h.hasta)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">Motivo: {h.motivo}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
