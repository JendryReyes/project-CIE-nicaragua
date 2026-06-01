import { type ReactNode } from "react";
import type { Area } from "@/lib/demo-data";
import { areaLabels } from "@/lib/demo-data";

const styles: Record<Area, string> = {
  diagnostico: "bg-[oklch(0.94_0.04_280)] text-[oklch(0.32_0.08_280)] ring-[oklch(0.85_0.07_280)]",
  fisio: "bg-[oklch(0.94_0.05_50)] text-[oklch(0.36_0.1_50)] ring-[oklch(0.85_0.08_50)]",
  logopedia: "bg-[oklch(0.94_0.04_200)] text-[oklch(0.34_0.08_200)] ring-[oklch(0.85_0.07_200)]",
  conducta: "bg-[oklch(0.94_0.04_145)] text-[oklch(0.32_0.08_145)] ring-[oklch(0.85_0.07_145)]",
};

export function AreaBadge({ area, children }: { area: Area; children?: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[area]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children ?? areaLabels[area]}
    </span>
  );
}
