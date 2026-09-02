import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileClock, Download, Search, Lock } from "lucide-react";
import {
  categoriaLabel,
  descargarCSV,
  eventosCSV,
  listarEventos,
  type CategoriaEvento,
} from "@/lib/auditoria";

export const Route = createFileRoute("/_app/auditoria")({
  head: () => ({
    meta: [
      { title: "Bitácora de auditoría · CIE" },
      { name: "description", content: "Registro inmutable de acciones sensibles, accesos y cambios de facturación del CIE." },
      { property: "og:title", content: "Bitácora de auditoría · CIE" },
      { property: "og:description", content: "Trazabilidad de acciones clínicas, matrícula y facturación." },
    ],
  }),
  component: Auditoria,
});

const categorias: (CategoriaEvento | "todas")[] = [
  "todas",
  "clinico",
  "facturacion",
  "matricula",
  "gobernanza",
  "acceso",
  "plataforma",
];

const tono: Record<CategoriaEvento, string> = {
  clinico: "bg-[oklch(0.94_0.044_292)] text-[oklch(0.4_0.114_292)]",
  facturacion: "bg-[oklch(0.94_0.044_160)] text-[oklch(0.36_0.097_160)]",
  matricula: "bg-[oklch(0.95_0.053_80)] text-[oklch(0.42_0.114_80)]",
  gobernanza: "bg-[oklch(0.94_0.044_258)] text-[oklch(0.4_0.114_258)]",
  acceso: "bg-muted text-muted-foreground",
  plataforma: "bg-[oklch(0.94_0.044_258)] text-[oklch(0.38_0.106_258)]",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("es-NI", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function Auditoria() {
  const [cat, setCat] = useState<CategoriaEvento | "todas">("todas");
  const [q, setQ] = useState("");
  const eventos = useMemo(() => listarEventos(), []);

  const filtrados = eventos
    .filter((e) => cat === "todas" || e.categoria === cat)
    .filter(
      (e) =>
        !q ||
        [e.actor, e.accion, e.entidad, e.detalle, e.rol].join(" ").toLowerCase().includes(q.toLowerCase()),
    );

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileClock className="h-4 w-4" /> Gobernanza
          </div>
          <h1 className="font-display text-3xl mt-1">Bitácora de auditoría</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Registro append-only de accesos, acciones clínicas sensibles, cambios de matrícula y ajustes de
            facturación. Los registros no se pueden editar ni eliminar.
          </p>
        </div>
        <button
          onClick={() => descargarCSV(`bitacora-cie-${Date.now()}.csv`, eventosCSV(filtrados))}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-sm hover:bg-muted/60"
        >
          <Download className="h-4 w-4" /> Exportar CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-2.5 py-1.5 text-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar actor, acción o entidad…"
            className="w-56 bg-transparent outline-none placeholder:text-muted-foreground/70"
          />
        </div>
        {categorias.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-3 py-1 text-xs border ${
              cat === c ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted/60"
            }`}
          >
            {c === "todas" ? "Todas" : categoriaLabel[c]}
          </button>
        ))}
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" /> {filtrados.length} registros inmutables
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Fecha</th>
              <th className="text-left px-4 py-3 font-medium">Actor / rol</th>
              <th className="text-left px-4 py-3 font-medium">Categoría</th>
              <th className="text-left px-4 py-3 font-medium">Acción</th>
              <th className="text-left px-4 py-3 font-medium">Entidad y detalle</th>
              <th className="text-left px-4 py-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((e) => (
              <tr key={e.id} className="border-t border-border/50 align-top">
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{fmt(e.fecha)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{e.actor}</div>
                  <div className="text-xs text-muted-foreground">{e.rol}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[0.7rem] ${tono[e.categoria]}`}>
                    {categoriaLabel[e.categoria]}
                  </span>
                </td>
                <td className="px-4 py-3">{e.accion}</td>
                <td className="px-4 py-3">
                  <div>{e.entidad}</div>
                  <div className="text-xs text-muted-foreground">{e.detalle}</div>
                  {e.justificacion && (
                    <div className="text-xs mt-1 rounded-md bg-muted/60 px-2 py-1">
                      <span className="font-medium">Justificación: </span>
                      {e.justificacion}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{e.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
