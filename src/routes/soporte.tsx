import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Mail, MapPin, MessageCircle, Clock, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import nocSupportVideo from "@/assets/noc-support.mp4.asset.json";

export const Route = createFileRoute("/soporte")({
  head: () => ({
    meta: [
      { title: "Soporte y Atención al Cliente — Tu Norte TV" },
      { name: "description", content: "Canales de atención, soporte técnico y preguntas frecuentes de Tu Norte TV." },
      { property: "og:title", content: "Soporte y Atención al Cliente — Tu Norte TV" },
      { property: "og:description", content: "Atención telefónica, WhatsApp, oficina y FAQ." },
    ],
  }),
  component: SoportePage,
});

const channels = [
  { icon: Phone, title: "Línea de atención", value: "(+57) 321 756 0178", action: "tel:+573217560178", cta: "Llamar" },
  { icon: MessageCircle, title: "WhatsApp", value: "Chat 24/7", action: "https://wa.me/573217560178", cta: "Escribir" },
  { icon: Mail, title: "Correo electrónico", value: "contacto@tunorte.co", action: "mailto:contacto@tunorte.co", cta: "Enviar" },
  { icon: MapPin, title: "Oficina principal", value: "Av 1 # 4-50, Cúcuta", action: "https://maps.google.com/?q=Cúcuta+Motilones", cta: "Ver mapa" },
];

const faqs = [
  { q: "¿Cómo consulto el saldo de mi factura?", a: "Ingresa al portal Clientes (oficina virtual) con tu cédula y contraseña, o escríbenos por WhatsApp e ingresa los datos de autenticación requeridos." },
  { q: "¿Cuál es el tiempo de respuesta de una PQR?", a: "De acuerdo con la CRC, respondemos toda PQR en máximo 15 días hábiles. La radicación es inmediata por nuestro formulario en línea." },
  { q: "¿Cuánto tarda la instalación de un nuevo servicio?", a: "Una vez confirmada la cobertura y firmado el contrato, programamos instalación en 24 a 72 horas hábiles." },
  { q: "¿Qué hago si mi internet está lento?", a: "Primero realiza el test de velocidad conectado por cable. Si la velocidad es menor al 80% del plan contratado, contáctanos por WhatsApp para diagnóstico remoto gratuito." },
  { q: "¿Hay permanencia en los contratos?", a: "Nuestros planes residenciales no tienen cláusulas de permanencia forzada. Solo aplica si recibiste promociones específicas con descuento." },
  { q: "¿Puedo pagar en línea?", a: "Sí. Desde el portal Clientes puedes pagar con PSE, tarjeta débito o crédito sin recargos adicionales." },
];

function SoportePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        {/* Live NOC support team background video */}
        <video
          src={nocSupportVideo.url}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/55 to-background/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-brand/20 mix-blend-overlay" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center md:px-6 md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-semibold text-white shadow-soft backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <Headphones className="h-3.5 w-3.5" /> NOC en vivo · Soporte 24/7
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] md:text-6xl">
            Estamos aquí para <span className="text-gradient-brand">ayudarte</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/90 drop-shadow-md md:text-lg">
            Nuestro equipo en el Centro de Operaciones de Red está conectado las 24 horas. Elige el canal que prefieras.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {channels.map((c) => (
            <Card key={c.title} className="group border-border/60 bg-white p-6 text-center shadow-soft transition hover:-translate-y-1 hover:shadow-card">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground"><c.icon className="h-7 w-7" /></div>
              <h3 className="mt-4 font-display text-lg font-bold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.value}</p>
              <Button asChild variant="ghost" size="sm" className="mt-3 text-primary"><a href={c.action} target="_blank" rel="noreferrer">{c.cta}</a></Button>
            </Card>
          ))}
        </div>

        <Card className="mt-8 flex flex-col items-center gap-3 border-0 bg-gradient-dark p-8 text-center text-primary-foreground shadow-glow md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-brand" />
            <div>
              <p className="font-display text-lg font-bold">Horario de atención</p>
              <p className="text-sm text-white/75">Lunes a Viernes: 7:00 a.m. – 7:00 p.m. · Sábados: 8:00 a.m. – 1:00 p.m. · Soporte técnico WhatsApp 24/7</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 md:px-6">
        <div className="mb-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">FAQ</span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Preguntas frecuentes</h2>
        </div>
        <Accordion type="single" collapsible className="rounded-2xl bg-white p-2 shadow-soft">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`i${i}`} className="border-border/60 px-4">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
