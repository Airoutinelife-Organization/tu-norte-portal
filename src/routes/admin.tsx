import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { ShieldCheck, HeadphonesIcon, ShoppingBag, Brain, Activity } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Panel Admin · Tu Norte Portal" },
      { name: "description", content: "Panel administrativo de Tu Norte." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const ADMIN_USER = "admin";
const ADMIN_PASS = "TuNorte2026*";
const STORAGE_KEY = "tunorte_admin_session";

function AdminPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Stop auto-redirecting so the user can choose which dashboard to go to.
    setReady(true);
  }, []);

  if (!ready) return <div className="min-h-screen bg-background" />;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B1121] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <video 
          className="h-full w-full object-cover motion-reduce:hidden opacity-40" 
          src="https://tu-norte-command-center.contact-4b1.workers.dev/tu-norte-tech-loop.webm" 
          autoPlay 
          loop 
          muted 
          playsInline 
          preload="auto"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
      </div>

      <div className="relative z-10 flex w-full max-w-6xl flex-col gap-8 md:flex-row md:justify-center md:items-stretch">
        <LoginForm
          title="Dashboard Ejecutivo"
          description="Monitoreo del asistente de IA"
          icon={ShieldCheck}
          onSuccess={() => {
            localStorage.setItem(STORAGE_KEY, "ok");
            window.location.href = "/calls-dashboard/index.html";
          }}
        />
        <LoginForm
          title="Contact Center"
          description="Gestión y métricas de llamadas"
          icon={HeadphonesIcon}
          expectedPass="Contact2026!"
          onSuccess={() => {
            localStorage.setItem(STORAGE_KEY, "ok");
            window.location.href = "/contact-center";
          }}
        />
        <LoginForm
          title="Administracion"
          description="Ventas y otros"
          icon={ShoppingBag}
          expectedPass="Flor2026$"
          onSuccess={() => {
            localStorage.setItem(STORAGE_KEY, "ok");
            window.location.href = "/ventas";
          }}
        />
        <LoginForm
          title="Centro de Incidencias"
          description="Estado Operacional en tiempo real"
          icon={Activity}
          expectedUser="admin"
          expectedPass="TuNorte2026*"
          onSuccess={() => {
            localStorage.setItem(STORAGE_KEY, "ok");
            window.location.href = "https://centro-de-incidencias-tu-norte.contact-4b1.workers.dev/";
          }}
        />

      </div>
    </main>
  );
}

export function LoginForm({
  title,
  description,
  icon: Icon,
  onSuccess,
  expectedUser = ADMIN_USER,
  expectedPass = ADMIN_PASS,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  onSuccess: () => void;
  expectedUser?: string;
  expectedPass?: string;
}) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (user.trim() === expectedUser && pass === expectedPass) onSuccess();
        else setError(true);
      }}
      className="flex w-full max-w-sm flex-col rounded-2xl border border-border bg-card p-8 shadow-xl"
    >
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <label className="mt-auto mb-1 block text-xs font-medium text-muted-foreground">
        Usuario
      </label>
      <input
        value={user}
        onChange={(e) => {
          setUser(e.target.value);
          setError(false);
        }}
        autoComplete="username"
        className="mb-4 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        placeholder="admin"
      />

      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        Contraseña
      </label>
      <input
        type="password"
        value={pass}
        onChange={(e) => {
          setPass(e.target.value);
          setError(false);
        }}
        autoComplete="current-password"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        placeholder="••••••••"
      />

      {error && (
        <p className="mt-3 text-sm text-destructive">
          Usuario o contraseña incorrectos.
        </p>
      )}

      <button
        type="submit"
        className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        Ingresar
      </button>
    </form>
  );
}
