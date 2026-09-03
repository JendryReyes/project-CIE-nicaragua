import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  UsersRound,
  UserPlus,
  Search,
  ShieldCheck,
  ShieldAlert,
  MailCheck,
  X,
  Building2,
  KeyRound,
  Ban,
  RotateCcw,
  BadgeCheck,
  FileClock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  usuariosDemo,
  sedesDemo,
  estadoTono,
  cicloVida,
  funcionalidades,
  type Usuario,
  type EstadoUsuario,
} from "@/lib/usuarios-data";
import { rolesOrg, rolSigla, rolDescripcion } from "@/lib/roles-tdr";

export const Route = createFileRoute("/_app/usuarios")({
  head: () => ({
    meta: [
      { title: "Gestión de usuarios · CIE" },
      {
        name: "description",
        content:
          "Diseño del módulo de gestión de usuarios del CIE: altas, roles, sedes, cartera asignada, seguridad de cuenta y trazabilidad.",
      },
      { property: "og:title", content: "Gestión de usuarios · CIE" },
      {
        property: "og:description",
        content: "Visión del módulo de usuarios: invitaciones, roles, ámbito por sede y seguridad de cuenta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GestionUsuarios,
});

const estados: EstadoUsuario[] = ["Activo", "Invitado", "Suspendido", "Inactivo"];

function GestionUsuarios() {
  const [q, setQ] = useState("");
  const [rolFiltro, setRolFiltro] = useState<string>("Todos");
  const [sedeFiltro, setSedeFiltro] = useState<string>("Todas");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("Todos");
  const [detalle, setDetalle] = useState<Usuario | null>(null);
  const [invitar, setInvitar] = useState(false);

  const lista = useMemo(
    () =>
      usuariosDemo.filter((u) => {
        const okQ =
          !q ||
          u.nombre.toLowerCase().includes(q.toLowerCase()) ||
          u.email.toLowerCase().includes(q.toLowerCase());
        const okRol = rolFiltro === "Todos" || u.rol === rolFiltro;
        const okSede =
          sedeFiltro === "Todas" || u.sedes.includes(sedeFiltro) || u.sedes.includes("Todas");
        const okEstado = estadoFiltro === "Todos" || u.estado === estadoFiltro;
        return okQ && okRol && okSede && okEstado;
      }),
    [q, rolFiltro, sedeFiltro, estadoFiltro],
  );

  const activos = usuariosDemo.filter((u) => u.estado === "Activo").length;
  const invitados = usuariosDemo.filter((u) => u.estado === "Invitado").length;
  const sinMfa = usuariosDemo.filter((u) => !u.mfa && u.estado === "Activo").length;

  return (
    <div className="space-y-8 max-w-[1500px]">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UsersRound className="h-4 w-4" />
          <span>Gobernanza · Diseño propuesto</span>
        </div>
        <h1 className="font-display text-4xl mt-1 text-gradient-marca">Gestión de usuarios</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Vista de cómo se vería el módulo: alta e invitación de personal, asignación de rol y sede,
          cartera de niños, seguridad de la cuenta y trazabilidad de cada cambio. Los datos mostrados
          son de demostración.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link
            to="/equipo"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 hover:bg-muted/60"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Matriz de permisos
          </Link>
          <Link
            to="/auditoria"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 hover:bg-muted/60"
          >
            <FileClock className="h-3.5 w-3.5" /> Bitácora de auditoría
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={UsersRound} label="Usuarios totales" value={String(usuariosDemo.length)} hint="3 sedes activas" />
        <Kpi icon={BadgeCheck} label="Cuentas activas" value={String(activos)} hint="Con acceso vigente" />
        <Kpi icon={MailCheck} label="Invitaciones pendientes" value={String(invitados)} hint="Enlace vence en 72 h" />
        <Kpi icon={ShieldAlert} label="Sin doble factor" value={String(sinMfa)} hint="Requieren registrar MFA" alerta />
      </div>

      {/* Barra de acciones + filtros */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-suave">
        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border/60">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre o correo…"
              className="w-full rounded-lg border border-border/70 bg-background pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary/60"
            />
          </div>
          <Select value={rolFiltro} onChange={setRolFiltro} options={["Todos", ...rolesOrg]} />
          <Select value={sedeFiltro} onChange={setSedeFiltro} options={["Todas", ...sedesDemo]} />
          <Select value={estadoFiltro} onChange={setEstadoFiltro} options={["Todos", ...estados]} />
          <button
            onClick={() => setInvitar(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            <UserPlus className="h-3.5 w-3.5" /> Invitar usuario
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Usuario</th>
                <th className="px-4 py-2.5 font-medium">Rol</th>
                <th className="px-4 py-2.5 font-medium">Sede(s)</th>
                <th className="px-4 py-2.5 font-medium">Cartera</th>
                <th className="px-4 py-2.5 font-medium">MFA</th>
                <th className="px-4 py-2.5 font-medium">Último acceso</th>
                <th className="px-4 py-2.5 font-medium">Estado</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {lista.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setDetalle(u)}
                  className="cursor-pointer hover:bg-muted/30"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-gradient-kpi border border-border/60 grid place-items-center text-[10px] font-medium">
                        {u.iniciales}
                      </div>
                      <div>
                        <div className="font-medium">{u.nombre}</div>
                        <div className="text-[11px] text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        {rolSigla[u.rol]}
                      </span>
                      <span className="text-muted-foreground">{u.rol}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{u.sedes.join(" · ")}</td>
                  <td className="px-4 py-2.5 tabular">{u.ninosAsignados || "—"}</td>
                  <td className="px-4 py-2.5">
                    {u.mfa ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[oklch(0.4_0.106_160)]">
                        <ShieldCheck className="h-3.5 w-3.5" /> Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[oklch(0.45_0.132_45)]">
                        <ShieldAlert className="h-3.5 w-3.5" /> Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 tabular text-muted-foreground">{u.ultimoAcceso}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${estadoTono[u.estado]}`}>
                      {u.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <ChevronRight className="h-4 w-4 text-muted-foreground inline" />
                  </td>
                </tr>
              ))}
              {!lista.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    Sin usuarios que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Funcionalidades previstas */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-display text-2xl">Funcionalidades del módulo</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {funcionalidades.map((f) => (
            <div key={f.titulo} className="rounded-xl border border-border/60 bg-card p-4 border-gradient-top">
              <div className="font-medium text-sm">{f.titulo}</div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{f.detalle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ciclo de vida */}
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Ciclo de vida de una cuenta</h2>
        <div className="grid gap-3 md:grid-cols-5">
          {cicloVida.map((c, i) => (
            <div key={c.paso} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-gradient-marca grid place-items-center text-[11px] font-medium text-primary-foreground">
                  {i + 1}
                </span>
                <div className="font-medium text-sm">{c.paso}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{c.detalle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles disponibles */}
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Roles asignables</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {rolesOrg.map((r) => (
            <div key={r} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  {rolSigla[r]}
                </span>
                <div className="font-medium text-sm">{r}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{rolDescripcion[r]}</p>
              <div className="mt-2 text-[11px] text-muted-foreground">
                {usuariosDemo.filter((u) => u.rol === r).length} usuario(s) con este rol
              </div>
            </div>
          ))}
        </div>
      </section>

      {detalle && <DetalleUsuario u={detalle} onClose={() => setDetalle(null)} />}
      {invitar && <InvitarPanel onClose={() => setInvitar(false)} />}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary/60"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  alerta,
}: {
  icon: typeof UsersRound;
  label: string;
  value: string;
  hint: string;
  alerta?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-gradient-kpi p-4 shadow-suave">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={`h-4 w-4 ${alerta ? "text-[oklch(0.6_0.158_45)]" : "text-primary"}`} />
        {label}
      </div>
      <div className="font-display text-3xl mt-2 tabular">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>
    </div>
  );
}

function DetalleUsuario({ u, onClose }: { u: Usuario; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/20" onClick={onClose} />
      <div className="relative h-full w-full max-w-md overflow-y-auto bg-card border-l border-border/70 p-5 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-gradient-kpi border border-border/60 grid place-items-center text-sm font-medium">
              {u.iniciales}
            </div>
            <div>
              <div className="font-display text-lg leading-tight">{u.nombre}</div>
              <div className="text-xs text-muted-foreground">{u.email}</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className={`rounded-full px-2 py-0.5 font-medium ${estadoTono[u.estado]}`}>{u.estado}</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{u.rol}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground inline-flex items-center gap-1">
            <Building2 className="h-3 w-3" /> {u.sedes.join(" · ")}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Campo label="Cartera asignada" valor={u.ninosAsignados ? `${u.ninosAsignados} niños` : "Sin cartera"} />
          <Campo label="Doble factor" valor={u.mfa ? "Registrado" : "Pendiente"} />
          <Campo label="Último acceso" valor={u.ultimoAcceso} />
          <Campo label="Cuenta creada" valor={u.creado} />
          <div className="col-span-2">
            <Campo label="Credencial profesional" valor={u.licencia} />
          </div>
        </dl>

        <div className="rounded-xl border border-border/60 p-3">
          <div className="text-xs font-medium">Acciones administrativas</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <Accion icon={KeyRound} label="Restablecer contraseña" />
            <Accion icon={ShieldCheck} label="Forzar registro MFA" />
            <Accion icon={RotateCcw} label="Cerrar sesiones activas" />
            <Accion icon={UsersRound} label="Reasignar cartera" />
            <Accion icon={MailCheck} label="Reenviar invitación" />
            <Accion icon={Ban} label="Suspender cuenta" alerta />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Cada acción quedaría registrada en la bitácora con usuario, fecha y motivo.
          </p>
        </div>

        <div className="rounded-xl border border-border/60 p-3">
          <div className="text-xs font-medium">Historial de cambios (ejemplo)</div>
          <ul className="mt-2 space-y-2 text-[11px] text-muted-foreground">
            <li>2026-08-28 · Rol asignado: {u.rol} — por Lic. Jorge Bermúdez</li>
            <li>2026-08-28 · Ámbito de sede: {u.sedes.join(" · ")}</li>
            <li>2026-09-01 · Revisión de credencial profesional</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{valor}</dd>
    </div>
  );
}

function Accion({
  icon: Icon,
  label,
  alerta,
}: {
  icon: typeof UsersRound;
  label: string;
  alerta?: boolean;
}) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left hover:bg-muted/60 ${
        alerta ? "border-[oklch(0.85_0.075_45)] text-[oklch(0.45_0.132_45)]" : "border-border/70"
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" /> {label}
    </button>
  );
}

function InvitarPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-foreground/20" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border/70 bg-card p-5 space-y-4 shadow-suave">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display text-lg">Invitar usuario</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vista del formulario propuesto. Aún no envía correos.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <Field label="Nombre completo" ph="Lic. Nombre Apellido" />
          <Field label="Correo institucional" ph="nombre@cie.edu.ni" />
          <div>
            <div className="text-muted-foreground mb-1">Rol</div>
            <select className="w-full rounded-lg border border-border/70 bg-background px-2.5 py-1.5 outline-none">
              {rolesOrg.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Sede</div>
            <select className="w-full rounded-lg border border-border/70 bg-background px-2.5 py-1.5 outline-none">
              {["Todas", ...sedesDemo].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <Field label="Credencial profesional" ph="BCBA / RBT / Licencia" />
          <Field label="Vence" ph="2027-12-31" />
        </div>

        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" defaultChecked className="accent-[var(--primary)]" />
          Exigir doble factor en el primer ingreso
        </label>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border/70 px-3 py-1.5 text-xs hover:bg-muted">
            Cancelar
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
            <MailCheck className="h-3.5 w-3.5" /> Enviar invitación
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ph }: { label: string; ph: string }) {
  return (
    <div>
      <div className="text-muted-foreground mb-1">{label}</div>
      <input
        placeholder={ph}
        className="w-full rounded-lg border border-border/70 bg-background px-2.5 py-1.5 outline-none focus:border-primary/60"
      />
    </div>
  );
}
