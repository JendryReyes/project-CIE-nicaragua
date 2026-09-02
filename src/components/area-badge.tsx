import { type ReactNode } from "react";
import type { Area } from "@/lib/demo-data";
import { areaLabels } from "@/lib/demo-data";

const styles: Record<Area, string> = {
  diagnostico: "bg-[oklch(0.94_0.035_292)] text-[oklch(0.32_0.07_292)] ring-[oklch(0.85_0.062_292)]",
  fisio: "bg-[oklch(0.94_0.044_80)] text-[oklch(0.36_0.088_80)] ring-[oklch(0.85_0.07_80)]",
  logopedia: "bg-[oklch(0.94_0.035_258)] text-[oklch(0.34_0.07_258)] ring-[oklch(0.85_0.062_258)]",
  conducta: "bg-[oklch(0.94_0.035_160)] text-[oklch(0.32_0.07_160)] ring-[oklch(0.85_0.062_160)]",
};

export function AreaBadge({ area, children }: { area: Area; children?: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[area]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children ?? areaLabels[area]}
    </span>
  );
}
