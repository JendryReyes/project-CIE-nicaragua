import { createFileRoute, Link } from "@tanstack/react-router";
import { loteDemo, calcularLinea, resumenLote, TARIFA_HORA_USD } from "@/lib/facturacion-inss";
import {
  AlertTriangle, CheckCircle2, FileText, Download, Send, ShieldAlert,
  FileCheck2, FileX2, Stethoscope, ArrowLeft, Receipt,
} from "lucide-react";

export const Route = createFileRoute("/_app/facturacion/$loteId")({
  head: () => ({ meta: [{ title: "Lote INSS · CIE" }] }),
  component: LoteDetalle,
});

const areaColor: Record<string, string> = {
  ABA: "bg-[oklch(0.94_0.044_45)] text-[oklch(0.4_0.114_45)]",
  Fisioterapia: "bg-[oklch(0.94_0.044_258)] text-[oklch(0.4_0.088_258)]",
  Logopedia: "bg-[oklch(0.94_0.044_292)] text-[oklch(0.4_0.088_292)]",
};

function LoteDetalle() {
  const lote = loteDemo; // mock: siempre devuelve el demo
  const resumen = resumenLote(lote);
  const soportesFaltantes = lote.soportes.filter((s) => s.requerido && !s.cargado);
  const puedeEnviar = soportesFaltantes.length === 0;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <Link to="/facturacion" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-3 w-3" /> Volver a lotes
          </Link>
          <h1 className="font-display text-3xl">{lote.id}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lote.periodo} · 2da quincena (corte {lote.fechaCorte}) · Sede {lote.sede}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm hover:bg-muted">
            <Download className="h-4 w-4" /> Excel de servicios
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm hover:bg-muted">
            <FileText className="h-4 w-4" /> Carta de cobro PDF
          </button>
          <button
            disabled={!puedeEnviar}
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            title={puedeEnviar ? "" : `Faltan ${soportesFaltantes.length} soporte(s) requerido(s)`}
          >
            <Send className="h-4 w-4" /> Validar y enviar
          </button>
        </div>
      </div>

      {/* KPIs del lote */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi label="Niños en el lote" value={resumen.ninos.toString()} />
        <Kpi label="Horas a facturar INSS" value={resumen.horasINSS.toString()} tone="primary" />
        <Kpi label="Monto INSS" value={`$${resumen.montoINSS.toLocaleString()}`} tone="success" />
        <Kpi label="Excedentes" value={(resumen.alertasExcedente + resumen.excedenteJustificado).toString()}
          hint={`${resumen.excedenteJustificado} con constancia · ${resumen.alertasExcedente} sin constancia`}
          tone={resumen.alertasExcedente > 0 ? "warn" : "neutral"} />
        <Kpi label="Privada + Pro-bono" value={`${resumen.horasPrivada + resumen.horasProBono}h`}
          hint={`$${resumen.montoPrivada.toLocaleString()} privada`} />
      </div>

      {/* Alerta de excedentes */}
      {resumen.alertasExcedente > 0 && (
        <div className="rounded-2xl border border-[oklch(0.85_0.088_45)] bg-[oklch(0.97_0.035_45)] p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[oklch(0.55_0.158_45)] mt-0.5" />
            <div className="flex-1">
              <h3 className="font-display text-lg text-[oklch(0.35_0.132_45)]">
                {resumen.alertasExcedente} niño(s) con horas excedentes sin constancia médica
              </h3>
              <p className="text-sm text-[oklch(0.4_0.106_45)] mt-1">
                Estas horas se excluyen automáticamente de la facturación INSS. Si tienes la constancia médica del período anterior,
                cárgala desde el expediente del niño y vuelve a generar el lote.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de líneas */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border/60">
          <div>
            <h3 className="font-display text-lg">Comparativo horas ejecutadas vs aprobadas</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Q2 = semanas 3+4 · límite restante = aprobadas − Q1 ya facturada (+ constancias)
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="text-left font-medium px-5 py-3">Niño</th>
                <th className="text-left font-medium px-3 py-3">Área</th>
                <th className="text-right font-medium px-3 py-3">Aprob.</th>
                <th className="text-right font-medium px-3 py-3">Q1</th>
                <th className="text-right font-medium px-3 py-3">Límite Q2</th>
                <th className="text-right font-medium px-3 py-3">Ejec.</th>
                <th className="text-right font-medium px-3 py-3">Facturable</th>
                <th className="text-left font-medium px-3 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {lote.lineas.map((l, i) => {
                const c = calcularLinea(l);
                const hayExcedente = c.excedente > 0;
                const sinCarta = !l.cartaVigente && l.tipo === "INSS";
                const pctUso = l.horasAprobadas > 0 ? l.horasEjecutadas / l.horasAprobadas : 0;
                const rowTone =
                  sinCarta || (hayExcedente && !l.constanciaMedica)
                    ? "bg-[oklch(0.97_0.014_265)] hover:bg-[oklch(0.95_0.035_45)]"
                    : hayExcedente
                    ? "bg-[oklch(0.97_0.035_80)] hover:bg-[oklch(0.95_0.044_80)]"
                    : pctUso >= 0.85 && l.tipo === "INSS"
                    ? "bg-[oklch(0.98_0.014_265)] hover:bg-[oklch(0.96_0.035_80)]"
                    : l.tipo === "INSS"
                    ? "bg-[oklch(0.98_0.014_265)] hover:bg-[oklch(0.96_0.014_265)]"
                    : "hover:bg-muted/40";
                return (
                  <tr key={i} className={rowTone}>

                    <td className="px-5 py-3">
                      <Link to="/ninos/$id" params={{ id: l.ninoId }} className="hover:underline">
                        <div className="font-medium">{l.nino}</div>
                        <div className="text-xs text-muted-foreground">{l.edad} años · {l.tipo}</div>
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${areaColor[l.area] ?? "bg-muted"}`}>
                        {l.area}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular text-muted-foreground">{l.horasAprobadas}</td>
                    <td className="px-3 py-3 text-right tabular text-muted-foreground">{l.horasQ1}</td>
                    <td className="px-3 py-3 text-right tabular">
                      {c.limiteRestante}
                      {l.constanciaMedica && (
                        <span className="ml-1 inline-flex items-center text-[10px] text-[oklch(0.6_0.078_160)]">
                          +{l.constanciaMedica.horasJustificadas}c
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right tabular font-medium">{l.horasEjecutadas}</td>
                    <td className="px-3 py-3 text-right tabular font-display">{c.facturablesINSS}</td>
                    <td className="px-3 py-3">
                      {sinCarta && (
                        <span className="inline-flex items-center gap-1 text-xs text-[oklch(0.5_0.132_45)]">
                          <ShieldAlert className="h-3 w-3" /> Sin carta vigente
                        </span>
                      )}
                      {hayExcedente && l.constanciaMedica && (
                        <span className="inline-flex items-center gap-1 text-xs text-[oklch(0.6_0.078_160)]" title={l.constanciaMedica.tipo}>
                          <Stethoscope className="h-3 w-3" /> +{c.excedente}h con constancia
                        </span>
                      )}
                      {hayExcedente && !l.constanciaMedica && (
                        <span className="inline-flex items-center gap-1 text-xs text-[oklch(0.5_0.158_45)]">
                          <AlertTriangle className="h-3 w-3" /> {c.excedente}h excedente excluido
                        </span>
                      )}
                      {l.tipo === "Pro-bono" && (
                        <span className="text-xs text-muted-foreground">Pro-bono (no INSS)</span>
                      )}
                      {!hayExcedente && !sinCarta && l.tipo === "INSS" && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-[oklch(0.55_0.088_160)]" /> OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-border/60 bg-muted/30 text-sm">
              <tr>
                <td colSpan={6} className="px-5 py-3 text-right text-muted-foreground">
                  Total facturable INSS · {resumen.horasINSS}h × ${TARIFA_HORA_USD}
                </td>
                <td className="px-3 py-3 text-right font-display text-lg">${resumen.montoINSS.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Checklist de soportes */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border/70 bg-card p-5">
          <h3 className="font-display text-lg mb-1">Soportes para envío al INSS</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Todos los documentos requeridos deben estar cargados antes de validar el lote.
          </p>
          <ul className="space-y-2">
            {lote.soportes.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  {s.cargado
                    ? <FileCheck2 className="h-4 w-4 text-[oklch(0.55_0.088_160)]" />
                    : <FileX2 className="h-4 w-4 text-muted-foreground" />}
                  <div>
                    <div className="text-sm">{s.nombre}</div>
                    {s.requerido && !s.cargado && (
                      <div className="text-[11px] text-[oklch(0.5_0.158_45)]">Requerido</div>
                    )}
                  </div>
                </div>
                <button className="text-xs text-primary hover:underline">
                  {s.cargado ? "Reemplazar" : "Cargar"}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5">
          <h3 className="font-display text-lg mb-3">Resumen del cobro</h3>
          <div className="space-y-2 text-sm">
            <Row label="Horas INSS facturables" value={`${resumen.horasINSS}h`} />
            <Row label="Tarifa hora" value={`$${TARIFA_HORA_USD}`} />
            <div className="border-t border-border/60 my-2" />
            <Row label="Subtotal INSS" value={`$${resumen.montoINSS.toLocaleString()}`} strong />
            <Row label="Horas privadas" value={`${resumen.horasPrivada}h · $${resumen.montoPrivada.toLocaleString()}`} muted />
            <Row label="Horas pro-bono" value={`${resumen.horasProBono}h · $0`} muted />
            <div className="border-t border-border/60 my-2" />
            <Row label="Excluidas sin carta vigente" value={`${resumen.horasSinCarta}h`} muted />
            <Row label="Excedente no facturable" value={`${resumen.alertasExcedente} caso(s)`} muted />
          </div>
          <button className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full border border-border px-3 py-2 text-sm hover:bg-muted">
            <Receipt className="h-4 w-4" /> Generar recibo de caja
          </button>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "primary" | "success" | "warn" | "neutral" }) {
  const toneCls =
    tone === "primary" ? "text-primary" :
    tone === "success" ? "text-[oklch(0.5_0.088_160)]" :
    tone === "warn" ? "text-[oklch(0.5_0.158_45)]" : "";
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display text-2xl mt-1 tabular ${toneCls}`}>{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${muted ? "text-muted-foreground" : ""}`}>
      <span>{label}</span>
      <span className={`tabular ${strong ? "font-display text-base" : ""}`}>{value}</span>
    </div>
  );
}
