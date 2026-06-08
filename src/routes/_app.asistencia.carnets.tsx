import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { Download, Package, QrCode, ArrowLeft, CheckCircle2 } from "lucide-react";
import { ninos, iniciales } from "@/lib/demo-data";
import { generarQRPayload } from "@/lib/qr-asistencia";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/asistencia/carnets")({
  head: () => ({ meta: [{ title: "Carnets QR · CIE" }] }),
  component: Carnets,
});

function Carnets() {
  const [emitidos, setEmitidos] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ninos.map((n) => [n.id, true]))
  );

  const generarPDF = async (ninoId: string, nombre: string): Promise<Blob> => {
    const doc = new jsPDF({ unit: "mm", format: [85, 54] }); // tarjeta tamaño carnet
    const qrData = generarQRPayload(ninoId);
    const qrUrl = await QRCode.toDataURL(qrData, { margin: 0, width: 200 });
    // Fondo
    doc.setFillColor(245, 240, 232);
    doc.rect(0, 0, 85, 54, "F");
    // Encabezado
    doc.setFillColor(45, 122, 74);
    doc.rect(0, 0, 85, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text("CIE · Centro Edu-Terapéutico", 3, 5);
    // QR
    doc.addImage(qrUrl, "PNG", 4, 12, 22, 22);
    // Nombre
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(nombre, 30, 18, { maxWidth: 52 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`ID: ${ninoId}`, 30, 24);
    doc.text(`Emitido: ${new Date().toLocaleDateString("es-NI")}`, 30, 28);
    doc.setFontSize(6);
    doc.text("Presentar al ingresar · escaneo automático", 4, 50);
    return doc.output("blob");
  };

  const descargarIndividual = async (id: string, nombre: string) => {
    const blob = await generarPDF(id, nombre);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `Carnet-${id}-${nombre.split(" ")[0]}.pdf`; a.click();
    URL.revokeObjectURL(url);
    setEmitidos((e) => ({ ...e, [id]: true }));
    toast.success(`Carnet de ${nombre} generado`);
  };

  const descargarTodos = async () => {
    toast.info("Generando ZIP con todos los carnets...");
    const zip = new JSZip();
    for (const n of ninos) {
      const blob = await generarPDF(n.id, n.nombre);
      zip.file(`Carnet-${n.id}-${n.nombre.split(" ")[0]}.pdf`, blob);
    }
    const out = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(out);
    const a = document.createElement("a");
    a.href = url; a.download = `Carnets-CIE-${new Date().toISOString().slice(0, 10)}.zip`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`${ninos.length} carnets exportados`);
  };

  const emitidosCount = Object.values(emitidos).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-[1100px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <Link to="/asistencia" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-3 w-3" /> Volver a Asistencia
          </Link>
          <h1 className="font-display text-3xl">Carnets QR</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {emitidosCount} / {ninos.length} carnets emitidos
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/kiosko" target="_blank" className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium">
            <QrCode className="h-4 w-4" /> Abrir kiosko
          </Link>
          <button onClick={descargarTodos} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">
            <Package className="h-4 w-4" /> Generar todos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ninos.map((n) => (
          <CarnetPreview key={n.id} ninoId={n.id} nombre={n.nombre} emitido={!!emitidos[n.id]} onGenerar={() => descargarIndividual(n.id, n.nombre)} />
        ))}
      </div>
    </div>
  );
}

function CarnetPreview({ ninoId, nombre, emitido, onGenerar }: { ninoId: string; nombre: string; emitido: boolean; onGenerar: () => void; }) {
  const [qrUrl, setQrUrl] = useState<string>("");
  useEffect(() => {
    QRCode.toDataURL(generarQRPayload(ninoId), { margin: 0, width: 120 }).then(setQrUrl);
  }, [ninoId]);
  return (
    <article className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="h-20 w-20 rounded-lg bg-muted grid place-items-center shrink-0">
          {qrUrl ? <img src={qrUrl} alt="QR" className="h-16 w-16" /> : <QrCode className="h-8 w-8 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{nombre}</div>
          <div className="text-xs text-muted-foreground">ID: {ninoId} · {iniciales(nombre)}</div>
          {emitido && (
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] uppercase tracking-wider rounded-full bg-[oklch(0.94_0.06_155)] text-[oklch(0.4_0.12_155)] px-2 py-0.5">
              <CheckCircle2 className="h-3 w-3" /> Emitido
            </span>
          )}
        </div>
      </div>
      <button onClick={onGenerar} className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-border/70 px-3 py-1.5 text-xs hover:bg-muted">
        <Download className="h-3 w-3" /> Generar carnet PDF
      </button>
    </article>
  );
}
