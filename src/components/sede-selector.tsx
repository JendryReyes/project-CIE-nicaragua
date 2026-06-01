import { useSede, sedes } from "@/lib/sedes";
import { MapPin, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function SedeSelector() {
  const { sede, setSede } = useSede();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const actual = sedes.find((s) => s.id === sede)!;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted/60"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[0.65rem] font-semibold text-primary">
          {actual.sigla}
        </span>
        <span className="font-medium hidden sm:inline">{actual.nombre}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-xl border border-border bg-popover p-1.5 shadow-lg">
          <div className="px-2.5 py-1.5 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            Sede activa
          </div>
          {sedes.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSede(s.id); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-muted ${sede === s.id ? "bg-primary/5 text-primary font-medium" : ""}`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[0.6rem] font-semibold">
                {s.sigla}
              </span>
              <span className="flex-1 text-left">
                <div>{s.nombre}</div>
                <div className="text-[0.65rem] text-muted-foreground">{s.ciudad}</div>
              </span>
              {s.id === "all" && <MapPin className="h-3 w-3 text-muted-foreground" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
