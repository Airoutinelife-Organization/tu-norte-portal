import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar, Clock, MapPin, User, Phone, Check, ArrowRight, ArrowLeft, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/agendar")({
  head: () => ({
    meta: [
      { title: "Agendar instalación — Tu Norte Portal" },
      { name: "description", content: "Agenda la instalación de tu servicio en menos de 2 minutos. Elige día y franja horaria." },
    ],
  }),
  component: AgendarPage,
});

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[0-9 +()-]{7,15}$/, "Teléfono inválido"),
  address: z.string().trim().min(5).max(150),
});

function getDays() {
  const days: { date: Date; label: string; short: string }[] = [];
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const today = new Date();
  for (let i = 1; i <= 10; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      date: d,
      label: `${d.getDate()} ${months[d.getMonth()]}`,
      short: weekdays[d.getDay()],
    });
  }
  return days;
}

const slots = ["8:00 – 10:00 AM", "10:00 – 12:00 M", "2:00 – 4:00 PM", "4:00 – 6:00 PM"];

function AgendarPage() {
  const [step, setStep] = useState(1);
  const [day, setDay] = useState<number | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);

  const days = getDays();

  const submit = () => {
    const r = schema.safeParse(form);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 md:px-6">
        <Card className="overflow-hidden border-0 shadow-glow">
          <div className="bg-gradient-brand p-10 text-center text-primary-foreground">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/20 backdrop-blur">
              <Check className="h-10 w-10" />
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold">¡Cita agendada!</h1>
            <p className="mt-2 text-white/80">Te confirmamos por WhatsApp y correo.</p>
          </div>
          <div className="space-y-4 p-8">
            <div className="rounded-xl bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Confirmación</p>
              <p className="mt-1 font-mono text-lg font-bold text-primary">TN-INST-{Math.floor(Math.random() * 900000) + 100000}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                <Calendar className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="text-sm font-semibold">{day !== null ? days[day].label : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                <Clock className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-xs text-muted-foreground">Franja</p>
                  <p className="text-sm font-semibold">{slot}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border p-3 sm:col-span-2">
                <MapPin className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-xs text-muted-foreground">Dirección</p>
                  <p className="text-sm font-semibold">{form.address}</p>
                </div>
              </div>
            </div>
            <Button asChild size="lg" className="w-full bg-gradient-brand text-primary-foreground">
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8">
        <Link to="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-brand hover:underline">← Inicio</Link>
        <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">Agenda tu instalación</h1>
        <p className="mt-2 text-muted-foreground">3 pasos rápidos. Confirmación inmediata.</p>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex flex-1 items-center gap-2">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
              step >= n ? "bg-gradient-brand text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {step > n ? <Check className="h-4 w-4" /> : n}
            </span>
            <div className={`h-1 flex-1 rounded-full ${step > n ? "bg-gradient-brand" : "bg-muted"}`} />
          </div>
        ))}
      </div>

      <Card className="border-border/60 bg-white p-6 shadow-card md:p-8">
        {step === 1 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">Paso 1</p>
            <h2 className="mt-1 font-display text-xl font-bold">Elige un día</h2>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {days.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setDay(i)}
                  className={`rounded-xl border-2 p-3 text-center transition ${
                    day === i ? "border-brand bg-brand/10 text-primary" : "border-border bg-muted/20 hover:border-brand/40"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{d.short}</p>
                  <p className="font-display text-base font-bold">{d.label}</p>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button disabled={day === null} onClick={() => setStep(2)} className="bg-gradient-brand text-primary-foreground">
                Continuar <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">Paso 2</p>
            <h2 className="mt-1 font-display text-xl font-bold">Elige una franja horaria</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {slots.map((s) => (
                <button
                  key={s}
                  onClick={() => setSlot(s)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                    slot === s ? "border-brand bg-brand/10 text-primary" : "border-border bg-muted/20 hover:border-brand/40"
                  }`}
                >
                  <Clock className="h-5 w-5 text-brand" />
                  <span className="font-semibold">{s}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="border-2">
                <ArrowLeft className="mr-1 h-4 w-4" /> Atrás
              </Button>
              <Button disabled={!slot} onClick={() => setStep(3)} className="bg-gradient-brand text-primary-foreground">
                Continuar <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">Paso 3</p>
            <h2 className="mt-1 font-display text-xl font-bold">Tus datos de contacto</h2>
            <div className="mt-5 space-y-4">
              <div>
                <Label className="mb-1.5 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Nombre completo</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Juan Pérez" maxLength={80} />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>
              <div>
                <Label className="mb-1.5 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Teléfono</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Ej: 320 123 4567" maxLength={15} />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div>
                <Label className="mb-1.5 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Dirección de instalación</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Ej: Av. 5 # 12-34, Barrio La Libertad" maxLength={150} />
                {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-brand/30 bg-brand/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary"><Sparkles className="h-4 w-4 text-brand" /> Resumen</p>
              <p className="mt-1 text-sm">
                {day !== null && days[day].label} · {slot}
              </p>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="border-2">
                <ArrowLeft className="mr-1 h-4 w-4" /> Atrás
              </Button>
              <Button onClick={submit} className="bg-gradient-brand text-primary-foreground shadow-glow">
                Confirmar cita <Check className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </section>
  );
}
