import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ScanLine, XCircle, QrCode } from "lucide-react";
import { ninos, ninoById, sesionesHoy } from "@/lib/demo-data";
import { decodificarQR } from "@/lib/qr-asistencia";
import cieLogo from "@/assets/cie-logo.png.asset.json";

export const Route = createFileRoute("/kiosko")({
  head: () => ({ meta: [{ title: "Kiosko · CIE" }] }),
  component: Kiosko,
});

type Resultado = {
  estado: "ok" | "sin_sesion" | "invalido";
  nombre?: string;
  detalle?: string;
};

function Kiosko() {
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [codigo, setCodigo] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const t = setInterval(() => inputRef.current?.focus(), 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!resultado) return;
    const t = setTimeout(() => setResultado(null), 3000);
    return () => clearTimeout(t);
  }, [resultado]);

  const procesar = (raw: string) => {
    const dec = decodificarQR(raw);
    if (!dec || !dec.valido) {
      setResultado({ estado: "invalido", detalle: raw });
      setCodigo("");
      return;
    }
    const nino = ninoById(dec.ninoId);
    if (!nino) {
      setResultado({ estado: "invalido", detalle: dec.ninoId });
      setCodigo("");
      return;
    }
    const sesion = sesionesHoy.find((s) => s.ninoId === dec.ninoId);
    if (!sesion) {
      setResultado({ estado: "sin_sesion", nombre: nino.nombre });
    } else {
      setResultado({
        estado: "ok",
        nombre: nino.nombre,
        detalle: `${sesion.hora} · ${sesion.area.toUpperCase()} · ${sesion.sala}`,
      });
    }
    setCodigo("");
  };

  return (
    <div className="fixed inset-0 bg-[#1A1A1A] text-primary-foreground flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2 opacity-70">
          <img src={cieLogo.url} alt="CIE" className="h-8 w-8 rounded bg-card p-1" />
          <span className="text-sm">CIE · Kiosko de recepción</span>
        </div>
        <Link to="/asistencia" className="text-xs text-primary-foreground/40 hover:text-primary-foreground">Salir</Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        {resultado ? (
          <ResultadoPantalla r={resultado} />
        ) : (
          <EsperaPantalla />
        )}
      </main>

      <form onSubmit={(e) => { e.preventDefault(); if (codigo.trim()) procesar(codigo); }} className="px-6 pb-6">
        <input
          ref={inputRef}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Escanea o ingresa código (Enter)"
          className="w-full bg-card/5 border border-primary-foreground/10 rounded-lg px-4 py-3 text-sm text-primary-foreground placeholder-white/30 font-mono focus:outline-none focus:border-primary-foreground/40"
        />
        <div className="flex gap-1.5 flex-wrap mt-2 justify-center">
          {ninos.slice(0, 5).map((n) => (
            <button key={n.id} type="button" onClick={() => procesar(n.id)}
              className="text-[10px] rounded-full bg-card/5 hover:bg-card/10 px-3 py-1 text-primary-foreground/60">
              demo: {n.id} {n.nombre.split(" ")[0]}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}

function EsperaPantalla() {
  return (
    <div className="text-center">
      <div className="relative h-72 w-72 mx-auto mb-8">
        <div className="absolute inset-0 border-2 border-[#2D7A4A] rounded-3xl" />
        <div className="absolute inset-x-0 h-0.5 bg-[#2D7A4A] shadow-[0_0_30px_#2D7A4A]" style={{ animation: "kioskoscan 2.4s ease-in-out infinite" }} />
        <QrCode className="absolute inset-0 m-auto h-32 w-32 text-primary-foreground/15" />
      </div>
      <h2 className="font-display text-5xl mb-3">Acerca el carnet de tu hijo</h2>
      <p className="text-primary-foreground/50 text-lg">El sistema registrará la asistencia automáticamente</p>
      <style>{`@keyframes kioskoscan { 0%, 100% { top: 8%; } 50% { top: 88%; } }`}</style>
    </div>
  );
}

function ResultadoPantalla({ r }: { r: Resultado }) {
  if (r.estado === "ok") {
    return (
      <div className="text-center bg-[#2D7A4A] -mx-6 px-6 py-20 rounded-3xl w-full max-w-2xl animate-in fade-in zoom-in duration-200">
        <CheckCircle2 className="h-32 w-32 mx-auto mb-6 text-primary-foreground" strokeWidth={1.5} />
        <h2 className="font-display text-5xl mb-3">✓ {r.nombre}</h2>
        <p className="text-primary-foreground/80 text-xl">{r.detalle}</p>
        <p className="text-primary-foreground/60 text-sm mt-6">Asistencia registrada</p>
      </div>
    );
  }
  if (r.estado === "sin_sesion") {
    return (
      <div className="text-center bg-[#C8932B] -mx-6 px-6 py-20 rounded-3xl w-full max-w-2xl">
        <ScanLine className="h-24 w-24 mx-auto mb-6 text-primary-foreground" strokeWidth={1.5} />
        <h2 className="font-display text-4xl mb-3">{r.nombre}</h2>
        <p className="text-primary-foreground/90 text-xl">No hay sesión programada para hoy</p>
      </div>
    );
  }
  return (
    <div className="text-center bg-[#C0392B] -mx-6 px-6 py-20 rounded-3xl w-full max-w-2xl">
      <XCircle className="h-24 w-24 mx-auto mb-6 text-primary-foreground" />
      <h2 className="font-display text-4xl mb-3">Código no reconocido</h2>
      <p className="text-primary-foreground/80 text-base">Intenta nuevamente o pide ayuda a recepción</p>
    </div>
  );
}
