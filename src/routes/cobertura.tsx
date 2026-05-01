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
      { title: "Verificar cobertura — Tu Norte TV" },
      { name: "description", content: "Verifica si tenemos cobertura de internet de fibra óptica en tu zona de Norte de Santander." },
      { property: "og:title", content: "Verificar cobertura — Tu Norte TV" },
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
        {/* Live fiber map background */}
        <div className="absolute inset-0 -top-10 overflow-hidden">
          <CucutaFiberMap className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>

        {/* Legend */}
        <div className="relative mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-center gap-3 px-4 pt-4 md:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-soft backdrop-blur ring-1 ring-border">
            <span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" /> Fibra activa
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-soft backdrop-blur ring-1 ring-border">
            <span className="h-2.5 w-2.5 rounded-full bg-warning animate-pulse" /> En construcción
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-soft backdrop-blur ring-1 ring-border">
            <MapPin className="h-3.5 w-3.5 text-brand" /> Cúcuta · Norte de Santander
          </span>
        </div>

        <div className="relative mx-auto max-w-3xl px-4 md:px-6">
        <Card className="border-0 bg-card/95 p-7 shadow-card backdrop-blur md:p-10">
          {status === "idle" || status === "checking" ? (
            <form onSubmit={onCheck} className="space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="city">Municipio</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger id="city"><SelectValue placeholder="Selecciona tu municipio" /></SelectTrigger>
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
                <Input id="addr" placeholder="Ej. Calle 10 # 5-23, Barrio Centro" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <Button type="submit" size="lg" disabled={status === "checking"} className="w-full bg-gradient-brand text-primary-foreground shadow-soft">
                {status === "checking" ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</>) : "Verificar cobertura"}
              </Button>
            </form>
          ) : status === "covered" ? (
            <div className="text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold">¡Tenemos cobertura!</h2>
              <p className="mt-2 text-muted-foreground">Excelente noticia. Llena tus datos y un asesor te contactará para programar la instalación.</p>
              <form onSubmit={onSubmitLead} className="mt-8 space-y-4 text-left">
                <div className="grid gap-2"><Label htmlFor="n">Nombre completo</Label><Input id="n" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div className="grid gap-2"><Label htmlFor="p">Teléfono</Label><Input id="p" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
                <Button type="submit" size="lg" className="w-full bg-gradient-brand text-primary-foreground">Solicitar instalación</Button>
              </form>
            </div>
          ) : status === "submitted" ? (
            <div className="text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold">¡Solicitud recibida!</h2>
              <p className="mt-2 text-muted-foreground">Un asesor de Tu Norte TV te contactará en las próximas horas hábiles al número {phone}.</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-warning/15 text-warning">
                <XCircle className="h-10 w-10" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold">Aún no llegamos a tu zona</h2>
              <p className="mt-2 text-muted-foreground">Estamos expandiendo nuestra red. Déjanos tus datos y te avisaremos apenas estemos disponibles.</p>
              <Button onClick={() => setStatus("idle")} variant="outline" className="mt-6">Probar otra dirección</Button>
              <a href="tel:+573217560178" className="ml-3 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2 text-sm font-semibold text-primary-foreground">
                <Phone className="h-4 w-4" /> Llamar a un asesor
              </a>
            </div>
          )}
        </Card>
        </div>
      </section>
    </>
  );
}
