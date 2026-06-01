import { Users } from "lucide-react";

export function IoaBadge({ pct }: { pct: number }) {
  const tone = pct >= 90 ? "bg-[oklch(0.94_0.05_155)] text-[oklch(0.4_0.1_155)]" : pct >= 80 ? "bg-[oklch(0.94_0.06_60)] text-[oklch(0.4_0.13_60)]" : "bg-[oklch(0.94_0.06_25)] text-[oklch(0.45_0.15_25)]";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${tone}`}>
      <Users className="h-2.5 w-2.5" /> IOA {pct}%
    </span>
  );
}
