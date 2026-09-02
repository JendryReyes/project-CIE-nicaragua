import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tags, Save, Info } from "lucide-react";
import { toast } from "sonner";
import {
  guardarOverride,
  leerOverrides,
  reglasFacturacion,
  tarifaEfectiva,
  tarifario,
} from "@/lib/tarifas-tdr";
import { registrarEvento } from "@/lib/auditoria";
import { useRol } from "@/lib/roles-tdr";

export const Route = createFileRoute("/_app/tarifas")({
  head: () => ({
    meta: [
      { title: "Unidades facturables y tarifario · CIE" },
      { name: "description", content: "Catálogo de unidades facturables, tarifas por pagador, códigos ERP y reglas de facturación." },
      { property: "og:title", content: "Unidades facturables y tarifario · CIE" },
      { property: "og:description", content: "Configuración del tarifario clínico por disciplina, unidad y pagador." },
    ],
  }),
  component: Tarifas,
});

function Tarifas() {
  const { verMontos, rol } = useRol();
  const [overrides, setOverrides] = useState<Record<string, number>>(() => leerOverrides());
  const [borrador, setBorrador] = useState<Record<string, string>>({});

  const guardar = (id: string, unidad: string) => {
    const valor = Number(borrador[id]);
    if (Number.isNaN(valor) || valor < 0) {
      toast.error("Tarifa inválida");
      return;
    }
    guardarOverride(id, valor);
    setOverrides({ ...overrides, [id]: valor });
    registrarEvento({
      actor: "Karla Duarte",
      rol: "Personal Administrativo",
      categoria: "facturacion",
      accion: "Actualizar tarifa",
      entidad: `Tarifario · ${unidad} (${id})`,
      detalle: `Nueva tarifa US$ ${valor.toFixed(2)}`,
    });
    toast.success("Tarifa actualizada");
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Tags className="h-4 w-4" /> Facturación
        </div>
        <h1 className="font-display text-3xl mt-1">Unidades facturables y tarifario</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Catálogo de servicios facturables por disciplina, unidad de medida y pagador, con código ERP para
          exportación contable.
        </p>
      </div>

      {!verMontos && (
        <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-sm text-muted-foreground">
          Tu rol activo ({rol}) no visualiza montos monetarios. Se muestran unidades y códigos ERP únicamente.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Unidad facturable</th>
              <th className="text-left px-4 py-3 font-medium">Disciplina</th>
              <th className="text-left px-4 py-3 font-medium">Pagador</th>
              <th className="text-left px-4 py-3 font-medium">Medida</th>
              <th className="text-left px-4 py-3 font-medium">Código ERP</th>
              {verMontos && <th className="text-right px-4 py-3 font-medium">Tarifa (US$)</th>}
              {verMontos && <th className="px-4 py-3 font-medium">Ajustar</th>}
              <th className="text-left px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {tarifario.map((t) => (
              <tr key={t.id} className="border-t border-border/50">
                <td className="px-4 py-3">{t.unidad}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.disciplina}</td>
                <td className="px-4 py-3">{t.pagador}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.medida}</td>
                <td className="px-4 py-3 font-mono text-xs">{t.codigoERP}</td>
                {verMontos && (
                  <td className="px-4 py-3 text-right">{tarifaEfectiva(t, overrides).toFixed(2)}</td>
                )}
                {verMontos && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={borrador[t.id] ?? ""}
                        onChange={(e) => setBorrador({ ...borrador, [t.id]: e.target.value })}
                        placeholder={String(tarifaEfectiva(t, overrides))}
                        className="w-20 rounded-md border border-border/60 px-2 py-1 text-xs outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => guardar(t.id, t.unidad)}
                        className="rounded-md border border-border/60 p-1.5 hover:bg-muted/60"
                        title="Guardar tarifa"
                      >
                        <Save className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                )}
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.7rem] ${
                      t.activo
                        ? "bg-[oklch(0.94_0.044_160)] text-[oklch(0.36_0.097_160)]"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Info className="h-4 w-4 text-muted-foreground" /> Reglas de facturación
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Cortes</dt>
              <dd>{reglasFacturacion.corte}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Redondeo</dt>
              <dd>{reglasFacturacion.redondeo}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Prorrateo</dt>
              <dd>{reglasFacturacion.prorrateo}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-border/60 p-4">
          <div className="text-sm font-medium">Conceptos no facturables</div>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {reglasFacturacion.noFacturable.map((r) => (
              <li key={r}>· {r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
