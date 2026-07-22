import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText, Check, Clock, AlertCircle, ChevronRight, MessageSquare, Plus, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mis-tickets")({
  head: () => ({
    meta: [
      { title: "Mis tickets — Seguimiento PQR | Tu Norte Portal" },
      { name: "description", content: "Sigue en tiempo real el estado de tus solicitudes, PQR y tickets técnicos." },
    ],
  }),
  component: MisTicketsPage,
});

type Status = "open" | "in_progress" | "resolved" | "closed";
type Ticket = {
  id: string;
  title: string;
  type: "PQR" | "Técnico" | "Facturación";
  status: Status;
  createdAt: string;
  priority: "alta" | "media" | "baja";
  timeline: { date: string; event: string; status: Status }[];
};

const tickets: Ticket[] = [
  {
    id: "TN-849201",
    title: "Falla intermitente de señal de internet",
    type: "Técnico",
    status: "in_progress",
    createdAt: "28 Abr 2026 · 09:14",
    priority: "alta",
    timeline: [
      { date: "28 Abr · 09:14", event: "Ticket radicado", status: "open" },
      { date: "28 Abr · 09:32", event: "Asignado a equipo técnico zona Norte", status: "in_progress" },
      { date: "29 Abr · 08:00", event: "Visita programada para hoy entre 2:00 – 4:00 PM", status: "in_progress" },
    ],
  },
  {
    id: "TN-848117",
    title: "Solicitud de cambio de plan a 600 Mbps",
    type: "PQR",
    status: "resolved",
    createdAt: "20 Abr 2026 · 15:40",
    priority: "media",
    timeline: [
      { date: "20 Abr · 15:40", event: "PQR radicada", status: "open" },
      { date: "21 Abr · 11:10", event: "En revisión por área comercial", status: "in_progress" },
      { date: "23 Abr · 16:25", event: "Cambio de plan aplicado en próximo ciclo", status: "resolved" },
    ],
  },
  {
    id: "TN-846902",
    title: "Cobro no reconocido en factura de marzo",
    type: "Facturación",
    status: "closed",
    createdAt: "08 Abr 2026 · 10:05",
    priority: "media",
    timeline: [
      { date: "08 Abr · 10:05", event: "Reclamo radicado", status: "open" },
      { date: "10 Abr · 14:00", event: "Verificación de cargos en sistema", status: "in_progress" },
      { date: "12 Abr · 09:30", event: "Reembolso aplicado a próxima factura", status: "resolved" },
      { date: "12 Abr · 09:30", event: "Caso cerrado", status: "closed" },
    ],
  },
];

const statusConfig: Record<Status, { label: string; className: string; icon: typeof Check }> = {
  open: { label: "Abierto", className: "bg-blue-500/15 text-blue-700", icon: AlertCircle },
  in_progress: { label: "En proceso", className: "bg-amber-500/15 text-amber-700", icon: Clock },
  resolved: { label: "Resuelto", className: "bg-success/15 text-success", icon: Check },
  closed: { label: "Cerrado", className: "bg-muted text-muted-foreground", icon: Check },
};

function MisTicketsPage() {
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [active, setActive] = useState<Ticket | null>(null);

  const filtered = tickets.filter((t) => filter === "all" || t.status === filter);

  const counts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-brand hover:underline">← Inicio</Link>
          <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">Mis tickets y PQR</h1>
          <p className="mt-2 text-muted-foreground">Sigue en tiempo real el estado de tus solicitudes.</p>
        </div>
        <Button asChild className="bg-gradient-brand text-primary-foreground shadow-soft">
          <Link to="/pqr"><Plus className="mr-1 h-4 w-4" /> Nueva PQR</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total", value: counts.all, key: "all" as const, color: "from-blue-500 to-cyan-500" },
          { label: "Abiertos", value: counts.open, key: "open" as const, color: "from-blue-400 to-blue-600" },
          { label: "En proceso", value: counts.in_progress, key: "in_progress" as const, color: "from-amber-400 to-orange-500" },
          { label: "Resueltos", value: counts.resolved, key: "resolved" as const, color: "from-emerald-400 to-cyan-500" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={cn(
              "rounded-2xl border-2 p-4 text-left transition",
              filter === s.key ? "border-brand bg-brand/5 shadow-soft" : "border-border bg-white hover:border-brand/40"
            )}
          >
            <p className="text-xs font-semibold uppercase text-muted-foreground">{s.label}</p>
            <p className={`mt-1 font-display text-3xl font-bold bg-gradient-to-br ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="bg-white p-10 text-center shadow-soft">
            <p className="text-muted-foreground">No hay tickets en esta categoría.</p>
          </Card>
        ) : (
          filtered.map((t) => {
            const cfg = statusConfig[t.status];
            return (
              <button key={t.id} onClick={() => setActive(t)} className="w-full text-left">
                <Card className="border-border/60 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-muted-foreground">{t.id}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.type}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${cfg.className}`}>
                          <cfg.icon className="h-3 w-3" /> {cfg.label}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-display font-bold">{t.title}</p>
                      <p className="text-xs text-muted-foreground">Creado {t.createdAt}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>
                </Card>
              </button>
            );
          })
        )}
      </div>

      {/* Detail Drawer */}
      {active && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setActive(null)} />
          <div className="w-full max-w-md overflow-y-auto bg-background shadow-glow animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background p-5">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{active.id}</p>
                <p className="font-display font-bold">{active.title}</p>
              </div>
              <button onClick={() => setActive(null)} className="rounded-full p-2 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5 p-5">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{active.type}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusConfig[active.status].className}`}>
                  {statusConfig[active.status].label}
                </span>
                <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                  Prioridad {active.priority}
                </span>
              </div>

              <div>
                <p className="mb-3 font-display font-bold">Línea de tiempo</p>
                <ol className="relative space-y-5 border-l-2 border-border pl-5">
                  {active.timeline.map((e, i) => {
                    const cfg = statusConfig[e.status];
                    return (
                      <li key={i} className="relative">
                        <span className={cn("absolute -left-[1.65rem] grid h-6 w-6 place-items-center rounded-full ring-4 ring-background", cfg.className)}>
                          <cfg.icon className="h-3 w-3" />
                        </span>
                        <p className="text-xs text-muted-foreground">{e.date}</p>
                        <p className="text-sm font-medium">{e.event}</p>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <Button asChild className="w-full bg-gradient-brand text-primary-foreground">
                <a href="https://wa.me/573217560178" target="_blank" rel="noreferrer">
                  <MessageSquare className="mr-1 h-4 w-4" /> Hablar con un asesor
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
