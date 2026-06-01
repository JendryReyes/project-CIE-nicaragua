import { createContext, useContext, useEffect, useState, type ReactNode, createElement } from "react";

export type SedeId = "all" | "santo-domingo" | "las-colinas" | "esteli" | "masaya" | "leon";

export const sedes: { id: SedeId; nombre: string; ciudad: string; sigla: string }[] = [
  { id: "all", nombre: "Consolidado nacional", ciudad: "Todas las sedes", sigla: "CN" },
  { id: "santo-domingo", nombre: "Santo Domingo", ciudad: "Managua", sigla: "SD" },
  { id: "las-colinas", nombre: "Las Colinas", ciudad: "Managua", sigla: "LC" },
  { id: "esteli", nombre: "Estelí", ciudad: "Estelí", sigla: "ES" },
  { id: "masaya", nombre: "Masaya", ciudad: "Masaya", sigla: "MA" },
  { id: "leon", nombre: "León", ciudad: "León", sigla: "LE" },
];

const KEY = "cie_sede";

const SedeCtx = createContext<{ sede: SedeId; setSede: (s: SedeId) => void }>({
  sede: "santo-domingo",
  setSede: () => {},
});

export function SedeProvider({ children }: { children: ReactNode }) {
  const [sede, setSedeState] = useState<SedeId>("santo-domingo");
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY) as SedeId | null;
      if (v) setSedeState(v);
    } catch {}
  }, []);
  const setSede = (s: SedeId) => {
    setSedeState(s);
    try { localStorage.setItem(KEY, s); } catch {}
  };
  return createElement(SedeCtx.Provider, { value: { sede, setSede } }, children);
}

export function useSede() {
  return useContext(SedeCtx);
}

export function sedeLabel(id: SedeId) {
  return sedes.find((s) => s.id === id)?.nombre ?? id;
}

// Map demo-data string sedes to SedeId for filtering
export function matchesSede(ninoSede: string, current: SedeId): boolean {
  if (current === "all") return true;
  const map: Record<string, SedeId[]> = {
    "Managua": ["santo-domingo", "las-colinas"],
    "León": ["leon"],
    "Estelí": ["esteli"],
    "Masaya": ["masaya"],
  };
  const matches = map[ninoSede] ?? [];
  return matches.includes(current);
}
