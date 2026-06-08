// QR helpers para el módulo de Asistencia (Prioridad 3)
const SECRET = "cie-track-demo-2026";

function hash(input: string): string {
  // hash simple (FNV-1a) – suficiente para validación demo
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export function generarQRPayload(ninoId: string): string {
  const payload = { id: ninoId, v: 1, h: hash(ninoId + SECRET) };
  return "CIE:" + btoa(JSON.stringify(payload));
}

export function decodificarQR(raw: string): { ninoId: string; valido: boolean } | null {
  try {
    if (!raw.startsWith("CIE:")) {
      // Permitir formato simple: "001" o "CIE-001"
      const id = raw.trim().replace(/^CIE-?/i, "").padStart(3, "0");
      if (/^\d{3}$/.test(id) || /^n-/.test(raw.trim())) {
        return { ninoId: id, valido: true };
      }
      return null;
    }
    const payload = JSON.parse(atob(raw.slice(4)));
    const valido = hash(payload.id + SECRET) === payload.h;
    return { ninoId: payload.id, valido };
  } catch {
    return null;
  }
}
