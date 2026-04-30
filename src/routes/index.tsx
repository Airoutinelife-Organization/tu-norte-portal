import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Wifi, Tv, Zap, ShieldCheck, Headphones, Gauge, FileText, MessageSquare,
  ArrowRight, Check, MapPin, Sparkles
} from "lucide-react";
import hero from "@/assets/hero.jpg";
import network from "@/assets/network.jpg";
import tvFamily from "@/assets/tv-family.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tu Norte TV — Internet de Fibra y TV en Cúcuta" },
      { name: "description", content: "Planes de internet de fibra óptica + televisión HD en Norte de Santander. Test de velocidad, soporte 24/7 y oficina virtual." },
      { property: "og:title", content: "Tu Norte TV — Internet de Fibra y TV en Cúcuta" },
      { property: "og:description", content: "Planes de internet y televisión con la mejor calidad de Norte de Santander." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 -z-0 opacity-40">
          <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-brand/30 blur-3xl" />
          <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-white/60 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              Fibra óptica · Hasta 600 Megas
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Televisión e internet de <span className="text-gradient-brand">calidad</span> bajo tarifas equitativas
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Conectamos a Norte de Santander con la mejor red de fibra óptica y una experiencia de TV pensada para tu familia.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
                <Link to="/planes">Conoce nuestros planes <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2">
                <Link to="/cobertura"><MapPin className="mr-1 h-4 w-4" /> Verificar cobertura</Link>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                { v: "+15", l: "años conectando" },
                { v: "99.9%", l: "uptime garantizado" },
                { v: "24/7", l: "soporte técnico" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-display text-2xl font-bold text-primary md:text-3xl">{s.v}</p>
                  <p className="text-xs text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-0 rounded-[3rem] bg-gradient-brand opacity-20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border-8 border-white/60 shadow-glow">
              <img src={hero} alt="Cliente Tu Norte TV con internet de fibra óptica" width={1280} height={1280} className="aspect-square w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden animate-float rounded-2xl bg-white p-4 shadow-card md:block">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-success/10"><Zap className="h-6 w-6 text-success" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Velocidad real</p>
                  <p className="font-display text-lg font-bold">600 Mbps ↓</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 top-10 hidden animate-float rounded-2xl bg-white p-4 shadow-card md:block" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand/15"><Tv className="h-6 w-6 text-primary" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">+120 canales</p>
                  <p className="font-display text-lg font-bold">HD & 4K</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="relative -mt-1 bg-gradient-brand pt-2">
        <div className="mx-auto -translate-y-12 max-w-7xl px-4 md:px-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { icon: Gauge, title: "Test de Velocidad", desc: "Mide tu conexión", to: "/test-velocidad", cta: "Realizar" },
              { icon: FileText, title: "Radicar PQR", desc: "Peticiones, quejas y reclamos", to: "/pqr", cta: "Solicitar" },
              { icon: Headphones, title: "Atención al Cliente", desc: "Canales de soporte", to: "/soporte", cta: "Consultar" },
              { icon: MapPin, title: "Cobertura", desc: "¿Llegamos a tu zona?", to: "/cobertura", cta: "Verificar" },
            ].map((a) => (
              <Card key={a.title} className="group relative overflow-hidden border-0 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-glow">
                <div className="mb-4 inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-soft">
                  <a.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-lg font-bold">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
                <Link to={a.to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  {a.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Somos expertos</span>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
              Telecomunicaciones que <span className="text-gradient-brand">impulsan</span> el norte
            </h2>
            <p className="mt-4 text-muted-foreground">
              Proporcionamos servicios de telecomunicaciones a través de redes tecnológicamente actualizadas, cumpliendo la normativa vigente e impulsando el crecimiento económico de nuestra región.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Red 100% fibra óptica FTTH",
                "Cumplimiento normativa CRC y MinTIC",
                "Tarifas equitativas y sin sorpresas",
                "Atención local en Cúcuta y municipios",
              ].map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-success/15 text-success"><Check className="h-3.5 w-3.5" /></span>
                  <span className="text-sm">{b}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 bg-gradient-brand text-primary-foreground"><Link to="/empresa">Conoce la empresa</Link></Button>
          </div>
          <div className="order-1 grid grid-cols-2 gap-4 lg:order-2">
            <img src={network} alt="Red de fibra óptica" width={1280} height={720} loading="lazy" className="col-span-2 aspect-[16/9] w-full rounded-3xl object-cover shadow-card" />
            <img src={tvFamily} alt="Familia disfrutando TV" width={1280} height={960} loading="lazy" className="aspect-square w-full rounded-3xl object-cover shadow-card" />
            <div className="grid place-items-center rounded-3xl bg-gradient-brand p-6 text-primary-foreground shadow-card">
              <div>
                <p className="font-display text-5xl font-bold">600</p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wider">Megas máx.</p>
                <p className="mt-3 text-sm opacity-80">Simétricos en planes Premium</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PLANS */}
      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Nuestros planes</span>
              <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Conexión para cada hogar</h2>
            </div>
            <Button asChild variant="ghost" className="text-primary"><Link to="/planes">Ver todos los planes <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Hogar", speed: "100", price: "59.900", popular: false, perks: ["100 Mbps simétricos", "WiFi 6 incluido", "Soporte 24/7"] },
              { name: "Familiar", speed: "300", price: "89.900", popular: true, perks: ["300 Mbps simétricos", "+90 canales HD", "Decodificador incluido", "Instalación gratis"] },
              { name: "Premium", speed: "600", price: "129.900", popular: false, perks: ["600 Mbps simétricos", "+120 canales HD/4K", "2 decodificadores", "IP fija opcional"] },
            ].map((p) => (
              <Card key={p.name} className={`relative overflow-hidden border-0 p-7 shadow-card transition hover:-translate-y-1 ${p.popular ? "bg-gradient-dark text-primary-foreground shadow-glow" : "bg-white"}`}>
                {p.popular && <span className="absolute right-4 top-4 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Más elegido</span>}
                <Wifi className={`h-8 w-8 ${p.popular ? "text-brand" : "text-primary"}`} />
                <h3 className={`mt-4 font-display text-2xl font-bold ${p.popular ? "" : ""}`}>{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={`font-display text-5xl font-bold ${p.popular ? "" : "text-primary"}`}>{p.speed}</span>
                  <span className="text-sm font-semibold opacity-80">Mbps</span>
                </div>
                <p className={`mt-4 text-sm ${p.popular ? "text-white/70" : "text-muted-foreground"}`}>Desde</p>
                <p className="font-display text-2xl font-bold">${p.price}<span className="text-sm font-normal opacity-70">/mes</span></p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {p.perks.map((x) => (
                    <li key={x} className="flex items-center gap-2">
                      <Check className={`h-4 w-4 ${p.popular ? "text-brand" : "text-success"}`} /> {x}
                    </li>
                  ))}
                </ul>
                <Button asChild className={`mt-6 w-full ${p.popular ? "bg-brand text-primary hover:bg-brand/90" : "bg-gradient-brand text-primary-foreground"}`}>
                  <Link to="/planes">Contratar</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">¿Por qué elegir <span className="text-gradient-brand">Tu Norte</span>?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Tecnología, atención y respaldo regulatorio que solo un operador local puede ofrecer.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Zap, title: "Fibra óptica", desc: "Velocidad simétrica y baja latencia para gaming y trabajo remoto." },
            { icon: ShieldCheck, title: "Operador autorizado", desc: "Vigilados por la CRC y MinTIC. Cumplimiento total." },
            { icon: Headphones, title: "Soporte humano", desc: "Atención telefónica, WhatsApp y oficina física en Cúcuta." },
            { icon: MessageSquare, title: "Oficina virtual", desc: "Consulta saldo, descarga facturas y paga 100% en línea." },
          ].map((f) => (
            <Card key={f.title} className="border-border/60 bg-white p-6 shadow-soft transition hover:shadow-card">
              <div className="mb-4 inline-grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary"><f.icon className="h-6 w-6" /></div>
              <h3 className="font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="px-4 pb-20 md:px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-dark px-8 py-14 text-primary-foreground shadow-glow md:px-14">
          <div className="grid items-center gap-8 md:grid-cols-[1.5fr_1fr]">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">Conectemos tu hogar hoy mismo</h2>
              <p className="mt-3 max-w-xl text-white/75">Verifica si tenemos cobertura en tu zona y contrata en menos de 5 minutos. Instalación rápida y sin letra pequeña.</p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Button asChild size="lg" className="bg-brand text-primary hover:bg-brand/90"><Link to="/cobertura">Verificar cobertura <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"><Link to="/planes">Ver planes</Link></Button>
            </div>
          </div>
        </div>
      </section>

      {/* AWARENESS LINKS */}
      <section className="border-t border-border/60 bg-muted/30 py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Canales de denuncia y entidades aliadas</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { name: "ICBF", url: "https://www.icbf.gov.co/", desc: "Bienestar familiar" },
              { name: "CAI Virtual", url: "https://caivirtual.policia.gov.co/", desc: "Policía Nacional" },
              { name: "En TIC Confío", url: "https://www.enticconfio.gov.co/", desc: "Internet seguro" },
              { name: "Fiscalía", url: "https://www.fiscalia.gov.co/", desc: "Denuncias" },
            ].map((l) => (
              <a key={l.name} href={l.url} target="_blank" rel="noreferrer" className="group rounded-2xl border border-border bg-white p-5 text-center transition hover:border-brand hover:shadow-soft">
                <p className="font-display text-base font-bold text-primary group-hover:text-brand">{l.name}</p>
                <p className="text-xs text-muted-foreground">{l.desc}</p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-brand">Denuncie aquí →</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
