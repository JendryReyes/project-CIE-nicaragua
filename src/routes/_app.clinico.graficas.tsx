import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend,
} from "recharts";
import { Sparkles, Download, FileText, TrendingUp, Target } from "lucide-react";

export const Route = createFileRoute("/_app/clinico/graficas")({
  head: () => ({ meta: [{ title: "Gráficas de progreso · CIE" }] }),
  component: GraficasClinicas,
});

type Punto = { sesion: number; fecha: string; pct: number; terapeuta: string; prompt: string };

const DATOS_MATEO_PECS: Punto[] = [
  { sesion: 1, fecha: "01/04", pct: 20, terapeuta: "Ana", prompt: "Física completa" },
  { sesion: 2, fecha: "03/04", pct: 25, terapeuta: "Ana", prompt: "Física completa" },
  { sesion: 3, fecha: "07/04", pct: 30, terapeuta: "Carlos", prompt: "Física parcial" },
  { sesion: 4, fecha: "09/04", pct: 35, terapeuta: "Ana", prompt: "Física parcial" },
  { sesion: 5, fecha: "14/04", pct: 40, terapeuta: "Ana", prompt: "Física parcial" },
  { sesion: 6, fecha: "28/04", pct: 45, terapeuta: "Ana", prompt: "Gestual" },
  { sesion: 7, fecha: "30/04", pct: 50, terapeuta: "Carlos", prompt: "Gestual" },
  { sesion: 8, fecha: "05/05", pct: 55, terapeuta: "Ana", prompt: "Gestual" },
  { sesion: 9, fecha: "07/05", pct: 60, terapeuta: "Ana", prompt: "Gestual" },
  { sesion: 10, fecha: "12/05", pct: 58, terapeuta: "Carlos", prompt: "Gestual" },
  { sesion: 11, fecha: "14/05", pct: 65, terapeuta: "Ana", prompt: "Gestual" },
  { sesion: 12, fecha: "19/05", pct: 68, terapeuta: "Ana", prompt: "Gestual" },
  { sesion: 13, fecha: "21/05", pct: 70, terapeuta: "Carlos", prompt: "Gestual" },
  { sesion: 14, fecha: "26/05", pct: 73, terapeuta: "Ana", prompt: "Gestual" },
  { sesion: 15, fecha: "02/06", pct: 75, terapeuta: "Ana", prompt: "Gestual" },
];

// Tendencia ascendente promedio últimas 8
const ultimas8 = DATOS_MATEO_PECS.slice(-8);
const pendiente =
  (ultimas8[ultimas8.length - 1].pct - ultimas8[0].pct) / (ultimas8.length - 1);
const promedioUltimaSemana =
  Math.round(DATOS_MATEO_PECS.slice(-3).reduce((a, p) => a + p.pct, 0) / 3);
const sesionesParaMeta = Math.max(1, Math.ceil((90 - 75) / pendiente));

function GraficasClinicas() {
  const [nino, setNino] = useState("Mateo Gutiérrez López");
  const [programa, setPrograma] = useState("Mando con imagen PECS — Nivel 1");

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.94_0.07_292)] text-[oklch(0.35_0.132_292)] px-3 py-1 text-[11px] font-medium mb-2">
            <Sparkles className="h-3 w-3" /> Módulo clínico ABA · Etapa 2
          </div>
          <h1 className="font-display text-3xl">Gráficas de progreso</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Análisis visual + IA sobre datos de sesión por programa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm hover:bg-muted">
            <Download className="h-4 w-4" /> Exportar gráfica
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90">
            <FileText className="h-4 w-4" /> Informe IA
          </button>
        </div>
      </div>

      {/* Selectores */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Niño</label>
        <select
          value={nino}
          onChange={(e) => setNino(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
        >
          <option>Mateo Gutiérrez López</option>
          <option>Noah Centeno Ríos</option>
          <option>Samuel Membreño Pavón</option>
        </select>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Programa</label>
        <select
          value={programa}
          onChange={(e) => setPrograma(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
        >
          <option>Mando con imagen PECS — Nivel 1</option>
          <option>Imitación motora gruesa</option>
          <option>Tacto de objetos comunes</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Info programa */}
        <div className="lg:col-span-2 rounded-2xl border border-border/70 bg-card p-5 space-y-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Programa</div>
            <h3 className="font-display text-lg leading-tight mt-1">{programa}</h3>
          </div>

          <Field label="Definición operacional">
            El niño señala la imagen del objeto deseado y vocaliza o aproxima el nombre en presencia
            del objeto reforzador, sin promp físico, en al menos 9 de 10 oportunidades.
          </Field>
          <Field label="Tipo de medición">Porcentaje de oportunidades correctas</Field>
          <Field label="Criterio de masterización">
            ≥ 90% en 3 sesiones consecutivas con 2 terapeutas diferentes
          </Field>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[oklch(0.94_0.053_160)] text-[oklch(0.35_0.106_160)] px-2.5 py-0.5 text-xs font-medium">
              En adquisición
            </span>
            <span className="text-xs text-muted-foreground">Fase actual</span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progreso hacia criterio</span>
              <span className="tabular font-medium">73% / 90%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${(73 / 90) * 100}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
            <Mini icon={<TrendingUp className="h-3.5 w-3.5 text-[oklch(0.55_0.088_160)]" />} label="Pendiente" value={`+${pendiente.toFixed(1)}%`} />
            <Mini icon={<Target className="h-3.5 w-3.5 text-primary" />} label="Promedio 7d" value={`${promedioUltimaSemana}%`} />
            <Mini icon={<Sparkles className="h-3.5 w-3.5 text-[oklch(0.55_0.114_292)]" />} label="ETA criterio" value={`~${sesionesParaMeta} ses.`} />
          </div>
        </div>

        {/* Gráfica */}
        <div className="lg:col-span-3 rounded-2xl border border-border/70 bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-lg">Serie por sesión</h3>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-[oklch(0.55_0.141_292)]" /> % correcto</span>
              <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-[oklch(0.55_0.158_45)]" /> Criterio 90%</span>
              <span className="flex items-center gap-1"><span className="h-2 w-0.5 bg-muted-foreground/50" /> Cambio fase</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={DATOS_MATEO_PECS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 265)" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "oklch(0.5 0.014 265)" }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "oklch(0.5 0.014 265)" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.89 0.014 265)", background: "oklch(0.995 0.005 265)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const p = payload[0].payload as Punto;
                    return (
                      <div className="rounded-xl border border-border/70 bg-card px-3 py-2 text-xs shadow-md">
                        <div className="font-medium">Sesión {p.sesion} · {p.fecha}</div>
                        <div className="tabular text-base font-display mt-0.5">{p.pct}%</div>
                        <div className="text-muted-foreground mt-1">Terapeuta: {p.terapeuta}</div>
                        <div className="text-muted-foreground">Prompt: {p.prompt}</div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine
                  y={90}
                  stroke="oklch(0.55 0.158 45)"
                  strokeDasharray="4 4"
                  label={{ value: "Criterio 90%", position: "right", fontSize: 10, fill: "oklch(0.45 0.141 45)" }}
                />
                <ReferenceLine
                  x="14/04"
                  stroke="oklch(0.5 0.044 80)"
                  strokeDasharray="3 3"
                  label={{ value: "Cambio de fase → prompt gestual", position: "top", fontSize: 10, fill: "oklch(0.4 0.044 80)" }}
                />
                <Line
                  type="monotone"
                  dataKey="pct"
                  stroke="oklch(0.55 0.141 292)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "oklch(0.55 0.141 292)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Análisis IA */}
      <div className="rounded-2xl border border-[oklch(0.85_0.07_292)] bg-gradient-to-br from-[oklch(0.98_0.014_265)] to-[oklch(0.97_0.014_265)] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[oklch(0.92_0.07_292)]">
            <Sparkles className="h-4 w-4 text-[oklch(0.4_0.132_292)]" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg text-[oklch(0.3_0.106_292)]">Análisis IA del progreso</h3>
            <p className="text-sm text-foreground/85 mt-2 leading-relaxed">
              Durante las últimas <strong>8 sesiones</strong>, el programa muestra una tendencia
              ascendente consistente (pendiente <strong>+{pendiente.toFixed(1)}% por sesión</strong>).
              Mateo alcanzó <strong>{promedioUltimaSemana}% de promedio</strong> en la última semana.
              A este ritmo, se estima que alcanzará el criterio de masterización en aproximadamente{" "}
              <strong>{sesionesParaMeta} sesiones adicionales</strong>.
            </p>
            <p className="text-sm text-foreground/85 mt-2 leading-relaxed">
              <strong>Recomendación:</strong> continuar el procedimiento actual sin modificaciones y
              evaluar reducción gradual de prompts gestuales una vez se mantenga ≥ 80% en 2 sesiones
              consecutivas. El cambio de fase realizado el 14/04 (de prompt físico a gestual) tuvo
              impacto positivo claro en la tasa de adquisición.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full bg-card/60 px-2 py-0.5 border border-border/40">Sin estancamiento</span>
              <span className="rounded-full bg-card/60 px-2 py-0.5 border border-border/40">Variabilidad baja</span>
              <span className="rounded-full bg-card/60 px-2 py-0.5 border border-border/40">IOA estimado 92%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm mt-1 text-foreground/85">{children}</div>
    </div>
  );
}

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-2.5 py-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="font-display text-base tabular mt-0.5">{value}</div>
    </div>
  );
}
