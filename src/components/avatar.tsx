import { iniciales } from "@/lib/demo-data";

const palette = [
  "bg-[oklch(0.9_0.044_30)] text-[oklch(0.4_0.106_30)]",
  "bg-[oklch(0.9_0.044_160)] text-[oklch(0.36_0.088_160)]",
  "bg-[oklch(0.9_0.044_292)] text-[oklch(0.36_0.088_292)]",
  "bg-[oklch(0.9_0.044_258)] text-[oklch(0.36_0.088_258)]",
  "bg-[oklch(0.9_0.044_80)] text-[oklch(0.4_0.106_80)]",
];

export function Avatar({ nombre, size = 36 }: { nombre: string; size?: number }) {
  const hash = nombre.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const cls = palette[hash % palette.length];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium ${cls}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {iniciales(nombre)}
    </span>
  );
}
