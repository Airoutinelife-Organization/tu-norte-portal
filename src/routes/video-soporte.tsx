import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play, Share2, Check, Video, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/video-soporte")({
  head: () => ({
    meta: [
      { title: "Video Soporte — Tu Norte TV" },
      { name: "description", content: "Galería de videos de soporte para resolver los problemas más comunes de tu servicio." },
      { property: "og:title", content: "Video Soporte — Tu Norte TV" },
      { property: "og:description", content: "Mira, aprende y resuelve. Videos cortos de auto ayuda." },
    ],
  }),
  component: VideoSoportePage,
});

type Video = {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
};

// Add your videos here. `url` can be a YouTube link, Shorts link, or direct .mp4/.webm URL.
const VIDEOS: Video[] = [
  {
    id: "mascota-soporte",
    title: "Nuestra mascota de soporte",
    description: "Conoce al amigo de Tu Norte TV que te acompaña en tu experiencia de servicio.",
    url: "/videos/mascota-soporte.mp4",
    category: "Soporte",
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

function VideoSoportePage() {
  const [playing, setPlaying] = useState<Video | null>(null);
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

  const handleShare = async (video: Video) => {
    const url = `${window.location.origin}/video-soporte?v=${video.id}`;
    try {
      if (navigator.share) await navigator.share({ title: video.title, text: video.description, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopiedId(video.id);
        toast.success("Link copiado al portapapeles");
        setTimeout(() => setCopiedId(null), 1500);
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-dark py-16 text-primary-foreground md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-brand/20" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Video className="h-3.5 w-3.5" /> Galería de videos
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">
            Video <span className="text-gradient-brand">Soporte</span>
          </h1>
          <p className="mt-3 max-w-xl text-white/80">
            Aprende a resolver los problemas más comunes con videos cortos. Comparte el enlace con quien lo necesite.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
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
