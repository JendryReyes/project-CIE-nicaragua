import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Calendar, FileText, MessageSquare, Pen, CheckCircle2, Download, Send } from "lucide-react";
import { firmasPendientesDemo, agregarFirma } from "@/lib/firmas-digitales";
import { toast } from "sonner";

export const Route = createFileRoute("/mi-hijo")({
  head: () => ({ meta: [{ title: "Portal de familia · CIE" }] }),
  component: PortalFamilia,
});

function PortalFamilia() {
  const [pendientes, setPendientes] = useState(firmasPendientesDemo());
  const [firmando, setFirmando] = useState<string | null>(null);

  const onFirmar = (id: string, dataUrl: string) => {
    const pend = pendientes.find((p) => p.id === id);
    if (!pend) return;
    agregarFirma({
      familiaId: "fam-001",
      ninoId: "001",
      semana: pend.semana, mes: pend.mes, anio: pend.anio,
      signatureDataUrl: dataUrl,
      contenidoFirmado: {
        semana: pend.semana,
        sesiones: pend.sesiones,
        totalHoras: pend.sesiones.reduce((s, x) => s + x.horas, 0),
      },
    });
    setPendientes(pendientes.filter((p) => p.id !== id));
    setFirmando(null);
    toast.success("Documento firmado correctamente");
  };

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-foreground">
      <header className="max-w-3xl mx-auto px-5 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/15 text-primary grid place-items-center font-display">MG</div>
          <div>
            <p className="text-xs text-muted-foreground">Hola, familia López 👋</p>
            <h1 className="font-display text-xl">Mateo Gutiérrez</h1>
          </div>
        </div>
        <button className="text-xs text-muted-foreground hover:text-foreground">Cerrar sesión</button>
      </header>

      <main className="max-w-3xl mx-auto px-5 pb-12 space-y-6">
        {/* Resumen semana */}
        <section className="bg-card rounded-3xl shadow-sm p-6">
          <h2 className="font-display text-lg mb-4">Resumen de esta semana</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Días asistidos</div>
              <div className="font-display text-3xl mt-1 tabular">4 / 5</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Horas ABA</div>
              <div className="font-display text-3xl mt-1 tabular">8h</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Horas Logopedia</div>
              <div className="font-display text-3xl mt-1 tabular">1h</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-primary/5 p-4">
            <Calendar className="h-5 w-5 text-primary shrink-0" />
            <div className="text-sm">
              <div className="font-medium">Próxima sesión</div>
              <div className="text-muted-foreground">Mañana, martes 3 de junio · 8:00 AM · Lic. María Castellón · Sala 2</div>
            </div>
          </div>
        </section>

        {/* Firmas pendientes */}
        {pendientes.length > 0 && (
          <section className="bg-[#FDF6E3] border border-[oklch(0.85_0.088_80)] rounded-3xl p-6">
            <div className="flex items-center gap-2 text-[oklch(0.45_0.114_80)] font-medium">
              <Pen className="h-4 w-4" /> Tienes {pendientes.length} documento{pendientes.length > 1 ? "s" : ""} pendiente{pendientes.length > 1 ? "s" : ""} de firma
            </div>
            {pendientes.map((p) => (
              <div key={p.id} className="mt-4 bg-card rounded-2xl p-4">
                <div className="font-medium">{p.titulo}</div>
                <table className="w-full text-xs mt-3">
                  <thead className="text-muted-foreground">
                    <tr><th className="text-left">Fecha</th><th className="text-left">Área</th><th className="text-right">Horas</th></tr>
                  </thead>
                  <tbody>
                    {p.sesiones.map((s, i) => (
                      <tr key={i} className="border-t border-border/30">
                        <td className="py-1.5">{s.fecha}</td>
                        <td>{s.area}</td>
                        <td className="text-right tabular">{s.horas}h</td>
                      </tr>
                    ))}
                    <tr className="border-t border-border/60 font-medium">
                      <td className="py-1.5" colSpan={2}>Total</td>
                      <td className="text-right tabular">{p.sesiones.reduce((s, x) => s + x.horas, 0)}h</td>
                    </tr>
                  </tbody>
                </table>
                <button
                  onClick={() => setFirmando(p.id)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#2D7A4A] text-primary-foreground px-4 py-3 text-base font-medium"
                >
                  <Pen className="h-4 w-4" /> Firmar ahora
                </button>
              </div>
            ))}
          </section>
        )}

        {pendientes.length === 0 && (
          <section className="bg-card rounded-3xl p-6 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto text-[oklch(0.55_0.141_160)] mb-2" />
            <p className="font-medium">¡Todo al día!</p>
            <p className="text-xs text-muted-foreground mt-1">No hay documentos pendientes de firma.</p>
          </section>
        )}

        {/* Historial */}
        <section className="bg-card rounded-3xl p-6">
          <h2 className="font-display text-lg mb-4">Historial de asistencia · últimas 8 semanas</h2>
          <div className="flex items-end gap-2 h-32">
            {[5, 4, 5, 3, 5, 4, 5, 4].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-[#2D7A4A]" style={{ height: `${(v / 5) * 100}%` }} />
                <span className="text-[10px] text-muted-foreground tabular">S{15 + i}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-card rounded-3xl p-6">
          <h2 className="font-display text-lg mb-3">Últimos informes compartidos</h2>
          {["Informe mensual mayo 2026", "Reporte VB-MAPP feb 2026"].map((t, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-t border-border/40 first:border-t-0 text-sm">
              <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> {t}</span>
              <button className="text-xs text-primary hover:underline inline-flex items-center gap-1"><Download className="h-3 w-3" /> Descargar</button>
            </div>
          ))}
        </section>

        <section className="bg-card rounded-3xl p-6">
          <h2 className="font-display text-lg mb-3">Comunicación con el equipo</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <Mensaje quien="Lic. Andrea Rivas · Especialista de familia" texto="Mateo tuvo una excelente semana, completó 3 programas nuevos. ¡Felicidades!" hora="Ayer · 4:32 PM" propio={false} />
            <Mensaje quien="Tú" texto="¡Muchas gracias! ¿Cuándo es la próxima reunión de seguimiento?" hora="Ayer · 5:15 PM" propio />
            <Mensaje quien="Lic. Andrea Rivas" texto="La próxima semana viernes a las 10am. Te confirmo por aquí." hora="Hoy · 9:02 AM" propio={false} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); toast.success("Mensaje enviado"); (e.currentTarget as HTMLFormElement).reset(); }} className="mt-3 flex gap-2">
            <input name="msg" placeholder="Escribe un mensaje..." className="flex-1 rounded-full bg-muted/50 border border-border/40 px-4 py-2 text-sm focus:outline-none focus:border-primary" />
            <button className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5"><Send className="h-3.5 w-3.5" /> Enviar</button>
          </form>
        </section>
      </main>

      {firmando && (
        <CanvasFirma
          onCancel={() => setFirmando(null)}
          onConfirm={(url) => onFirmar(firmando, url)}
        />
      )}
    </div>
  );
}

function Mensaje({ quien, texto, hora, propio }: { quien: string; texto: string; hora: string; propio: boolean }) {
  return (
    <div className={`flex flex-col ${propio ? "items-end" : "items-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${propio ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{texto}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{quien} · {hora}</div>
    </div>
  );
}

function CanvasFirma({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: (dataUrl: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [tieneTrazo, setTieneTrazo] = useState(false);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    ctx.lineWidth = 2; ctx.strokeStyle = "#111"; ctx.lineCap = "round";
  }, []);

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    const c = ref.current!;
    const rect = c.getBoundingClientRect();
    const ctx = c.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const c = ref.current!;
    const rect = c.getBoundingClientRect();
    const ctx = c.getContext("2d")!;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setTieneTrazo(true);
  };
  const end = () => { drawing.current = false; };
  const limpiar = () => {
    const c = ref.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setTieneTrazo(false);
  };

  return (
    <div className="fixed inset-0 bg-foreground/40 z-50 grid place-items-center p-4">
      <div className="bg-card rounded-3xl p-6 w-full max-w-lg">
        <h3 className="font-display text-lg">Firma con tu dedo o mouse</h3>
        <p className="text-xs text-muted-foreground mt-1">Esta firma se registra con sello de tiempo y hash de verificación.</p>
        <canvas
          ref={ref}
          width={480}
          height={200}
          className="mt-4 w-full border-2 border-dashed border-border rounded-xl touch-none bg-muted/20"
          onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end}
        />
        <div className="flex gap-2 mt-4">
          <button onClick={limpiar} className="px-4 py-2 rounded-full border border-border text-sm">Limpiar</button>
          <button onClick={onCancel} className="ml-auto px-4 py-2 rounded-full border border-border text-sm">Cancelar</button>
          <button
            disabled={!tieneTrazo}
            onClick={() => onConfirm(ref.current!.toDataURL("image/png"))}
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            Confirmar firma
          </button>
        </div>
      </div>
    </div>
  );
}
