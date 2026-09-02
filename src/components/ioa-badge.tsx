import { Users } from "lucide-react";

export function IoaBadge({ pct }: { pct: number }) {
  const tone = pct >= 90 ? "bg-[oklch(0.94_0.044_160)] text-[oklch(0.4_0.088_160)]" : pct >= 80 ? "bg-[oklch(0.94_0.053_80)] text-[oklch(0.4_0.114_80)]" : "bg-[oklch(0.94_0.053_45)] text-[oklch(0.45_0.132_45)]";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${tone}`}>
      <Users className="h-2.5 w-2.5" /> IOA {pct}%
    </span>
  );
}
