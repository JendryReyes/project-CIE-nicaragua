import { iniciales } from "@/lib/demo-data";

const palette = [
  "bg-[oklch(0.9_0.05_38)] text-[oklch(0.4_0.12_38)]",
  "bg-[oklch(0.9_0.05_155)] text-[oklch(0.36_0.1_155)]",
  "bg-[oklch(0.9_0.05_280)] text-[oklch(0.36_0.1_280)]",
  "bg-[oklch(0.9_0.05_200)] text-[oklch(0.36_0.1_200)]",
  "bg-[oklch(0.9_0.05_75)] text-[oklch(0.4_0.12_75)]",
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
