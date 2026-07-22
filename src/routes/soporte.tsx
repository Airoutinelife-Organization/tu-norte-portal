import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Mail, MapPin, MessageCircle, Clock, Headphones, Play, Share2, Check, Video, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

const nocSupportVideoUrl = "/videos/noc-support.mp4";

export const Route = createFileRoute("/soporte")({
  head: () => ({
    meta: [
      { title: "Soporte — Tu Norte Portal" },
      { name: "description", content: "Canales de atención, soporte técnico, videos de autogestión y preguntas frecuentes de Tu Norte TV." },
      { property: "og:title", content: "Soporte — Tu Norte Portal" },
      { property: "og:description", content: "Atención telefónica, WhatsApp, oficina, videos de autogestión y FAQ." },
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

type VideoItem = {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
};

const VIDEOS: VideoItem[] = [
  {
    id: "tv-soporte",
    title: "Soporte en TV",
    description: "Aprende a resolver los problemas más comunes con tu servicio de televisión.",
    url: "/videos/tv-soporte.mp4",
    category: "TV",
  },
  {
    id: "internet-soporte",
    title: "Soporte en Internet",
    description: "Guía rápida para optimizar tu conexión a internet de Tu Norte TV.",
    url: "/videos/mascota-soporte.mp4",
    category: "Internet",
  },
  {
    id: "facturacion-soporte",
    title: "Soporte en Facturación",
    description: "Conoce cómo consultar y pagar tu factura de forma fácil y segura.",
    url: "/videos/mascota-soporte.mp4",
    category: "Facturacion",
  },
  {
    id: "tips-soporte",
    title: "Tips de autogestión",
    description: "Consejos prácticos para sacar el máximo provecho a tu servicio.",
    url: "/videos/mascota-soporte.mp4",
    category: "tips",
  },
];

function parseVideoUrl(url: string): { kind: "youtube" | "mp4" | "iframe"; embed: string; thumb?: string } {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    const id = yt[1];
    return {
      kind: "youtube",
      embed: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
      thumb: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    };
  }
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return { kind: "mp4", embed: url };
  return { kind: "iframe", embed: url };
}

function SoportePage() {
  const [playing, setPlaying] = useState<VideoItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Todos");

  const categories = useMemo(() => ["Todos", ...Array.from(new Set(VIDEOS.map((v) => v.category)))], []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return VIDEOS.filter((v) => {
      const matchCat = cat === "Todos" || v.category === cat;
      const matchTerm = !term || v.title.toLowerCase().includes(term) || v.description.toLowerCase().includes(term);
      return matchCat && matchTerm;
    });
  }, [q, cat]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("v");
    if (v) {
      const found = VIDEOS.find((x) => x.id === v);
      if (found) setTimeout(() => setPlaying(found), 300);
    }
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch { /* fallback below */ }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch { return false; }
  };

  const handleShare = async (video: VideoItem) => {
    const url = `${window.location.origin}/soporte?v=${video.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: video.title, text: video.description, url });
        return;
      }
    } catch { /* user cancelled or blocked, fall through to copy */ }
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedId(video.id);
      toast.success("Link copiado", { description: url });
      setTimeout(() => setCopiedId(null), 1500);
    } else {
      window.prompt("Copia el link para compartir:", url);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden">
        <video
          src={nocSupportVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
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

      {/* Acceso rápido y fácil — Video autogestión */}
      <section id="videos" className="mx-auto max-w-7xl px-4 pb-6 md:px-6">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Video className="h-3.5 w-3.5" /> Acceso rápido y fácil
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Videos de autogestión</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Mira, aprende y resuelve por tu cuenta en minutos. Comparte el enlace con quien lo necesite.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar video..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  cat === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Video className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No hay videos que coincidan con tu búsqueda.</p>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((video) => {
              const parsed = parseVideoUrl(video.url);
              return (
                <Card
                  key={video.id}
                  className="group relative overflow-hidden border-border/60 bg-white p-0 shadow-soft transition hover:-translate-y-1 hover:shadow-card"
                >
                  <button
                    type="button"
                    onClick={() => setPlaying(video)}
                    className="relative block aspect-video w-full overflow-hidden bg-gradient-dark"
                  >
                    {parsed.thumb ? (
                      <img
                        src={parsed.thumb}
                        alt={video.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : parsed.kind === "mp4" ? (
                      <video src={parsed.embed} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/60">
                        <Video className="h-16 w-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="grid h-14 w-14 place-items-center rounded-full bg-white/90 shadow-glow transition group-hover:scale-110">
                        <Play className="h-6 w-6 fill-primary text-primary" />
                      </div>
                    </div>
                    <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                      {video.category}
                    </span>
                  </button>
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-display text-base font-bold text-foreground">{video.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{video.description}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(video)}
                      className="mt-3 h-8 w-full text-primary"
                    >
                      {copiedId === video.id ? (
                        <><Check className="mr-1 h-4 w-4" /> Link copiado</>
                      ) : (
                        <><Share2 className="mr-1 h-4 w-4" /> Compartir</>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 pt-12 md:px-6">
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

      <Dialog open={!!playing} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="max-w-2xl p-0">
          {playing && (() => {
            const parsed = parseVideoUrl(playing.url);
            return (
              <div>
                <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-black">
                  {parsed.kind === "mp4" ? (
                    <video src={parsed.embed} controls autoPlay className="h-full w-full object-contain" />
                  ) : (
                    <iframe
                      src={parsed.embed + (parsed.kind === "youtube" ? "&autoplay=1" : "")}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={playing.title}
                    />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold">{playing.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{playing.description}</p>
                  <Button onClick={() => handleShare(playing)} variant="outline" size="sm" className="mt-4 w-full">
                    <Share2 className="mr-2 h-4 w-4" /> Compartir este video
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
