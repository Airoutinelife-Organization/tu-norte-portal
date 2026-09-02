import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { ShieldCheck, HeadphonesIcon, ShoppingBag } from "lucide-react";

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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted px-4 py-12">
      <div className="flex w-full max-w-6xl flex-col gap-8 md:flex-row md:justify-center md:items-start">
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
          onSuccess={() => {
            localStorage.setItem(STORAGE_KEY, "ok");
            window.location.href = "/contact-center";
          }}
        />
        <LoginForm
          title="Ventas"
          description="Módulo de análisis comercial"
          icon={ShoppingBag}
          onSuccess={() => {
            localStorage.setItem(STORAGE_KEY, "ok");
            window.location.href = "/ventas";
          }}
        />
      </div>
    </main>
  );
}

function LoginForm({
  title,
  description,
  icon: Icon,
  onSuccess,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  onSuccess: () => void;
}) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (user.trim() === ADMIN_USER && pass === ADMIN_PASS) onSuccess();
        else setError(true);
      }}
      className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl"
    >
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <label className="mb-1 block text-xs font-medium text-muted-foreground">
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
