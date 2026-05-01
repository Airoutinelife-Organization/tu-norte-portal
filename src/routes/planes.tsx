import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Wifi, Tv, Sparkles, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/planes")({
  head: () => ({
    meta: [
      { title: "Planes de Internet y TV — Tu Norte TV" },
      { name: "description", content: "Compara nuestros planes de internet de fibra óptica y televisión. Desde 100 hasta 600 Mbps con canales HD." },
      { property: "og:title", content: "Planes de Internet y TV — Tu Norte TV" },
      { property: "og:description", content: "Planes desde $59.900/mes con fibra óptica simétrica y televisión HD." },
    ],
  }),
  component: PlanesPage,
});

const internetPlans = [
  { name: "Inicio", speed: 10, price: "35.000", perks: ["10 Mbps por fibra óptica", "Plan simétrico", "Router WiFi incluido", "Soporte 24/7"] },
  { name: "Básico", speed: 20, price: "40.000", perks: ["20 Mbps por fibra óptica", "Plan simétrico", "Router WiFi incluido", "Soporte 24/7"] },
  { name: "Hogar", speed: 50, price: "65.000", popular: true, perks: ["50 Mbps por fibra óptica", "Plan simétrico", "WiFi de alto rendimiento", "Instalación incluida", "Soporte 24/7"] },
  { name: "Familiar", speed: 100, price: "95.000", perks: ["100 Mbps por fibra óptica", "Plan simétrico", "WiFi de alto rendimiento", "Instalación incluida", "Soporte prioritario"] },
  { name: "Premium", speed: 200, price: "145.000", perks: ["200 Mbps por fibra óptica", "Plan simétrico", "WiFi mesh recomendado", "Instalación incluida", "Soporte VIP"] },
];

const comboPlans = [
  { name: "Combo 10", speed: 10, channels: 180, price: "45.000", perks: ["10 Mbps + TV Digital FTTH", "+180 canales (Full HD y Análogo)", "1 decodificador", "Soporte 24/7"] },
  { name: "Combo 20", speed: 20, channels: 180, price: "50.000", perks: ["20 Mbps + TV Digital FTTH", "+180 canales (Full HD y Análogo)", "1 decodificador", "Soporte 24/7"] },
  { name: "Combo 50", speed: 50, channels: 180, price: "85.000", popular: true, perks: ["50 Mbps + TV Digital FTTH", "+180 canales (Full HD y Análogo)", "1 decodificador", "Instalación incluida", "Soporte 24/7"] },
  { name: "Combo 100", speed: 100, channels: 180, price: "105.000", perks: ["100 Mbps + TV Digital FTTH", "+180 canales (Full HD y Análogo)", "2 decodificadores", "Instalación incluida", "Soporte prioritario"] },
  { name: "Combo 200", speed: 200, channels: 180, price: "155.000", perks: ["200 Mbps + TV Digital FTTH", "+180 canales (Full HD y Análogo)", "2 decodificadores", "Instalación incluida", "Soporte VIP"] },
];

type Channel = { name: string; category: string; hd?: boolean };

const channels: Channel[] = [
  // Nacionales / Locales
  { name: "Caracol", category: "Nacionales", hd: true },
  { name: "RCN", category: "Nacionales", hd: true },
  { name: "Canal 1", category: "Nacionales", hd: true },
  { name: "Señal Colombia", category: "Nacionales", hd: true },
  { name: "Canal Institucional", category: "Nacionales" },
  { name: "Canal Congreso", category: "Nacionales" },
  { name: "CityTV", category: "Nacionales", hd: true },
  { name: "Telecaribe", category: "Nacionales", hd: true },
  { name: "TRO", category: "Nacionales", hd: true },
  { name: "Teleantioquia", category: "Nacionales" },
  { name: "Telepacífico", category: "Nacionales" },
  { name: "Telecafé", category: "Nacionales" },
  { name: "Canal Capital", category: "Nacionales" },
  { name: "Canal Trece", category: "Nacionales" },

  // Noticias
  { name: "CNN en Español", category: "Noticias", hd: true },
  { name: "CNN Internacional", category: "Noticias", hd: true },
  { name: "NTN24", category: "Noticias", hd: true },
  { name: "France 24", category: "Noticias" },
  { name: "DW", category: "Noticias" },
  { name: "TeleSUR", category: "Noticias" },
  { name: "Bloomberg", category: "Noticias" },
  { name: "Caracol Noticias", category: "Noticias", hd: true },

  // Deportes
  { name: "ESPN", category: "Deportes", hd: true },
  { name: "ESPN 2", category: "Deportes", hd: true },
  { name: "ESPN 3", category: "Deportes", hd: true },
  { name: "ESPN 4", category: "Deportes", hd: true },
  { name: "Win Sports", category: "Deportes", hd: true },
  { name: "Win Sports +", category: "Deportes", hd: true },
  { name: "DirecTV Sports", category: "Deportes", hd: true },
  { name: "Fox Sports", category: "Deportes", hd: true },
  { name: "Golf Channel", category: "Deportes" },

  // Películas y Series
  { name: "FX", category: "Películas y Series", hd: true },
  { name: "FXM", category: "Películas y Series", hd: true },
  { name: "Fox", category: "Películas y Series", hd: true },
  { name: "Sony", category: "Películas y Series", hd: true },
  { name: "Universal", category: "Películas y Series", hd: true },
  { name: "Warner Channel", category: "Películas y Series", hd: true },
  { name: "TNT", category: "Películas y Series", hd: true },
  { name: "TNT Series", category: "Películas y Series", hd: true },
  { name: "Space", category: "Películas y Series", hd: true },
  { name: "Cinemax", category: "Películas y Series", hd: true },
  { name: "AXN", category: "Películas y Series", hd: true },
  { name: "AMC", category: "Películas y Series", hd: true },
  { name: "Studio Universal", category: "Películas y Series", hd: true },
  { name: "Cinecanal", category: "Películas y Series", hd: true },
  { name: "Multipremier", category: "Películas y Series" },
  { name: "Multicinema", category: "Películas y Series" },
  { name: "De Película", category: "Películas y Series" },

  // Entretenimiento / Lifestyle
  { name: "E! Entertainment", category: "Entretenimiento", hd: true },
  { name: "ID — Investigation Discovery", category: "Entretenimiento", hd: true },
  { name: "TLC", category: "Entretenimiento", hd: true },
  { name: "Lifetime", category: "Entretenimiento", hd: true },
  { name: "Discovery Home & Health", category: "Entretenimiento", hd: true },
  { name: "Discovery Familia", category: "Entretenimiento" },
  { name: "Glitz*", category: "Entretenimiento" },
  { name: "truTV", category: "Entretenimiento" },
  { name: "A&E", category: "Entretenimiento", hd: true },
  { name: "Syfy", category: "Entretenimiento", hd: true },
  { name: "Comedy Central", category: "Entretenimiento", hd: true },

  // Música
  { name: "MTV", category: "Música", hd: true },
  { name: "MTV Hits", category: "Música" },
  { name: "VH1", category: "Música" },
  { name: "HTV", category: "Música" },
  { name: "Ve Plus", category: "Música" },

  // Documentales / Cultura
  { name: "Discovery Channel", category: "Documentales", hd: true },
  { name: "Discovery Turbo", category: "Documentales", hd: true },
  { name: "Discovery Science", category: "Documentales" },
  { name: "Discovery Theater", category: "Documentales" },
  { name: "National Geographic", category: "Documentales", hd: true },
  { name: "Nat Geo Wild", category: "Documentales", hd: true },
  { name: "History Channel", category: "Documentales", hd: true },
  { name: "H2", category: "Documentales" },
  { name: "Animal Planet", category: "Documentales", hd: true },
  { name: "Film & Arts", category: "Documentales" },

  // Infantiles
  { name: "Disney Channel", category: "Infantiles", hd: true },
  { name: "Disney Junior", category: "Infantiles", hd: true },
  { name: "Disney XD", category: "Infantiles" },
  { name: "Cartoon Network", category: "Infantiles", hd: true },
  { name: "Boomerang", category: "Infantiles" },
  { name: "Tooncast", category: "Infantiles" },
  { name: "Nick", category: "Infantiles", hd: true },
  { name: "Nick Jr.", category: "Infantiles" },
  { name: "Discovery Kids", category: "Infantiles", hd: true },
  { name: "BabyTV", category: "Infantiles" },

  // Religiosos / Comunidad
  { name: "EWTN", category: "Religiosos" },
  { name: "Enlace", category: "Religiosos" },
  { name: "Cristovisión", category: "Religiosos" },
  { name: "TBN", category: "Religiosos" },

  // Internacionales
  { name: "TV5 Monde", category: "Internacionales" },
  { name: "RAI Italia", category: "Internacionales" },
  { name: "TVE Internacional", category: "Internacionales" },
  { name: "Antena 3 Internacional", category: "Internacionales" },
  { name: "Canal de las Estrellas", category: "Internacionales" },
];

const channelCategories = [
  "Todos",
  "Nacionales",
  "Noticias",
  "Deportes",
  "Películas y Series",
  "Entretenimiento",
  "Música",
  "Documentales",
  "Infantiles",
  "Religiosos",
  "Internacionales",
];

function PlanCard({ p, type }: { p: any; type: "internet" | "combo" }) {
  return (
    <Card className={`relative overflow-hidden border-0 p-7 shadow-card transition hover:-translate-y-1 ${p.popular ? "bg-gradient-dark text-primary-foreground shadow-glow" : "bg-white"}`}>
      {p.popular && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
          <Sparkles className="h-3 w-3" /> Más elegido
        </span>
      )}
      <div className="flex gap-2">
        <Wifi className={`h-7 w-7 ${p.popular ? "text-brand" : "text-primary"}`} />
        {type === "combo" && <Tv className={`h-7 w-7 ${p.popular ? "text-brand" : "text-primary"}`} />}
      </div>
      <h3 className="mt-4 font-display text-2xl font-bold">{p.name}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className={`font-display text-5xl font-bold ${p.popular ? "" : "text-primary"}`}>{p.speed}</span>
        <span className="text-sm font-semibold opacity-80">Mbps</span>
      </div>
      {type === "combo" && <p className={`mt-1 text-sm font-semibold ${p.popular ? "text-brand" : "text-brand"}`}>+{p.channels} canales HD</p>}
      <p className={`mt-4 text-xs uppercase tracking-wider ${p.popular ? "text-white/60" : "text-muted-foreground"}`}>Desde</p>
      <p className="font-display text-3xl font-bold">${p.price}<span className="text-sm font-normal opacity-70">/mes</span></p>
      <ul className="mt-5 space-y-2.5 text-sm">
        {p.perks.map((x: string) => (
          <li key={x} className="flex items-center gap-2"><Check className={`h-4 w-4 shrink-0 ${p.popular ? "text-brand" : "text-success"}`} /> {x}</li>
        ))}
      </ul>
      <Button asChild className={`mt-6 w-full ${p.popular ? "bg-brand text-primary hover:bg-brand/90" : "bg-gradient-brand text-primary-foreground"}`}>
        <Link to="/cobertura">Contratar</Link>
      </Button>
    </Card>
  );
}

function PlanesPage() {
  return (
    <>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center md:px-6 md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-white/60 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-brand" /> Sin permanencias forzadas
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight md:text-5xl">Planes a tu <span className="text-gradient-brand">medida</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Internet de fibra óptica simétrica y televisión HD. Elige solo internet o nuestros combos con TV.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <Tabs defaultValue="combo" className="w-full">
          <TabsList className="mx-auto mb-10 grid h-12 w-full max-w-md grid-cols-2 rounded-full bg-muted p-1">
            <TabsTrigger value="combo" className="rounded-full data-[state=active]:bg-gradient-brand data-[state=active]:text-primary-foreground data-[state=active]:shadow-soft">Internet + TV</TabsTrigger>
            <TabsTrigger value="internet" className="rounded-full data-[state=active]:bg-gradient-brand data-[state=active]:text-primary-foreground data-[state=active]:shadow-soft">Solo Internet</TabsTrigger>
          </TabsList>

          <TabsContent value="combo">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {comboPlans.map((p) => <PlanCard key={p.name} p={p} type="combo" />)}
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">Combos TVN Norte — Televisión Digital FTTH con más de 180 canales en Full HD y Análogo. Precios mensuales.</p>
          </TabsContent>
          <TabsContent value="internet">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {internetPlans.map((p) => <PlanCard key={p.name} p={p} type="internet" />)}
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">Planes simétricos por fibra óptica. Mayor calidad, mayor servicio, mayor velocidad al precio justo.</p>
          </TabsContent>
        </Tabs>
      </section>

      <ChannelLineup />

      <section className="mx-auto max-w-5xl px-4 py-12 md:px-6">
        <Card className="overflow-hidden border-0 bg-gradient-dark p-8 text-primary-foreground shadow-glow md:p-12">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-2xl font-bold md:text-3xl">¿Necesitas un plan empresarial?</h2>
              <p className="mt-2 text-white/75">IP fijas, SLA garantizado, soporte dedicado y velocidades simétricas hasta 1 Gbps.</p>
            </div>
            <Button asChild size="lg" className="bg-brand text-primary hover:bg-brand/90"><Link to="/soporte">Contactar ventas</Link></Button>
          </div>
        </Card>
      </section>
    </>
  );
}
