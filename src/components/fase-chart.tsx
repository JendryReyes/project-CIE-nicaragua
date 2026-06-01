import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import type { Programa } from "@/lib/modelos-clinicos";

export function FaseChart({ programa }: { programa: Programa }) {
  const unidad = programa.medida === "% acierto" ? "%" : "";
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={programa.serie} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.89 0.018 65)" />
          <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "oklch(0.5 0.022 50)" }} />
          <YAxis tick={{ fontSize: 11, fill: "oklch(0.5 0.022 50)" }} unit={unidad} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.89 0.018 65)", background: "oklch(0.995 0.005 75)" }}
            formatter={(v: number) => [`${v}${unidad}`, programa.medida]}
            labelFormatter={(l) => `Sesión ${l}`}
          />
          {programa.cambiosFase.map((c) => {
            const punto = programa.serie.find((s) => s.sesion === c.sesion);
            if (!punto) return null;
            return (
              <ReferenceLine
                key={c.sesion}
                x={punto.fecha}
                stroke="oklch(0.605 0.135 38)"
                strokeDasharray="4 4"
                label={{ value: c.nota, position: "top", fontSize: 10, fill: "oklch(0.45 0.135 38)" }}
              />
            );
          })}
          {programa.medida === "% acierto" && (
            <ReferenceLine
              y={programa.criterio.umbral}
              stroke="oklch(0.62 0.11 155)"
              strokeDasharray="2 4"
              label={{ value: `Criterio ${programa.criterio.umbral}%`, position: "right", fontSize: 10, fill: "oklch(0.45 0.11 155)" }}
            />
          )}
          <Line type="monotone" dataKey="valor" stroke="oklch(0.605 0.135 38)" strokeWidth={2.5} dot={{ r: 4, fill: "oklch(0.605 0.135 38)" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
