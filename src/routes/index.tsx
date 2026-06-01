import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Heart, ArrowRight } from "lucide-react";
import { login, getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CIE — Sistema edu-terapéutico" },
      { name: "description", content: "Plataforma del Centro de Intervención Edu-Terapéutico de Nicaragua." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("coordinacion@cie.ni");
  const [pwd, setPwd] = useState("demo");

  useEffect(() => {
    if (getUser()) navigate({ to: "/dashboard" });
  }, [navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login("María Castellón");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Left: hero */}
      <div className="relative hidden flex-col justify-between bg-[oklch(0.32_0.06_38)] p-12 text-[oklch(0.97_0.02_75)] lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Heart className="h-6 w-6" fill="currentColor" />
          </div>
          <div className="font-display text-2xl">CIE</div>
        </div>

        <div className="space-y-6 max-w-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-[oklch(0.78_0.08_50)]">
            Nicaragua · Edu-terapéutico
          </p>
          <h1 className="font-display text-5xl leading-[1.05] text-balance">
            La plataforma diseñada para <em className="text-[oklch(0.84_0.1_60)]">cómo</em> trabajamos en Nicaragua.
          </h1>
          <p className="text-base leading-relaxed text-[oklch(0.85_0.03_75)]">
            Diagnóstico, fisioterapia sensorial, logopedia y conducta en un solo expediente. Con flujo INSS, sin software importado, sin sobreprecios.
          </p>

          <div className="flex gap-8 pt-6 text-sm">
            <Stat n="312" l="niños atendidos" />
            <Stat n="14" l="terapeutas" />
            <Stat n="2" l="sedes" />
          </div>
        </div>

        <p className="text-xs text-[oklch(0.7_0.04_75)]">
          Manual de prestación de servicios · v25/05/2026
        </p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6">
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

          <p className="text-center text-xs text-muted-foreground">
            Demo · cualquier credencial entra como Coordinadora
          </p>
        </form>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-3xl tabular">{n}</div>
      <div className="text-xs uppercase tracking-wider text-[oklch(0.78_0.05_60)]">{l}</div>
    </div>
  );
}
