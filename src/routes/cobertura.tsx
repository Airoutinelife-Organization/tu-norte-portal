import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, CheckCircle2, XCircle, Loader2, Phone } from "lucide-react";
import { CucutaFiberMap } from "@/components/CucutaFiberMap";

export const Route = createFileRoute("/cobertura")({
  head: () => ({
    meta: [
      { title: "Verificar cobertura — Tu Norte Portal" },
      { name: "description", content: "Verifica si tenemos cobertura de internet de fibra óptica en tu zona de Norte de Santander." },
      { property: "og:title", content: "Verificar cobertura — Tu Norte Portal" },
      { property: "og:description", content: "Consulta cobertura de fibra óptica en tu dirección en segundos." },
    ],
  }),
  component: CoberturaPage,
});

const COVERED = ["cucuta", "los patios", "villa del rosario", "el zulia", "san cayetano", "puerto santander", "tibu"];

function CoberturaPage() {
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "covered" | "not-covered" | "submitted">("idle");

  const onCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !address) return;
    setStatus("checking");
    setTimeout(() => {
      setStatus(COVERED.includes(city.toLowerCase()) ? "covered" : "not-covered");
    }, 1200);
  };

  const onSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitted");
  };

  return (
    <>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-white/60 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur">
              <MapPin className="h-3.5 w-3.5 text-brand" /> Cobertura en Norte de Santander
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold md:text-5xl">¿Llegamos a <span className="text-gradient-brand">tu zona</span>?</h1>
            <p className="mt-4 text-muted-foreground">Ingresa tu dirección y te confirmamos disponibilidad de fibra óptica en segundos.</p>
          </div>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-stretch">
            {/* LIVE MAP PANEL */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[oklch(0.18_0.06_250)] shadow-card ring-1 ring-black/10">
              <CucutaFiberMap className="h-[420px] w-full md:h-[560px] lg:h-full" />

              {/* Top status bar */}
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

              {/* Radar pulse pin (centered over Centro node) */}
              <div className="pointer-events-none absolute left-[54%] top-[27%] -translate-x-1/2 -translate-y-1/2">
                <span className="absolute inset-0 -m-8 animate-ping rounded-full bg-brand/40" />
                <span className="absolute inset-0 -m-4 animate-ping rounded-full bg-brand/60 [animation-delay:200ms]" />
                <span className="relative grid h-6 w-6 place-items-center rounded-full bg-gradient-brand shadow-glow ring-4 ring-white/30">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                </span>
              </div>

              {/* Bottom legend + stats */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
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
                    <div className="font-display text-lg font-bold leading-none">98%</div>
                    <div className="text-[10px] uppercase tracking-wider opacity-70">Uptime</div>
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

            {/* EMBEDDED FORM PANEL */}
            <div className="relative">
              <div className="sticky top-24 overflow-hidden rounded-3xl border border-white/15 bg-card/80 p-6 shadow-card ring-1 ring-black/5 backdrop-blur-xl md:p-8">
                {/* Decorative glow */}
                <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/20 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />

                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-soft">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Verificación en vivo
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-bold leading-tight md:text-3xl">
                    Ubica tu dirección en el mapa
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Cruzaremos tus datos con nuestra red de fibra activa.
                  </p>

                  <div className="relative mt-6">
                    {status === "idle" || status === "checking" ? (
                      <form onSubmit={onCheck} className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="city">Municipio</Label>
                          <Select value={city} onValueChange={setCity}>
                            <SelectTrigger id="city" className="bg-background/80"><SelectValue placeholder="Selecciona tu municipio" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cucuta">Cúcuta</SelectItem>
                              <SelectItem value="los patios">Los Patios</SelectItem>
                              <SelectItem value="villa del rosario">Villa del Rosario</SelectItem>
                              <SelectItem value="el zulia">El Zulia</SelectItem>
                              <SelectItem value="san cayetano">San Cayetano</SelectItem>
                              <SelectItem value="puerto santander">Puerto Santander</SelectItem>
                              <SelectItem value="tibu">Tibú</SelectItem>
                              <SelectItem value="ocana">Ocaña</SelectItem>
                              <SelectItem value="pamplona">Pamplona</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="addr">Dirección</Label>
                          <Input id="addr" className="bg-background/80" placeholder="Ej. Calle 10 # 5-23, Barrio Centro" value={address} onChange={(e) => setAddress(e.target.value)} required />
                        </div>
                        <Button type="submit" size="lg" disabled={status === "checking"} className="w-full bg-gradient-brand text-primary-foreground shadow-soft">
                          {status === "checking" ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</>) : "Verificar cobertura"}
                        </Button>
                      </form>
                    ) : status === "covered" ? (
                      <div className="text-center">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
                          <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h3 className="mt-4 font-display text-xl font-bold">¡Tenemos cobertura!</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Llena tus datos y un asesor te contactará.</p>
                        <form onSubmit={onSubmitLead} className="mt-6 space-y-4 text-left">
                          <div className="grid gap-2"><Label htmlFor="n">Nombre completo</Label><Input id="n" className="bg-background/80" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                          <div className="grid gap-2"><Label htmlFor="p">Teléfono</Label><Input id="p" className="bg-background/80" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
                          <Button type="submit" size="lg" className="w-full bg-gradient-brand text-primary-foreground">Solicitar instalación</Button>
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
                        <p className="mt-1 text-sm text-muted-foreground">Estamos expandiendo nuestra red.</p>
                        <div className="mt-5 flex flex-col gap-2">
                          <Button onClick={() => setStatus("idle")} variant="outline">Probar otra dirección</Button>
                          <a href="tel:+573217560178" className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-brand px-5 py-2 text-sm font-semibold text-primary-foreground">
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
        </div>
      </section>
    </>
  );
}
