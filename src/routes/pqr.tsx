import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/pqr")({
  head: () => ({
    meta: [
      { title: "Radicar PQR — Tu Norte Portal" },
      { name: "description", content: "Radica peticiones, quejas, reclamos y recursos. Tu Norte TV atiende todas las solicitudes en los plazos legales." },
      { property: "og:title", content: "Radicar PQR — Tu Norte Portal" },
      { property: "og:description", content: "Formulario oficial de PQR de Tu Norte Portal." },
    ],
  }),
  component: PQRPage,
});

function PQRPage() {
  const [done, setDone] = useState(false);
  const [ticket, setTicket] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicket(`TN-${Date.now().toString().slice(-7)}`);
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center md:px-6 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-white/60 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur">
            <FileText className="h-3.5 w-3.5 text-brand" /> Atención al usuario
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold md:text-5xl">Radicar <span className="text-gradient-brand">PQR</span></h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Peticiones, quejas, reclamos y recursos. Te respondemos dentro de los términos establecidos por la CRC.</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 md:px-6">
        {done ? (
          <Card className="border-0 p-10 text-center shadow-card">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="mt-5 font-display text-3xl font-bold">PQR radicada con éxito</h2>
            <p className="mt-3 text-muted-foreground">Tu solicitud quedó registrada con el número:</p>
            <p className="mt-3 inline-block rounded-full bg-gradient-brand px-6 py-2 font-display text-xl font-bold text-primary-foreground tracking-wider">{ticket}</p>
            <p className="mt-6 text-sm text-muted-foreground">Te enviaremos una respuesta a tu correo dentro de los 15 días hábiles establecidos por la CRC.</p>
            <Button onClick={() => setDone(false)} variant="outline" className="mt-6 rounded-full">Radicar otra PQR</Button>
          </Card>
        ) : (
          <Card className="border-0 p-7 shadow-card md:p-10">
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-brand/10 p-4 text-sm">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-foreground/80">Recuerda que toda PQR es atendida por personal autorizado. Por favor incluye la mayor cantidad de detalles posible para resolver tu caso rápidamente.</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-2">
                <Label>Tipo de solicitud *</Label>
                <Select required>
                  <SelectTrigger><SelectValue placeholder="Selecciona el tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peticion">Petición</SelectItem>
                    <SelectItem value="queja">Queja</SelectItem>
                    <SelectItem value="reclamo">Reclamo</SelectItem>
                    <SelectItem value="recurso">Recurso de reposición</SelectItem>
                    <SelectItem value="solicitud">Solicitud de información</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2"><Label htmlFor="name">Nombre completo *</Label><Input id="name" required /></div>
                <div className="grid gap-2"><Label htmlFor="doc">Documento de identidad *</Label><Input id="doc" required /></div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2"><Label htmlFor="email">Correo electrónico *</Label><Input id="email" type="email" required /></div>
                <div className="grid gap-2"><Label htmlFor="phone">Teléfono *</Label><Input id="phone" type="tel" required /></div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contract">Número de contrato (opcional)</Label>
                <Input id="contract" placeholder="Si tienes servicio activo" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subject">Asunto *</Label>
                <Input id="subject" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="msg">Detalle de la solicitud *</Label>
                <Textarea id="msg" rows={6} required placeholder="Describe con el mayor detalle posible..." />
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <input type="checkbox" required className="mt-0.5" />
                <span>Acepto el tratamiento de mis datos personales según la política de privacidad de Tu Norte TV.</span>
              </div>

              <Button type="submit" size="lg" className="w-full bg-gradient-brand text-primary-foreground shadow-soft">Radicar PQR</Button>
            </form>
          </Card>
        )}
      </section>
    </>
  );
}
