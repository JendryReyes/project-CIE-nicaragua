import { createFileRoute } from "@tanstack/react-router";
import { Check, X, Minus, Heart, Globe, Receipt, Users, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/benchmark")({
  head: () => ({ meta: [{ title: "Benchmark · CIE vs CentralReach, Hi Rasmus, Office Puzzle" }] }),
  component: Benchmark,
});

type Cell = boolean | "partial" | string;

const features: { area: string; items: { feat: string; cie: Cell; cr: Cell; hr: Cell; op: Cell; nota?: string }[] }[] = [
  {
    area: "Modelo terapéutico",
    items: [
      { feat: "Solo ABA / análisis conductual", cie: false, cr: true, hr: true, op: true },
      { feat: "Diagnóstico clínico integrado", cie: true, cr: "partial", hr: false, op: false },
      { feat: "Fisioterapia sensorial", cie: true, cr: false, hr: false, op: false, nota: "Único en su categoría" },
      { feat: "Logopedia y terapia de lenguaje", cie: true, cr: "partial", hr: false, op: "partial" },
      { feat: "Expediente único multi-área", cie: true, cr: false, hr: false, op: false },
    ],
  },
  {
    area: "Contexto local Nicaragua",
    items: [
      { feat: "Español de Nicaragua nativo", cie: true, cr: false, hr: false, op: "partial" },
      { feat: "Flujo de cobro INSS", cie: true, cr: false, hr: false, op: false, nota: "Diseñado al manual CIE" },
      { feat: "Gestión de colillas del cotizante", cie: true, cr: false, hr: false, op: false },
      { feat: "Formatos legales nicaragüenses", cie: true, cr: false, hr: false, op: false },
      { feat: "Soporte en horario CA", cie: true, cr: "partial", hr: false, op: true },
    ],
  },
  {
    area: "Experiencia para familias",
    items: [
      { feat: "Portal de padres bilingüe", cie: true, cr: true, hr: "partial", op: true },
      { feat: "Consentimientos digitales firmables", cie: true, cr: "partial", hr: false, op: false },
      { feat: "Mensajería terapeuta-familia", cie: true, cr: true, hr: true, op: true },
      { feat: "Reportes claros para familias no técnicas", cie: true, cr: false, hr: "partial", op: false },
    ],
  },
  {
    area: "Operación diaria",
    items: [
      { feat: "Toma de asistencia móvil", cie: true, cr: true, hr: true, op: true },
      { feat: "Horario semanal por terapeuta/sala", cie: true, cr: true, hr: "partial", op: true },
      { feat: "Carga horaria balanceada", cie: true, cr: true, hr: "partial", op: "partial" },
      { feat: "Precio mensual accesible", cie: "<$200", cr: ">$2,000", hr: ">$800", op: ">$500" },
    ],
  },
];

function Cell({ v }: { v: Cell }) {
  if (v === true) return <Check className="h-4 w-4 text-[oklch(0.55_0.12_155)] mx-auto" />;
  if (v === false) return <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  if (v === "partial") return <Minus className="h-4 w-4 text-[oklch(0.6_0.12_60)] mx-auto" />;
  return <span className="text-xs tabular text-foreground">{v}</span>;
}

function Benchmark() {
  return (
    <div className="space-y-10 max-w-[1400px]">
      {/* Hero */}
      <div className="rounded-3xl bg-[oklch(0.32_0.06_38)] text-[oklch(0.97_0.02_75)] p-10 lg:p-12 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-10 -bottom-20 h-64 w-64 rounded-full bg-[oklch(0.7_0.12_60)]/15 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wider">
            <Sparkles className="h-3 w-3" /> Benchmark estratégico
          </div>
          <h1 className="font-display text-4xl lg:text-5xl mt-5 leading-[1.05] text-balance">
            CIE vs CentralReach, Hi Rasmus y Office Puzzle.
          </h1>
          <p className="mt-4 text-[oklch(0.86_0.03_75)] text-lg leading-relaxed max-w-2xl">
            Las plataformas globales fueron diseñadas para clínicas ABA en Estados Unidos y Europa. El CIE atiende un modelo distinto, con un sistema de salud distinto. Esta es nuestra ventaja.
          </p>
        </div>
      </div>

      {/* Tres pilares */}
      <div className="grid md:grid-cols-3 gap-5">
        <Pilar icon={<Heart className="h-5 w-5" />} title="Integral, no solo ABA" body="Un solo expediente que conecta diagnóstico, fisioterapia sensorial, logopedia y conducta. Los demás cubren uno o dos." />
        <Pilar icon={<Receipt className="h-5 w-5" />} title="Hecho para el INSS" body="Flujo de colillas, lotes mensuales y formatos diseñados a partir del manual del CIE. Ningún competidor lo tiene." />
        <Pilar icon={<Users className="h-5 w-5" />} title="Diseñado para familias nicas" body="Lenguaje claro, móvil-primero, consentimientos digitales. Sin jerga clínica extranjera." />
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
        <div className="grid grid-cols-[1.6fr_repeat(4,1fr)] border-b border-border/60 bg-muted/40">
          <div className="p-4 text-xs uppercase tracking-wider text-muted-foreground">Capacidad</div>
          <Col t="CIE" highlight />
          <Col t="CentralReach" sub="EE.UU." />
          <Col t="Hi Rasmus" sub="Europa" />
          <Col t="Office Puzzle" sub="LatAm" />
        </div>
        {features.map((g) => (
          <div key={g.area}>
            <div className="px-4 py-2 text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground bg-muted/30 border-b border-border/40">
              {g.area}
            </div>
            {g.items.map((it) => (
              <div key={it.feat} className="grid grid-cols-[1.6fr_repeat(4,1fr)] border-b border-border/40 last:border-0 items-center hover:bg-muted/30">
                <div className="p-3 text-sm">
                  {it.feat}
                  {it.nota && <div className="text-[0.65rem] text-primary mt-0.5">{it.nota}</div>}
                </div>
                <div className="p-3 text-center bg-primary/[0.04]"><Cell v={it.cie} /></div>
                <div className="p-3 text-center"><Cell v={it.cr} /></div>
                <div className="p-3 text-center"><Cell v={it.hr} /></div>
                <div className="p-3 text-center"><Cell v={it.op} /></div>
              </div>
            ))}
          </div>
        ))}
        <div className="flex items-center gap-5 p-4 text-xs text-muted-foreground border-t border-border/60 bg-muted/20">
          <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[oklch(0.55_0.12_155)]" /> Cubierto</span>
          <span className="inline-flex items-center gap-1.5"><Minus className="h-3.5 w-3.5 text-[oklch(0.6_0.12_60)]" /> Parcial</span>
          <span className="inline-flex items-center gap-1.5"><X className="h-3.5 w-3.5 text-muted-foreground/50" /> No disponible</span>
        </div>
      </div>

      {/* Conclusión */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <Globe className="h-6 w-6 text-primary mb-3" />
          <h3 className="font-display text-2xl">No es traducir software gringo. Es construirlo para Nicaragua.</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Las plataformas internacionales son potentes en su contexto, pero asumen prácticas clínicas, sistemas de pago y vocabularios que no son los nuestros. La plataforma del CIE se construye desde el manual de prestación de servicios — para que la herramienta no estorbe al trabajo.
        </p>
      </div>
    </div>
  );
}

function Col({ t, sub, highlight }: { t: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`p-4 text-center ${highlight ? "bg-primary/10" : ""}`}>
      <div className={`font-display ${highlight ? "text-primary" : ""}`}>{t}</div>
      {sub && <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function Pilar({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6">
      <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary mb-4">{icon}</div>
      <h3 className="font-display text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{body}</p>
    </div>
  );
}
