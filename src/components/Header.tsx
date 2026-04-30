import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, UserCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/empresa", label: "Empresa" },
  { to: "/planes", label: "Planes" },
  { to: "/cobertura", label: "Cobertura" },
  { to: "/test-velocidad", label: "Test de Velocidad" },
  { to: "/soporte", label: "Soporte" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Tu Norte TV" className="h-11 w-11 object-contain" width={44} height={44} />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-base font-bold tracking-tight text-primary">Tu Norte</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-brand">TV · Internet</span>
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
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <span className="absolute inset-0 rounded-full bg-accent/60" aria-hidden />
                )}
                <span className="relative">{l.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link to="/pqr">PQR</Link>
          </Button>
          <Button asChild size="sm" className="hidden bg-gradient-brand text-primary-foreground shadow-soft hover:opacity-90 md:inline-flex">
            <a href="https://oficinavirtual.tunorte.co" target="_blank" rel="noreferrer">
              <UserCircle className="mr-1 h-4 w-4" /> Clientes
            </a>
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
            <Link to="/pqr" onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-muted">
              PQR
            </Link>
            <a href="https://oficinavirtual.tunorte.co" target="_blank" rel="noreferrer" className="mt-2 rounded-lg bg-gradient-brand px-4 py-3 text-center text-sm font-semibold text-primary-foreground">
              Portal Clientes
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
