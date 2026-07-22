import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Lock, LogOut, Plus, Share2, Trash2, Play, Video, Copy, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auto-soporte")({
  head: () => ({
    meta: [
      { title: "Videos de Auto Soporte — Tu Norte TV" },
      { name: "description", content: "Aprende a resolver los problemas más comunes con nuestros videos cortos de auto soporte." },
      { property: "og:title", content: "Videos de Auto Soporte — Tu Norte TV" },
      { property: "og:description", content: "Reels cortos para resolver tú mismo los problemas más frecuentes." },
    ],
  }),
  component: AutoSoportePage,
});

type Reel = {
  id: string;
  title: string;
  description?: string;
  url: string; // youtube, direct mp4, vimeo, etc.
  createdAt: number;
};

const STORAGE_KEY = "tunorte:autosoporte:reels";
const ADMIN_KEY = "tunorte:autosoporte:admin";
const ADMIN_PASSWORD = "tunorte2026"; // Simple client-side gate (not real security)

const SEED_REELS: Reel[] = [
  {
    id: "seed-1",
    title: "Cómo reiniciar tu router en 30 segundos",
    description: "El truco #1 que resuelve el 80% de los problemas de internet.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: "seed-2",
    title: "Test de velocidad correcto",
    description: "Cómo medir tu velocidad real y qué esperar de tu plan.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "seed-3",
    title: "Configurar tu Smart TV con TVN Norte",
    description: "Paso a paso para ver todos tus canales en HD.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    createdAt: Date.now() - 86400000,
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
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) {
    return { kind: "mp4", embed: url };
  }
  return { kind: "iframe", embed: url };
}

function AutoSoportePage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", url: "" });
  const [playing, setPlaying] = useState<Reel | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setReels(raw ? JSON.parse(raw) : SEED_REELS);
    } catch {
      setReels(SEED_REELS);
    }
    setIsAdmin(localStorage.getItem(ADMIN_KEY) === "1");

    // Auto-open reel if ?v= in URL
    const params = new URLSearchParams(window.location.search);
    const v = params.get("v");
    if (v) {
      setTimeout(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        const list: Reel[] = raw ? JSON.parse(raw) : SEED_REELS;
        const found = list.find((r) => r.id === v);
        if (found) setPlaying(found);
      }, 200);
    }
  }, []);

  const persist = (next: Reel[]) => {
    setReels(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_KEY, "1");
      setIsAdmin(true);
      setLoginOpen(false);
      setPassword("");
      toast.success("Modo administrador activado");
    } else {
      toast.error("Contraseña incorrecta");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_KEY);
    setIsAdmin(false);
    toast.success("Sesión cerrada");
  };

  const handleAdd = () => {
    if (!form.title.trim() || !form.url.trim()) {
      toast.error("Título y URL son requeridos");
      return;
    }
    const reel: Reel = {
      id: `r-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      url: form.url.trim(),
      createdAt: Date.now(),
    };
    persist([reel, ...reels]);
    setForm({ title: "", description: "", url: "" });
    setAddOpen(false);
    toast.success("Video agregado");
  };

  const handleDelete = (id: string) => {
    persist(reels.filter((r) => r.id !== id));
    toast.success("Video eliminado");
  };

  const handleShare = async (reel: Reel) => {
    const url = `${window.location.origin}/auto-soporte?v=${reel.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: reel.title, text: reel.description, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopiedId(reel.id);
        toast.success("Link copiado");
        setTimeout(() => setCopiedId(null), 1500);
      }
    } catch {
      /* user cancelled */
    }
  };

  const cards = useMemo(
    () =>
      reels.map((r) => {
        const parsed = parseVideoUrl(r.url);
        return { reel: r, parsed };
      }),
    [reels],
  );

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-dark py-16 text-primary-foreground md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-brand/20" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Video className="h-3.5 w-3.5" /> Reels de auto soporte
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">
                Videos de <span className="text-gradient-brand">Auto Soporte</span>
              </h1>
              <p className="mt-3 max-w-xl text-white/80">
                Resuelve tú mismo los problemas más comunes con videos cortos, directo al grano.
              </p>
            </div>
            <div className="flex gap-2">
              {isAdmin ? (
                <>
                  <Button onClick={() => setAddOpen(true)} className="bg-white text-primary hover:bg-white/90">
                    <Plus className="mr-1 h-4 w-4" /> Agregar video
                  </Button>
                  <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/10">
                    <LogOut className="mr-1 h-4 w-4" /> Salir
                  </Button>
                </>
              ) : (
                <Button variant="ghost" onClick={() => setLoginOpen(true)} className="text-white hover:bg-white/10">
                  <Lock className="mr-1 h-4 w-4" /> Admin
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        {cards.length === 0 ? (
          <Card className="p-12 text-center">
            <Video className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Aún no hay videos disponibles.</p>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map(({ reel, parsed }) => (
              <Card
                key={reel.id}
                className="group relative overflow-hidden border-border/60 bg-white p-0 shadow-soft transition hover:-translate-y-1 hover:shadow-card"
              >
                <button
                  type="button"
                  onClick={() => setPlaying(reel)}
                  className="relative block aspect-[9/16] w-full overflow-hidden bg-gradient-dark"
                >
                  {parsed.thumb ? (
                    <img
                      src={parsed.thumb}
                      alt={reel.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : parsed.kind === "mp4" ? (
                    <video src={parsed.embed} muted playsInline className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/60">
                      <Video className="h-16 w-16" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-white/90 shadow-glow transition group-hover:scale-110">
                      <Play className="h-7 w-7 fill-primary text-primary" />
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                    <h3 className="line-clamp-2 font-display text-base font-bold text-white drop-shadow">
                      {reel.title}
                    </h3>
                    {reel.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-white/80">{reel.description}</p>
                    )}
                  </div>
                </button>
                <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-white p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(reel)}
                    className="text-primary"
                  >
                    {copiedId === reel.id ? (
                      <>
                        <Check className="mr-1 h-4 w-4" /> Copiado
                      </>
                    ) : (
                      <>
                        <Share2 className="mr-1 h-4 w-4" /> Compartir
                      </>
                    )}
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(reel.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Player dialog */}
      <Dialog open={!!playing} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="max-w-md p-0 sm:max-w-lg">
          {playing && (() => {
            const parsed = parseVideoUrl(playing.url);
            return (
              <div>
                <div className="relative aspect-[9/16] w-full overflow-hidden rounded-t-lg bg-black">
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
                  {playing.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{playing.description}</p>
                  )}
                  <Button
                    onClick={() => handleShare(playing)}
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                  >
                    <Share2 className="mr-2 h-4 w-4" /> Compartir este video
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Admin login dialog */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Acceso administrador
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ingresa la contraseña para gestionar los videos de auto soporte.
            </p>
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLoginOpen(false)}>Cancelar</Button>
            <Button onClick={handleLogin}>Ingresar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add video dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar video de auto soporte</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold">Título *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Cómo reiniciar tu router"
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Descripción</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Breve descripción del video"
                rows={2}
              />
            </div>
            <div>
              <label className="text-xs font-semibold">URL del video *</label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="YouTube, Shorts o link .mp4"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Soportamos YouTube, YouTube Shorts, y archivos .mp4/.webm directos.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdd}>
              <Plus className="mr-1 h-4 w-4" /> Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
