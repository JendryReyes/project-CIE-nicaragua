import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  KeyRound,
  Smartphone,
  Database,
  Lock,
  Signature,
  Fingerprint,
  Clock,
  Globe,
  Plus,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface PerfilMFA {
  id: string;
  nombre: string;
  rol: string;
  metodo: "TOTP" | "SMS" | "Email" | "WebAuthn";
  estado: "Activo" | "Pendiente" | "Bloqueado";
  ultimoAcceso: string;
  firmaDigital: boolean;
  iniciales: string;
}

const perfilesMFA: PerfilMFA[] = [
  { id: "u1", nombre: "Dra. Carla Vega", rol: "BCBA / Dir. Clínica", metodo: "WebAuthn", estado: "Activo", ultimoAcceso: "Hoy · 09:12", firmaDigital: true, iniciales: "CV" },
  { id: "u2", nombre: "Lic. Roberto Núñez", rol: "Coord. ABA", metodo: "TOTP", estado: "Activo", ultimoAcceso: "Hoy · 08:45", firmaDigital: true, iniciales: "RN" },
  { id: "u3", nombre: "Lic. María José Soto", rol: "Logopeda", metodo: "TOTP", estado: "Activo", ultimoAcceso: "Ayer · 17:30", firmaDigital: true, iniciales: "MS" },
  { id: "u4", nombre: "Lic. Edwin Castro", rol: "RBT", metodo: "SMS", estado: "Pendiente", ultimoAcceso: "Hace 3 días", firmaDigital: false, iniciales: "EC" },
  { id: "u5", nombre: "Ing. Lorena Pavón", rol: "Administración", metodo: "WebAuthn", estado: "Activo", ultimoAcceso: "Hoy · 10:02", firmaDigital: true, iniciales: "LP" },
  { id: "u6", nombre: "Lic. Daniel Morales", rol: "RBT", metodo: "Email", estado: "Bloqueado", ultimoAcceso: "Hace 12 días", firmaDigital: false, iniciales: "DM" },
];

interface Restriccion {
  id: string;
  tipo: "IP" | "Horario" | "Dispositivo" | "Geolocalización";
  descripcion: string;
  activa: boolean;
}
const restricciones: Restriccion[] = [
  { id: "r1", tipo: "IP", descripcion: "Solo desde redes registradas de sedes (Managua, León, Estelí)", activa: true },
  { id: "r2", tipo: "Horario", descripcion: "Acceso administrativo restringido fuera de 06:00 - 22:00", activa: true },
  { id: "r3", tipo: "Dispositivo", descripcion: "RBTs requieren dispositivo autorizado (huella + MDM)", activa: true },
  { id: "r4", tipo: "Geolocalización", descripcion: "Bloquear acceso fuera de Nicaragua para perfiles clínicos", activa: false },
];

interface Backup {
  id: string;
  fecha: string;
  tipo: "Automático diario" | "Manual" | "Pre-actualización";
  tamano: string;
  estado: "Completado" | "En proceso" | "Verificado";
}
const backups: Backup[] = [
  { id: "b1", fecha: "2026-06-15 03:00", tipo: "Automático diario", tamano: "1.42 GB", estado: "Verificado" },
  { id: "b2", fecha: "2026-06-14 03:00", tipo: "Automático diario", tamano: "1.41 GB", estado: "Verificado" },
  { id: "b3", fecha: "2026-06-13 03:00", tipo: "Automático diario", tamano: "1.40 GB", estado: "Verificado" },
  { id: "b4", fecha: "2026-06-10 14:25", tipo: "Manual", tamano: "1.38 GB", estado: "Verificado" },
  { id: "b5", fecha: "2026-06-08 22:10", tipo: "Pre-actualización", tamano: "1.37 GB", estado: "Verificado" },
];

const metodoIcon = {
  TOTP: KeyRound,
  SMS: Smartphone,
  Email: Globe,
  WebAuthn: Fingerprint,
};

const estadoTone: Record<string, string> = {
  Activo: "bg-[oklch(0.94_0.053_160)] text-[oklch(0.4_0.106_160)]",
  Pendiente: "bg-[oklch(0.94_0.044_80)] text-[oklch(0.4_0.106_80)]",
  Bloqueado: "bg-[oklch(0.96_0.044_30)] text-[oklch(0.45_0.132_30)]",
  Completado: "bg-[oklch(0.94_0.053_160)] text-[oklch(0.4_0.106_160)]",
  "En proceso": "bg-[oklch(0.94_0.044_258)] text-[oklch(0.4_0.106_258)]",
  Verificado: "bg-[oklch(0.94_0.053_160)] text-[oklch(0.4_0.106_160)]",
};

export function SeguridadMFA() {
  const [tab, setTab] = useState<"perfiles" | "restricciones" | "backups" | "firma">("perfiles");

  const cobertura = Math.round(
    (perfilesMFA.filter((p) => p.estado === "Activo").length / perfilesMFA.length) * 100
  );

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Seguridad operativa</span>
          </div>
          <h2 className="font-display text-2xl mt-1">MFA · Perfiles · Backups · Firma digital</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Inspirado en Office Puzzle. Doble factor obligatorio para perfiles clínicos y administrativos,
            con respaldos diarios verificados y firma digital legalmente vinculante por sesión.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SecCard icon={ShieldCheck} label="Cobertura MFA" value={`${cobertura}%`} hint={`${perfilesMFA.filter(p=>p.estado==="Activo").length}/${perfilesMFA.length} usuarios activos`} ok />
        <SecCard icon={Database} label="Último backup" value="Hace 6h" hint="1.42 GB · Verificado" ok />
        <SecCard icon={AlertTriangle} label="Perfiles bloqueados" value={String(perfilesMFA.filter(p=>p.estado==="Bloqueado").length)} hint="Requieren restablecer 2FA" warn />
        <SecCard icon={Signature} label="Firmas activas" value={String(perfilesMFA.filter(p=>p.firmaDigital).length)} hint="Certificado emitido CIE" />
      </div>

      <div className="flex items-center gap-1 border-b border-border/60 overflow-x-auto">
        {([
          ["perfiles", "Perfiles MFA"],
          ["restricciones", "Restricciones"],
          ["backups", "Backups"],
          ["firma", "Firma digital"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "perfiles" && (
        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border/60">
            <h3 className="font-display text-base">Usuarios con doble factor</h3>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-xs hover:bg-muted">
              <Plus className="h-3.5 w-3.5" /> Forzar reinscripción
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Usuario</th>
                  <th className="px-4 py-2.5 font-medium">Rol</th>
                  <th className="px-4 py-2.5 font-medium">Método 2FA</th>
                  <th className="px-4 py-2.5 font-medium">Firma digital</th>
                  <th className="px-4 py-2.5 font-medium">Último acceso</th>
                  <th className="px-4 py-2.5 font-medium">Estado</th>
                  <th className="px-4 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {perfilesMFA.map((p) => {
                  const Icon = metodoIcon[p.metodo];
                  return (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-muted grid place-items-center text-[10px] font-medium">{p.iniciales}</div>
                          <div className="font-medium">{p.nombre}</div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{p.rol}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          {p.metodo}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {p.firmaDigital ? (
                          <span className="inline-flex items-center gap-1 text-[oklch(0.4_0.106_160)] text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Emitida
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Sin firma</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 tabular text-muted-foreground">{p.ultimoAcceso}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${estadoTone[p.estado]}`}>{p.estado}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button className="text-primary hover:underline text-[11px]">Gestionar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "restricciones" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {restricciones.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border/70 bg-card p-4 flex items-start gap-3">
              <div className={`h-9 w-9 rounded-lg grid place-items-center ${r.activa ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {r.tipo === "IP" && <Globe className="h-4 w-4" />}
                {r.tipo === "Horario" && <Clock className="h-4 w-4" />}
                {r.tipo === "Dispositivo" && <Smartphone className="h-4 w-4" />}
                {r.tipo === "Geolocalización" && <Shield className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-sm">{r.tipo}</div>
                  <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${r.activa ? "bg-[oklch(0.94_0.053_160)] text-[oklch(0.4_0.106_160)]" : "bg-muted text-muted-foreground"}`}>
                    {r.activa ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{r.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "backups" && (
        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border/60">
            <div>
              <h3 className="font-display text-base">Respaldos del sistema</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Retención 90 días · Cifrado AES-256 · Verificación de integridad SHA-256</p>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:opacity-90">
              <Plus className="h-3.5 w-3.5" /> Generar backup manual
            </button>
          </div>
          <div className="divide-y divide-border/50 text-sm">
            {backups.map((b) => (
              <div key={b.id} className="flex items-center gap-4 px-4 py-2.5 text-xs">
                <Database className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="tabular w-40 text-muted-foreground">{b.fecha}</span>
                <span className="flex-1">{b.tipo}</span>
                <span className="tabular text-muted-foreground">{b.tamano}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${estadoTone[b.estado]}`}>{b.estado}</span>
                <button className="text-primary hover:underline text-[11px]">Restaurar</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "firma" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border/70 bg-card p-5 lg:col-span-2">
            <div className="flex items-center gap-2 text-sm">
              <Signature className="h-4 w-4 text-primary" />
              <span className="font-medium">Firma digital de sesiones ABA</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Cada sesión completada se firma con el certificado X.509 del terapeuta + sello de tiempo CIE.
              La firma queda embebida en el PDF de la sesión y es verificable de forma independiente.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <Mini label="Sesiones firmadas hoy" value="42" />
              <Mini label="Firmas verificadas (mes)" value="1,284" />
              <Mini label="Certificados emitidos" value="18" />
              <Mini label="Sello de tiempo" value="RFC 3161" />
            </div>

            <div className="mt-5 rounded-xl border border-dashed border-border/70 p-4 bg-muted/20">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Vista previa de firma</div>
              <div className="font-mono text-[11px] mt-2 text-muted-foreground break-all">
                CN=Carla Vega · O=CIE · SHA256:a4:f1:9c:...:7d:e2 · TS=2026-06-15T10:14:22Z
              </div>
              <div className="flex items-center gap-2 mt-3">
                <CheckCircle2 className="h-4 w-4 text-[oklch(0.6_0.09_160)]" />
                <span className="text-xs">Firma válida y vigente · Cadena de confianza verificada</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="text-sm font-medium">Política CIE</div>
            <ul className="text-xs text-muted-foreground mt-3 space-y-2">
              <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.6_0.09_160)] shrink-0 mt-0.5" /> 2FA obligatorio para perfiles clínicos.</li>
              <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.6_0.09_160)] shrink-0 mt-0.5" /> Bloqueo automático tras 5 intentos fallidos.</li>
              <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.6_0.09_160)] shrink-0 mt-0.5" /> Backups diarios cifrados + verificación SHA-256.</li>
              <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.6_0.09_160)] shrink-0 mt-0.5" /> Firma digital obligatoria al cerrar cada sesión ABA.</li>
              <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.6_0.09_160)] shrink-0 mt-0.5" /> Auditoría inmutable por 7 años (Ley 1115).</li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

function SecCard({ icon: Icon, label, value, hint, ok, warn }: { icon: typeof Shield; label: string; value: string; hint?: string; ok?: boolean; warn?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${warn ? "border-[oklch(0.85_0.106_30)] bg-[oklch(0.98_0.014_265)]" : "border-border/70 bg-card"}`}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className={`h-4 w-4 ${warn ? "text-[oklch(0.55_0.158_30)]" : ok ? "text-[oklch(0.6_0.09_160)]" : "text-muted-foreground"}`} />
      </div>
      <div className={`font-display text-2xl mt-1 tabular ${warn ? "text-[oklch(0.45_0.132_30)]" : ""}`}>{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-lg mt-0.5 tabular">{value}</div>
    </div>
  );
}
