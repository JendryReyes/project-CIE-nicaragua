const KEY = "cie_auth";

export function login(nombre: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify({ nombre, rol: "Coordinadora", ts: Date.now() }));
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function getUser(): { nombre: string; rol: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
