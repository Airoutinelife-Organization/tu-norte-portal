import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, CheckCircle2, XCircle, Loader2, Phone, Search, Sparkles } from "lucide-react";
import { CucutaFiberMap } from "@/components/CucutaFiberMap";
import { COVERAGE_ZONES } from "@/data/coverage";

export const Route = createFileRoute("/cobertura")({
  head: () => ({
    meta: [
      { title: "Verificar cobertura — Tu Norte Portal" },
      { name: "description", content: "Verifica si tenemos cobertura de fibra óptica en tu barrio o urbanización. +485 zonas activas en Norte de Santander." },
      { property: "og:title", content: "Verificar cobertura — Tu Norte Portal" },
      { property: "og:description", content: "Consulta cobertura de fibra óptica en tu dirección en segundos." },
    ],
  }),
  component: CoberturaPage,
});

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

const NORMALIZED_ZONES = COVERAGE_ZONES.map((z) => ({ raw: z, norm: normalize(z) }));

function searchZones(query: string, limit = 8) {
  const q = normalize(query);
  if (!q) return [];
  const starts: string[] = [];
  const contains: string[] = [];
  for (const { raw, norm } of NORMALIZED_ZONES) {
    if (norm === q || norm.startsWith(q)) starts.push(raw);
    else if (norm.includes(q)) contains.push(raw);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}

function CoberturaPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "covered" | "not-covered" | "submitted">("idle");
  const [showSuggest, setShowSuggest] = useState(false);

  const suggestions = useMemo(() => searchZones(query), [query]);
  const hasExact = useMemo(() => {
    const q = normalize(query);
    return q && NORMALIZED_ZONES.some((z) => z.norm === q);
  }, [query]);

  const onCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setStatus("checking");
    setTimeout(() => {
      const match =
        selected ||
        NORMALIZED_ZONES.find((z) => z.norm === normalize(query))?.raw ||
        suggestions[0];
      if (match) {
        setSelected(match);
        setStatus("covered");
      } else {
        setStatus("not-covered");
      }
    }, 900);
  };

  const pickSuggestion = (s: string) => {
    setSelected(s);
    setQuery(s);
    setShowSuggest(false);
  };

  const onSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitted");
  };

  const reset = () => {
    setStatus("idle");
    setSelected(null);
    setQuery("");
    setAddress("");
  };

  return (
    <>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-white/60 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur">
              <MapPin className="h-3.5 w-3.5 text-brand" /> Cobertura en Norte de Santander
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold md:text-5xl">
              ¿Llegamos a <span className="text-gradient-brand">tu zona</span>?
            </h1>
            <p className="mt-4 text-muted-foreground">
              Busca tu barrio, urbanización o conjunto. Contamos con más de{" "}
              <strong className="text-primary">{COVERAGE_ZONES.length}</strong> zonas activas con fibra óptica.
            </p>
          </div>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-stretch">
            {/* LIVE MAP PANEL */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white shadow-card ring-1 ring-black/10">
              <CucutaFiberMap className="h-[420px] w-full md:h-[560px] lg:h-full" highlight={status === "covered" ? selected : null} address={status === "covered" ? address : null} />

              <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-2 p-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  Red en vivo
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur">
                  <MapPin className="h-3.5 w-3.5 text-brand" /> Cúcuta · N. de Santander
                </span>
              </div>

              {status === "covered" && (
                <div className="pointer-events-none absolute left-[54%] top-[27%] -translate-x-1/2 -translate-y-1/2">
                  <span className="absolute inset-0 -m-10 animate-ping rounded-full bg-success/50" />
                  <span className="absolute inset-0 -m-5 animate-ping rounded-full bg-success/70 [animation-delay:200ms]" />
                  <span className="relative grid h-8 w-8 place-items-center rounded-full bg-success text-white shadow-glow ring-4 ring-white/40">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-black/40 via-black/10 to-transparent p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur">
                    <span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" /> Fibra activa
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur">
                    <span className="h-2.5 w-2.5 rounded-full bg-warning animate-pulse" /> En construcción
                  </span>
                </div>
                <div className="hidden items-center gap-4 rounded-xl bg-black/55 px-4 py-2 text-white ring-1 ring-white/15 backdrop-blur sm:flex">
                  <div className="text-center">
                    <div className="font-display text-lg font-bold leading-none">{COVERAGE_ZONES.length}+</div>
                    <div className="text-[10px] uppercase tracking-wider opacity-70">Zonas</div>
                  </div>
                  <div className="h-8 w-px bg-white/15" />
                  <div className="text-center">
                    <div className="font-display text-lg font-bold leading-none">+24k</div>
                    <div className="text-[10px] uppercase tracking-wider opacity-70">Hogares</div>
                  </div>
                  <div className="h-8 w-px bg-white/15" />
                  <div className="text-center">
                    <div className="font-display text-lg font-bold leading-none">7</div>
                    <div className="text-[10px] uppercase tracking-wider opacity-70">Municipios</div>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM PANEL */}
            <div className="relative">
              <div className="sticky top-24 overflow-hidden rounded-3xl border border-white/15 bg-card/80 p-6 shadow-card ring-1 ring-black/5 backdrop-blur-xl md:p-8">
                <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/20 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />

                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-soft">
                    <Sparkles className="h-3 w-3" /> Verificación en vivo
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-bold leading-tight md:text-3xl">
                    Busca tu barrio o urbanización
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Escribe el nombre y te confirmamos si tienes cobertura al instante.
                  </p>

                  <div className="relative mt-6">
                    {status === "idle" || status === "checking" ? (
                      <form onSubmit={onCheck} className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="zone">Barrio, conjunto o urbanización</Label>
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="zone"
                              className="bg-background/80 pl-9"
                              placeholder="Ej. Atalaya, Torcoroma, Ceiba…"
                              autoComplete="off"
                              value={query}
                              onFocus={() => setShowSuggest(true)}
                              onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                              onChange={(e) => {
                                setQuery(e.target.value);
                                setSelected(null);
                                setShowSuggest(true);
                              }}
                              required
                            />
                            {showSuggest && suggestions.length > 0 && (
                              <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border bg-popover p-1 text-sm shadow-lg">
                                {suggestions.map((s) => (
                                  <button
                                    type="button"
                                    key={s}
                                    onMouseDown={(ev) => ev.preventDefault()}
                                    onClick={() => pickSuggestion(s)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-accent"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                                    <span className="truncate">{s}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {query && !hasExact && suggestions.length === 0 && (
                            <p className="text-xs text-warning">Sin coincidencias exactas — igual verificaremos con un asesor.</p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="addr">Dirección (opcional)</Label>
                          <Input
                            id="addr"
                            className="bg-background/80"
                            placeholder="Calle 10 # 5-23"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />
                        </div>
                        <Button type="submit" size="lg" disabled={status === "checking"} className="w-full bg-gradient-brand text-primary-foreground shadow-soft">
                          {status === "checking" ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando…</>
                          ) : (
                            "Verificar cobertura"
                          )}
                        </Button>
                        <p className="text-center text-[11px] text-muted-foreground">
                          Base de datos: {COVERAGE_ZONES.length} zonas activas
                        </p>
                      </form>
                    ) : status === "covered" ? (
                      <div className="text-center">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
                          <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h3 className="mt-4 font-display text-xl font-bold">¡Tenemos cobertura!</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Zona confirmada: <strong className="text-foreground">{selected}</strong>
                        </p>
                        <form onSubmit={onSubmitLead} className="mt-6 space-y-4 text-left">
                          <div className="grid gap-2"><Label htmlFor="n">Nombre completo</Label><Input id="n" className="bg-background/80" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                          <div className="grid gap-2"><Label htmlFor="p">Teléfono</Label><Input id="p" className="bg-background/80" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
                          <Button type="submit" size="lg" className="w-full bg-gradient-brand text-primary-foreground">Solicitar instalación</Button>
                          <button type="button" onClick={reset} className="w-full text-center text-xs text-muted-foreground underline">Buscar otra zona</button>
                        </form>
                      </div>
                    ) : status === "submitted" ? (
                      <div className="text-center">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
                          <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h3 className="mt-4 font-display text-xl font-bold">¡Solicitud recibida!</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Te contactaremos al {phone}.</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-warning/15 text-warning">
                          <XCircle className="h-8 w-8" />
                        </div>
                        <h3 className="mt-4 font-display text-xl font-bold">Aún no llegamos</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Estamos expandiendo nuestra red. Déjanos tus datos y te avisamos.</p>
                        <div className="mt-5 flex flex-col gap-2">
                          <Button onClick={reset} variant="outline">Probar otra dirección</Button>
                          <a href="tel:+576075759847" className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-brand px-5 py-2 text-sm font-semibold text-primary-foreground">
                            <Phone className="h-4 w-4" /> Llamar a un asesor
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coverage explorer */}
          <div className="mt-10 rounded-3xl border border-border bg-card/60 p-6 shadow-soft backdrop-blur md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-bold">Explora todas las zonas con cobertura</h3>
                <p className="text-sm text-muted-foreground">{COVERAGE_ZONES.length} barrios, conjuntos y urbanizaciones activas.</p>
              </div>
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">Actualizado</span>
            </div>
            <div className="mt-4 grid max-h-72 grid-cols-2 gap-x-4 gap-y-1 overflow-auto rounded-xl border border-border/60 bg-background/50 p-4 text-xs md:grid-cols-3 lg:grid-cols-4">
              {COVERAGE_ZONES.map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => {
                    setQuery(z);
                    setSelected(z);
                    setStatus("covered");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex items-center gap-1.5 truncate rounded px-1.5 py-1 text-left text-muted-foreground hover:bg-accent hover:text-foreground"
                  title={z}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  <span className="truncate">{z}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
