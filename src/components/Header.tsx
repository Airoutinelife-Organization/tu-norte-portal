import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, UserCircle, LayoutDashboard, Phone } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/cobertura", label: "Cobertura" },
  { to: "/planes", label: "Planes" },
  { to: "/diagnostico", label: "Diagnóstico" },
  { to: "/mis-tickets", label: "Mis tickets" },
  { to: "/soporte", label: "Soporte" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="w-full bg-gradient-brand text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-[12px] font-semibold md:justify-end md:gap-3 md:text-xs">
          <span className="hidden sm:inline opacity-90">Tu Asistente 24 horas, 7 días disponible</span>
          <a href="tel:+16075759847" className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25 transition hover:bg-white/25">
            <Phone className="h-3.5 w-3.5" />
            (607) 575-9847
          </a>
        </div>
      </div>
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Tu Norte TV" className="h-20 w-20 object-contain" width={88} height={88} />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-brand">Tu Portal · Autogestión</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && <span className="absolute inset-0 rounded-full bg-accent/60" aria-hidden />}
                <span className="relative">{l.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link to="/pagar">
              <LayoutDashboard className="mr-1 h-4 w-4" /> Mi cuenta
            </Link>
          </Button>
          <Button asChild size="sm" className="hidden bg-gradient-brand text-primary-foreground shadow-soft hover:opacity-90 md:inline-flex">
            <Link to="/agendar">
              <UserCircle className="mr-1 h-4 w-4" /> Contratar
            </Link>
          </Button>
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 p-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-4 py-3 text-sm font-medium",
                  path === l.to ? "bg-accent text-primary" : "text-foreground hover:bg-muted",
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/pagar" onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-muted">
              Mi factura
            </Link>
            <Link to="/agendar" onClick={() => setOpen(false)} className="mt-2 rounded-lg bg-gradient-brand px-4 py-3 text-center text-sm font-semibold text-primary-foreground">
              Contratar / Agendar
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
