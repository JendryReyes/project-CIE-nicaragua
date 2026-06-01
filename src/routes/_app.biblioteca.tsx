import { createFileRoute } from "@tanstack/react-router";
import { catalogoCIE } from "@/lib/catalogo-cie";
import { BookOpen, Users } from "lucide-react";

export const Route = createFileRoute("/_app/biblioteca")({
  head: () => ({ meta: [{ title: "Biblioteca clínica · CIE" }] }),
  component: Biblioteca,
});

function Biblioteca() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>Catálogo de servicios CIE</span>
        </div>
        <h1 className="font-display text-4xl mt-1">Biblioteca clínica</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Servicios nativos del CIE con cupos INSS, rango de edad, modalidad y modelos clínicos asociados.
          Cada servicio activa plantillas específicas en el expediente.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {catalogoCIE.map((s) => {
          const pct = Math.round((s.cupoOcupado / s.cupoINSS) * 100);
          const lleno = pct >= 90;
          return (
            <div key={s.id} className="rounded-2xl border border-border/70 bg-card p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">{s.area}</div>
                  <h3 className="font-display text-lg mt-0.5">{s.nombre}</h3>
                </div>
                <span className="rounded-full bg-primary/10 text-primary text-[0.65rem] px-2 py-0.5 font-medium">{s.modalidad}</span>
              </div>
              <p className="text-sm text-muted-foreground flex-1">{s.descripcion}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {s.modelos.map((m) => (
                  <span key={m} className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[0.65rem]">{m}</span>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground inline-flex items-center gap-1"><Users className="h-3 w-3" /> Cupo INSS</span>
                  <span className={`tabular font-medium ${lleno ? "text-[oklch(0.55_0.13_60)]" : ""}`}>{s.cupoOcupado}/{s.cupoINSS}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${lleno ? "bg-[oklch(0.65_0.13_60)]" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[0.65rem] text-muted-foreground">Edad: {s.edadMin}–{s.edadMax} años</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
