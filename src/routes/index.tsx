import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Heart, ArrowRight, Sparkles } from "lucide-react";
import { login, getUser, ACCESOS_DEMO, type UserSesion } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CIETrack — Gestión clínica y facturación INSS" },
      { name: "description", content: "Plataforma del Centro de Intervención Edu-Terapéutico de Nicaragua: terapias ABA, fisio, logopedia y facturación INSS quincenal." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("directora@cie.edu.ni");
  const [pwd, setPwd] = useState("demo123");

  useEffect(() => {
    if (getUser()) navigate({ to: "/dashboard" });
  }, [navigate]);

  const entrarComo = (u: UserSesion, ruta: string) => {
    login(u);
    navigate({ to: ruta });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = ACCESOS_DEMO.find((u) => u.email === email);
    const user = found ?? ACCESOS_DEMO[0];
    const { ruta, ...rest } = user;
    entrarComo(rest, ruta);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Left: hero */}
      <div className="relative hidden flex-col justify-between bg-[oklch(0.32_0.053_30)] p-12 text-[oklch(0.97_0.014_265)] lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Heart className="h-6 w-6" fill="currentColor" />
          </div>
          <div className="font-display text-2xl">CIETrack</div>
        </div>

        <div className="space-y-6 max-w-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-[oklch(0.78_0.07_80)]">
            Nicaragua · Edu-terapéutico
          </p>
          <h1 className="font-display text-5xl leading-[1.05] text-balance">
            Gestión clínica y facturación INSS para centros <em className="text-[oklch(0.84_0.088_80)]">ABA</em>.
          </h1>
          <p className="text-base leading-relaxed text-[oklch(0.85_0.014_265)]">
            Asistencias, expedientes, planes ABA y la quincena INSS en un solo lugar.
            El cierre que hoy toma 3 días, aquí toma minutos.
          </p>

          <div className="flex gap-8 pt-6 text-sm">
            <Stat n="312" l="niños atendidos" />
            <Stat n="14" l="terapeutas" />
            <Stat n="5" l="sedes" />
          </div>
        </div>

        <p className="text-xs text-[oklch(0.7_0.035_80)]">
          Manual de prestación de servicios · v25/05/2026
        </p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-8">
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <h2 className="font-display text-3xl">Bienvenida de nuevo</h2>
              <p className="text-sm text-muted-foreground">
                Ingresa con tu cuenta del CIE para continuar.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pwd">Contraseña</Label>
                <Input id="pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base">
              Entrar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* Quick-access roles */}
          <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <div className="text-sm font-medium">Demo · accesos rápidos</div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Un clic para entrar como cada rol y ver qué cambia.
            </p>
            <div className="grid gap-2">
              {ACCESOS_DEMO.map((u) => {
                const { ruta, ...rest } = u;
                return (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => entrarComo(rest, ruta)}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2.5 text-left hover:border-primary/40 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium">{u.rol}</div>
                      <div className="text-xs text-muted-foreground">
                        {u.nombre} · {u.sede ?? "todas las sedes"}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-3xl tabular">{n}</div>
      <div className="text-xs uppercase tracking-wider text-[oklch(0.78_0.044_80)]">{l}</div>
    </div>
  );
}
