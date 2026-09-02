import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, FileText, Paperclip, Plus, X } from "lucide-react";
import { sedesFact } from "@/lib/modulos-data";
import {
  serviciosEventuales as seedEventuales,
  serviciosEventualesDelCorte,
  tarifaEventual,
  type ServicioEventual,
  type TipoServicioEventual,
} from "@/lib/facturacion-modelo";

export const Route = createFileRoute("/_app/facturacion/eventuales")({
  head: () => ({ meta: [{ title: "Servicios eventuales · CIE" }] }),
  component: EventualesPage,
});

const tipos: TipoServicioEventual[] = ["ADOS-2", "Eval Fisioterapia", "Eval Logopedia", "Visita escolar", "Neuropediatría"];

function EventualesPage() {
  const [quincena, setQuincena] = useState<"Q1" | "Q2">("Q2");
  const [sedeId, setSedeId] = useState<string | "todas">("todas");
  const [items, setItems] = useState<ServicioEventual[]>(seedEventuales);
  const [openNuevo, setOpenNuevo] = useState(false);

  const filtrados = useMemo(
    () => serviciosEventualesDelCorte(quincena, 5, 2026, sedeId).map((s) => items.find((i) => i.id === s.id) ?? s),
    [items, quincena, sedeId]
  );

  const totalIncluido = filtrados.filter((s) => s.incluirEnLote).reduce((acc, s) => acc + s.monto, 0);
  const horasMissing = filtrados.filter((s) => !s.informeAdjunto || !s.reciboFirmado).length;

  const toggleIncluir = (id: string) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, incluirEnLote: !s.incluirEnLote } : s)));
  };
  const toggleAdj = (id: string, key: "informeAdjunto" | "reciboFirmado" | "cartaINSS") => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: !s[key] } : s)));
  };

  const agregar = (s: Omit<ServicioEventual, "id">) => {
    const id = `SE-${String(items.length + 1).padStart(3, "0")}`;
    setItems((prev) => [...prev, { ...s, id }]);
    setOpenNuevo(false);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <Link to="/facturacion" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Facturación
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs">Servicios eventuales</span>
      </div>

      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Servicios eventuales</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ADOS-2, evaluaciones de fisio/logopedia, visitas escolares y neuropediatría. Cada registro debe llevar su
            informe, recibo firmado y, si aplica, carta INSS antes de incluirse en el lote del corte.
          </p>
        </div>
        <button
          onClick={() => setOpenNuevo(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> Registrar servicio eventual
        </button>
      </div>

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
        <div className="ml-auto text-xs text-muted-foreground">
          {filtrados.length} servicios · ${totalIncluido.toFixed(2)} incluidos en lote
          {horasMissing > 0 && (
            <span className="ml-2 text-[oklch(0.55_0.141_45)]">· {horasMissing} con adjuntos pendientes</span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Fecha</th>
              <th className="px-3 py-2 text-left font-medium">Niño</th>
              <th className="px-3 py-2 text-left font-medium">Tipo de servicio</th>
              <th className="px-3 py-2 text-left font-medium">Pagador</th>
              <th className="px-3 py-2 text-center font-medium">Informe</th>
              <th className="px-3 py-2 text-center font-medium">Recibo</th>
              <th className="px-3 py-2 text-center font-medium">Carta INSS</th>
              <th className="px-3 py-2 text-right font-medium">Monto</th>
              <th className="px-3 py-2 text-center font-medium">En lote</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((s) => {
              const completo = s.informeAdjunto && s.reciboFirmado && (s.pagador !== "INSS" || s.cartaINSS);
              return (
                <tr key={s.id} className="border-t border-border/40">
                  <td className="px-3 py-2 tabular text-xs">
                    {new Date(s.fecha).toLocaleDateString("es-NI", { day: "2-digit", month: "short" })}
                  </td>
                  <td className="px-3 py-2">{s.ninoNombre}</td>
                  <td className="px-3 py-2">{s.tipo}</td>
                  <td className="px-3 py-2 text-xs">{s.pagador}</td>
                  <td className="px-3 py-2 text-center">
                    <AdjBtn ok={s.informeAdjunto} onClick={() => toggleAdj(s.id, "informeAdjunto")} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <AdjBtn ok={s.reciboFirmado} onClick={() => toggleAdj(s.id, "reciboFirmado")} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <AdjBtn ok={s.cartaINSS} onClick={() => toggleAdj(s.id, "cartaINSS")} disabled={s.pagador !== "INSS"} />
                  </td>
                  <td className="px-3 py-2 text-right tabular">${s.monto.toFixed(2)}</td>
                  <td className="px-3 py-2 text-center">
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={s.incluirEnLote}
                        disabled={!completo}
                        onChange={() => toggleIncluir(s.id)}
                        className="h-3.5 w-3.5"
                      />
                    </label>
                    {!completo && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">Faltan adjuntos</div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Sin servicios eventuales en este corte.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openNuevo && <NuevoEventual onCancel={() => setOpenNuevo(false)} onSave={agregar} />}
    </div>
  );
}

function AdjBtn({ ok, onClick, disabled }: { ok: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${
        disabled
          ? "border-border/40 text-muted-foreground/40 cursor-not-allowed"
          : ok
          ? "border-[oklch(0.7_0.123_160)] bg-[oklch(0.95_0.053_160)] text-[oklch(0.4_0.123_160)] hover:opacity-80"
          : "border-border text-muted-foreground hover:bg-muted"
      }`}
      title={disabled ? "No aplica" : ok ? "Adjuntado" : "Marcar como adjuntado"}
    >
      {ok ? <Check className="h-3.5 w-3.5" /> : <Paperclip className="h-3.5 w-3.5" />}
    </button>
  );
}

function NuevoEventual({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (s: Omit<ServicioEventual, "id">) => void;
}) {
  const ninos = sedesFact.flatMap((s) => s.ninos);
  const [ninoId, setNinoId] = useState(ninos[0].id);
  const [tipo, setTipo] = useState<TipoServicioEventual>("ADOS-2");
  const [fecha, setFecha] = useState("2026-05-28");
  const [pagador, setPagador] = useState<ServicioEventual["pagador"]>("INSS");
  const [informe, setInforme] = useState(false);
  const [recibo, setRecibo] = useState(false);
  const [carta, setCarta] = useState(false);

  const nino = ninos.find((n) => n.id === ninoId)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-background border border-border shadow-xl"
      >
        <header className="flex items-center justify-between p-4 border-b border-border/60">
          <h3 className="font-display text-lg">Registrar servicio eventual</h3>
          <button onClick={onCancel} className="rounded-md p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="p-4 space-y-3 text-sm">
          <Row label="Niño">
            <select
              value={ninoId}
              onChange={(e) => setNinoId(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5"
            >
              {ninos.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nombre}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Tipo">
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoServicioEventual)}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5"
            >
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {t} · ${tarifaEventual[t]}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Fecha">
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5"
            />
          </Row>
          <Row label="Pagador">
            <select
              value={pagador}
              onChange={(e) => setPagador(e.target.value as ServicioEventual["pagador"])}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5"
            >
              <option>INSS</option>
              <option>Privado</option>
              <option>Pro-bono</option>
            </select>
          </Row>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <label className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1.5 cursor-pointer">
              <input type="checkbox" checked={informe} onChange={(e) => setInforme(e.target.checked)} />
              Informe
            </label>
            <label className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1.5 cursor-pointer">
              <input type="checkbox" checked={recibo} onChange={(e) => setRecibo(e.target.checked)} />
              Recibo firmado
            </label>
            <label className={`inline-flex items-center gap-2 rounded-md border border-border px-2 py-1.5 cursor-pointer ${pagador !== "INSS" ? "opacity-40" : ""}`}>
              <input
                type="checkbox"
                checked={carta}
                onChange={(e) => setCarta(e.target.checked)}
                disabled={pagador !== "INSS"}
              />
              Carta INSS
            </label>
          </div>
          <p className="text-[11px] text-muted-foreground">
            La subida real de adjuntos se simula en esta demo — los checks dejan listo el registro para incluirlo en el
            lote.
          </p>
        </div>
        <footer className="flex justify-end gap-2 p-3 border-t border-border/60">
          <button onClick={onCancel} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">
            Cancelar
          </button>
          <button
            onClick={() =>
              onSave({
                ninoId,
                ninoNombre: nino.nombre,
                sedeId: nino.sedeId,
                tipo,
                fecha,
                monto: tarifaEventual[tipo],
                pagador,
                informeAdjunto: informe,
                reciboFirmado: recibo,
                cartaINSS: carta,
                incluirEnLote: informe && recibo && (pagador !== "INSS" || carta),
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:opacity-90"
          >
            <FileText className="h-3.5 w-3.5" /> Guardar
          </button>
        </footer>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
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
