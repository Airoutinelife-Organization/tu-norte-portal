import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MapPin, CreditCard, AlertCircle, CalendarPlus, Wifi, Tv, Headphones, FileText,
  ArrowRight, Search, Zap, MessageSquare, Sparkles, Activity, ShieldCheck, Check,
  Clock, TrendingUp,
} from "lucide-react";
import portalHero from "@/assets/portal-hero.jpg";
import coverageCity from "@/assets/coverage-city.jpg";
import heroLoop from "@/assets/hero-loop.mp4?url";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tu Norte TV — Portal de autogestión, soporte e instalación" },
      { name: "description", content: "Verifica cobertura, paga tu factura, reporta fallas y agenda instalación. El portal interactivo de Tu Norte TV en Norte de Santander." },
      { property: "og:title", content: "Tu Norte TV — Portal interactivo" },
      { property: "og:description", content: "Autogestión, soporte e instalación en un solo lugar." },
    ],
  }),
  component: HomePage,
});

const helpOptions = [
  { icon: MapPin, label: "Verificar cobertura", to: "/cobertura", color: "from-cyan-400 to-blue-500" },
  { icon: CreditCard, label: "Pagar factura", to: "/pagar", color: "from-emerald-400 to-cyan-500" },
  { icon: AlertCircle, label: "Reportar problema", to: "/diagnostico", color: "from-orange-400 to-red-500" },
  { icon: CalendarPlus, label: "Agendar instalación", to: "/agendar", color: "from-violet-400 to-blue-500" },
  { icon: Wifi, label: "Ver planes", to: "/planes", color: "from-blue-400 to-indigo-500" },
] as const;

function HomePage() {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");

  return (
    <>
      {/* HERO — How can we help you today? */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <video
            src="/videos/hero-loop.mp4"
            poster={portalHero}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-32 md:px-6 md:pt-24 md:pb-40">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              Portal de autogestión 24/7
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl">
              ¿Cómo podemos <span className="text-brand">ayudarte</span> hoy?
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/80 md:text-lg">
              Resuelve lo que necesitas en segundos. Sin llamadas, sin filas, sin esperas.
            </p>

            {/* Help options pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              {helpOptions.map((o) => (
                <Link
                  key={o.label}
                  to={o.to}
                  className="group flex items-center gap-2 rounded-full bg-white/95 px-4 py-3 text-sm font-semibold text-primary shadow-card backdrop-blur transition hover:scale-105 hover:bg-white"
                >
                  <span className={`grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br ${o.color} text-white`}>
                    <o.icon className="h-4 w-4" />
                  </span>
                  {o.label}
                  <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Floating coverage search card */}
        <div className="relative mx-auto -mt-20 max-w-5xl px-4 md:px-6">
          <Card className="overflow-hidden border-0 bg-white p-6 shadow-glow md:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/15 text-primary">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold md:text-xl">Verifica cobertura al instante</h2>
                <p className="text-xs text-muted-foreground md:text-sm">Escribe tu dirección o barrio y ve los planes disponibles.</p>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/cobertura" });
              }}
              className="mt-5 flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej: Av. 5 # 12-34, Barrio La Libertad, Cúcuta"
                  className="h-12 w-full rounded-xl border border-input bg-muted/40 pl-11 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  maxLength={120}
                />
              </div>
              <Button type="submit" size="lg" className="h-12 bg-gradient-brand text-primary-foreground shadow-soft hover:opacity-90">
                Verificar
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* QUICK ACTIONS PANEL */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Accesos rápidos</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Lo que más necesitas, a un clic</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: AlertCircle, title: "Internet no funciona", desc: "Diagnóstico guiado paso a paso", to: "/diagnostico", accent: "bg-red-500/10 text-red-600", cta: "Solucionar ahora" },
            { icon: FileText, title: "Ver factura", desc: "Consulta y paga tu mes en línea", to: "/pagar", accent: "bg-emerald-500/10 text-emerald-600", cta: "Ir a facturas" },
            { icon: Headphones, title: "Hablar con soporte", desc: "Crea un ticket o chatea", to: "/soporte", accent: "bg-violet-500/10 text-violet-600", cta: "Contactar" },
            { icon: Wifi, title: "Contratar servicio", desc: "Encuentra tu plan ideal", to: "/recomendador", accent: "bg-brand/15 text-primary", cta: "Empezar" },
          ].map((a) => (
            <Link key={a.title} to={a.to} className="group">
              <Card className="h-full border-border/60 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
                <div className={`mb-4 inline-grid h-14 w-14 place-items-center rounded-2xl ${a.accent}`}>
                  <a.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-lg font-bold">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  {a.cta} <ArrowRight className="h-4 w-4" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* SMART PLAN SELECTOR teaser */}
      <section className="bg-gradient-hero py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Recomendador inteligente</span>
              <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
                Encuentra tu plan ideal en <span className="text-gradient-brand">3 preguntas</span>
              </h2>
              <p className="mt-4 max-w-lg text-muted-foreground">
                Cuéntanos cómo usas internet en casa y te recomendamos el plan que mejor se ajusta a tu familia, sin pagar de más.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Cuántas personas conectadas",
                  "Para qué lo usan (streaming, gaming, trabajo)",
                  "Si necesitas TV con canales premium",
                ].map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-success/15 text-success"><Check className="h-3.5 w-3.5" /></span>
                    {b}
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="mt-8 bg-gradient-brand text-primary-foreground shadow-glow">
                <Link to="/recomendador">
                  Empezar recomendador <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-brand opacity-15 blur-3xl" />
              <Card className="relative border-0 bg-white p-6 shadow-glow md:p-8">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">Pregunta 1 / 3</span>
                  <Sparkles className="h-5 w-5 text-brand" />
                </div>
                <p className="mt-4 font-display text-xl font-bold">¿Cuántas personas usarán internet en casa?</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {["1–2 personas", "3–4 personas", "5–6 personas", "Más de 6"].map((o) => (
                    <Link key={o} to="/recomendador" className="rounded-xl border-2 border-border bg-muted/40 px-4 py-3 text-sm font-medium transition hover:border-brand hover:bg-brand/10 hover:text-primary">
                      {o}
                    </Link>
                  ))}
                </div>
                <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-1/3 rounded-full bg-gradient-brand" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* SELF-SERVICE DASHBOARD CARDS */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Tu panel</span>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Todo lo que necesitas, en tu mano</h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Status card */}
          <Card className="overflow-hidden border-0 bg-gradient-dark p-6 text-primary-foreground shadow-card">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-bold uppercase text-success">Operativo</span>
              <Activity className="h-5 w-5 text-brand" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold">Estado de la red</h3>
            <p className="mt-1 text-sm text-white/70">Sin incidencias reportadas en tu zona.</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div>
                <p className="font-display text-2xl font-bold">99.9%</p>
                <p className="text-[11px] text-white/60">Uptime</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold">12ms</p>
                <p className="text-[11px] text-white/60">Latencia</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold">600</p>
                <p className="text-[11px] text-white/60">Mbps máx</p>
              </div>
            </div>
            <Link to="/test-velocidad" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:gap-2 transition-all">
              Probar mi velocidad <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          {/* Tickets card */}
          <Card className="border-border/60 bg-white p-6 shadow-soft transition hover:shadow-card">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-600">
                <FileText className="h-5 w-5" />
              </span>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold">Mis tickets y PQR</h3>
            <p className="mt-1 text-sm text-muted-foreground">Sigue el estado de tus solicitudes en tiempo real.</p>
            <div className="mt-5 rounded-xl border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold">TN-849201</span>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-700">En proceso</span>
              </div>
              <p className="mt-1 text-sm font-medium">Falla intermitente de señal</p>
            </div>
            <Link to="/mis-tickets" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          {/* Billing card */}
          <Card className="border-border/60 bg-white p-6 shadow-soft transition hover:shadow-card">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CreditCard className="h-5 w-5" />
              </span>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold">Mi factura</h3>
            <p className="mt-1 text-sm text-muted-foreground">Próximo vencimiento: 15 de mayo</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-primary">$89.900</span>
              <span className="text-sm text-muted-foreground">/ mes</span>
            </div>
            <Link to="/pagar" className="mt-5 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 transition">
              Pagar ahora <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
      </section>

      {/* COVERAGE BANNER */}
      <section className="px-4 pb-20 md:px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] shadow-glow">
          <div className="relative grid items-center gap-8 p-8 md:grid-cols-2 md:p-14">
            <div className="absolute inset-0 -z-10">
              <img src={coverageCity} alt="" loading="lazy" className="h-full w-full object-cover" width={1536} height={1024} />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/60" />
            </div>
            <div className="text-primary-foreground">
              <h2 className="font-display text-3xl font-bold md:text-4xl">¿Listo para conectarte?</h2>
              <p className="mt-3 max-w-xl text-white/80">
                Verifica cobertura, elige tu plan y agenda la instalación en menos de 5 minutos.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Button asChild size="lg" className="bg-brand text-primary hover:bg-brand/90 shadow-card">
                <Link to="/cobertura">
                  <MapPin className="mr-1 h-4 w-4" /> Ver cobertura
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link to="/agendar">
                  <CalendarPlus className="mr-1 h-4 w-4" /> Agendar instalación
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section className="border-t border-border/60 bg-muted/30 py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-4 md:px-6">
          {[
            { icon: Tv, title: "+120 canales HD", desc: "Entretenimiento para toda la familia" },
            { icon: Zap, title: "Fibra óptica", desc: "Velocidad simétrica garantizada" },
            { icon: ShieldCheck, title: "Operador autorizado", desc: "Vigilados por CRC y MinTIC" },
            { icon: MessageSquare, title: "Soporte 24/7", desc: "Chat, WhatsApp y oficina física" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/15 text-primary">
                <f.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display font-bold">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
