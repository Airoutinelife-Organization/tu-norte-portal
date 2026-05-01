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

// Map channel name -> official domain. Logos are fetched via Google's favicon service
// (sz=128) which serves the brand's high-res favicon/logo.
const channelDomains: Record<string, string> = {
  // Nacionales
  "Caracol": "caracoltv.com",
  "RCN": "canalrcn.com",
  "Canal 1": "canal1.com.co",
  "Señal Colombia": "senalcolombia.tv",
  "Canal Institucional": "canalinstitucional.tv",
  "Canal Congreso": "canalcongreso.tv",
  "CityTV": "citytv.com.co",
  "Telecaribe": "telecaribe.co",
  "TRO": "canaltro.com",
  "Teleantioquia": "teleantioquia.co",
  "Telepacífico": "telepacifico.com",
  "Telecafé": "telecafe.gov.co",
  "Canal Capital": "canalcapital.gov.co",
  "Canal Trece": "canaltrece.com.co",
  // Noticias
  "CNN en Español": "cnnespanol.cnn.com",
  "CNN Internacional": "cnn.com",
  "NTN24": "ntn24.com",
  "France 24": "france24.com",
  "DW": "dw.com",
  "TeleSUR": "telesurtv.net",
  "Bloomberg": "bloomberg.com",
  "Caracol Noticias": "noticiascaracol.com",
  // Deportes
  "ESPN": "espn.com",
  "ESPN 2": "espn.com",
  "ESPN 3": "espn.com",
  "ESPN 4": "espn.com",
  "Win Sports": "winsports.co",
  "Win Sports +": "winsports.co",
  "DirecTV Sports": "directvsports.com",
  "Fox Sports": "foxsports.com",
  "Golf Channel": "golfchannel.com",
  // Películas y Series
  "FX": "fxnetworks.com",
  "FXM": "fxnetworks.com",
  "Fox": "fox.com",
  "Sony": "sonychannel.com",
  "Universal": "universalchannel.com",
  "Warner Channel": "warnerchannel.com",
  "TNT": "tntla.com",
  "TNT Series": "tntla.com",
  "Space": "spacetv.com",
  "Cinemax": "cinemax.com",
  "AXN": "axn.com",
  "AMC": "amc.com",
  "Studio Universal": "studiouniversal.com",
  "Cinecanal": "cinecanal.com",
  "Multipremier": "multipremier.tv",
  "Multicinema": "multicinema.tv",
  "De Película": "depelicula.tv",
  // Entretenimiento
  "E! Entertainment": "eonline.com",
  "ID — Investigation Discovery": "investigationdiscovery.com",
  "TLC": "tlc.com",
  "Lifetime": "mylifetime.com",
  "Discovery Home & Health": "discoverymujer.com",
  "Discovery Familia": "discoveryfamilia.com",
  "Glitz*": "glitz.tv",
  "truTV": "trutv.com",
  "A&E": "aetv.com",
  "Syfy": "syfy.com",
  "Comedy Central": "comedycentral.com",
  // Música
  "MTV": "mtv.com",
  "MTV Hits": "mtv.com",
  "VH1": "vh1.com",
  "HTV": "htv.tv",
  "Ve Plus": "veplus.tv",
  // Documentales
  "Discovery Channel": "discovery.com",
  "Discovery Turbo": "discovery.com",
  "Discovery Science": "sciencechannel.com",
  "Discovery Theater": "discovery.com",
  "National Geographic": "nationalgeographic.com",
  "Nat Geo Wild": "natgeotv.com",
  "History Channel": "history.com",
  "H2": "history.com",
  "Animal Planet": "animalplanet.com",
  "Film & Arts": "filmandarts.tv",
  // Infantiles
  "Disney Channel": "disney.com",
  "Disney Junior": "disneyjunior.com",
  "Disney XD": "disneyxd.disney.com",
  "Cartoon Network": "cartoonnetwork.com",
  "Boomerang": "boomerang.com",
  "Tooncast": "tooncast.tv",
  "Nick": "nick.com",
  "Nick Jr.": "nickjr.com",
  "Discovery Kids": "discoverykids.com",
  "BabyTV": "babytv.com",
  // Religiosos
  "EWTN": "ewtn.com",
  "Enlace": "enlace.org",
  "Cristovisión": "cristovision.tv",
  "TBN": "tbn.org",
  // Internacionales
  "TV5 Monde": "tv5monde.com",
  "RAI Italia": "rai.it",
  "TVE Internacional": "rtve.es",
  "Antena 3 Internacional": "antena3.com",
  "Canal de las Estrellas": "televisa.com",
};

function getChannelLogo(name: string): string | null {
  const domain = channelDomains[name];
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

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

function ChannelLineup() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("Todos");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return channels.filter((c) => {
      const matchesCat = activeCat === "Todos" || c.category === activeCat;
      const matchesQuery = !q || c.name.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [query, activeCat]);

  const hdCount = channels.filter((c) => c.hd).length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <Tv className="h-3.5 w-3.5 text-brand" /> Parrilla TVN Norte FTTH
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Conoce los <span className="text-gradient-brand">canales incluidos</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Más de {channels.length}+ canales en Full HD y análogo, entretenimiento para toda la familia.
        </p>
      </div>

      <Card className="overflow-hidden border-0 bg-white p-6 shadow-card md:p-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 border-b border-muted pb-5 text-center">
          <div>
            <p className="font-display text-2xl font-bold text-primary md:text-3xl">{channels.length}+</p>
            <p className="text-xs text-muted-foreground">Canales totales</p>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-primary md:text-3xl">{hdCount}</p>
            <p className="text-xs text-muted-foreground">En Full HD</p>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-primary md:text-3xl">{channelCategories.length - 1}</p>
            <p className="text-xs text-muted-foreground">Categorías</p>
          </div>
        </div>

        {/* Search + filters */}
        <div className="mt-5 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Busca un canal (ej. ESPN, Disney, CNN)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {channelCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeCat === cat
                    ? "bg-gradient-brand text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Channel grid */}
        <div className="mt-6">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No encontramos canales con "{query}".
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((c) => {
                const logo = getChannelLogo(c.name);
                return (
                  <li
                    key={c.name}
                    className="flex items-center gap-2.5 rounded-lg border border-muted bg-background px-2.5 py-2 text-sm transition hover:border-brand/40 hover:bg-brand/5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/40 ring-1 ring-border">
                      {logo ? (
                        <img
                          src={logo}
                          alt={`${c.name} logo`}
                          loading="lazy"
                          className="h-7 w-7 object-contain"
                          onError={(e) => {
                            const el = e.currentTarget;
                            el.style.display = "none";
                            const fallback = el.nextElementSibling as HTMLElement | null;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded text-[11px] font-bold text-brand"
                        style={{ display: logo ? "none" : "flex" }}
                      >
                        {c.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="flex-1 truncate font-medium text-primary">{c.name}</span>
                    {c.hd && (
                      <span className="rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-bold text-brand">HD</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          * La parrilla puede variar según disponibilidad regional. Sujeto a cambios sin previo aviso.
        </p>
      </Card>
    </section>
  );
}
