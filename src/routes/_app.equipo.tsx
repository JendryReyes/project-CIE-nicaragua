import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { RbacMatriz } from "@/components/rbac-matriz";
import { SeguridadMFA } from "@/components/seguridad-mfa";
import { MatrizSensible } from "@/components/matriz-sensible";
import { Shield, FileClock, KeyRound } from "lucide-react";
import { politicaSeguridad, rolesPlataforma, useRol } from "@/lib/roles-tdr";

export const Route = createFileRoute("/_app/equipo")({
  head: () => ({
    meta: [
      { title: "Equipo y permisos · CIE" },
      { name: "description", content: "Jerarquía de roles TDR, matriz de acciones clínicas sensibles y segregación de datos del CIE." },
      { property: "og:title", content: "Equipo y permisos · CIE" },
      { property: "og:description", content: "Gobernanza de accesos: roles, acciones sensibles y política de seguridad." },
    ],
  }),
  component: Equipo,
});

const tabs = ["Roles TDR y acciones sensibles", "Matriz operativa por área", "Seguridad y plataforma"] as const;
type Tab = (typeof tabs)[number];

function Equipo() {
  const [tab, setTab] = useState<Tab>(tabs[0]);
  const { rol } = useRol();

  return (
    <div className="space-y-8 max-w-[1500px]">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Gobernanza clínica · TDR v1.2 Parte I</span>
        </div>
        <h1 className="font-display text-4xl mt-1">Equipo y permisos</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Jerarquía de roles de plataforma y de organización, matriz de acciones clínicas sensibles y segregación de
          datos restringidos. Rol activo simulado: <span className="font-medium text-foreground">{rol}</span>.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link
            to="/auditoria"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 hover:bg-muted/60"
          >
            <FileClock className="h-3.5 w-3.5" /> Ver bitácora de auditoría
          </Link>
          <Link
            to="/plataforma"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 hover:bg-muted/60"
          >
            <KeyRound className="h-3.5 w-3.5" /> Panel de plataforma
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-b border-border/60">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm border-b-2 -mb-px ${
              tab === t
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === tabs[0] && <MatrizSensible />}
      {tab === tabs[1] && <RbacMatriz />}
      {tab === tabs[2] && (
        <div className="space-y-8">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border/60 p-4">
              <h3 className="font-display text-lg">Política de contraseñas</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Longitud mínima</dt>
                  <dd>{politicaSeguridad.password.minimo} caracteres</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Composición</dt>
                  <dd>{politicaSeguridad.password.requiere}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Caducidad</dt>
                  <dd>{politicaSeguridad.password.caducidad}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Reutilización</dt>
                  <dd>{politicaSeguridad.password.reutilizacion}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Bloqueo</dt>
                  <dd>{politicaSeguridad.password.bloqueo}</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-xl border border-border/60 p-4">
              <h3 className="font-display text-lg">MFA y acceso a red</h3>
              <div className="mt-3 text-sm">
                <div className="text-xs text-muted-foreground">MFA obligatorio</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {politicaSeguridad.mfaObligatorio.map((r) => (
                    <span
                      key={r}
                      className="rounded-full bg-[oklch(0.94_0.05_155)] px-2 py-0.5 text-xs text-[oklch(0.36_0.11_155)]"
                    >
                      {r}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-3">MFA recomendado</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {politicaSeguridad.mfaRecomendado.map((r) => (
                    <span key={r} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {r}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">{politicaSeguridad.red}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 p-4">
            <h3 className="font-display text-lg">Roles de plataforma</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Operan sobre organizaciones y facturación de plataforma, nunca sobre datos clínicos de los tenants.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {rolesPlataforma.map((r) => (
                <span key={r} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                  {r}
                </span>
              ))}
            </div>
          </div>

          <SeguridadMFA />
        </div>
      )}
    </div>
  );
}
