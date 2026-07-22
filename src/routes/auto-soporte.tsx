import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Lock, LogOut, Plus, Share2, Trash2, Play, Video, Check, ShieldCheck, Upload, Link2, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { putVideo, getVideo, deleteVideo } from "@/lib/reels-db";

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
  source: "local" | "url";
  url?: string; // remote url (youtube / mp4)
  mime?: string; // for local
  size?: number; // bytes for local
  createdAt: number;
};

const STORAGE_KEY = "tunorte:autosoporte:reels:v2";
const ADMIN_KEY = "tunorte:autosoporte:admin";
const ADMIN_PASSWORD = "tunorte2026";
const MAX_UPLOAD_MB = 50;

const SEED_REELS: Reel[] = [
  {
    id: "seed-1",
    title: "Cómo reiniciar tu router en 30 segundos",
    description: "El truco #1 que resuelve el 80% de los problemas de internet.",
    source: "url",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: "seed-2",
    title: "Test de velocidad correcto",
    description: "Cómo medir tu velocidad real y qué esperar de tu plan.",
    source: "url",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    createdAt: Date.now() - 86400000 * 2,
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

function AutoSoportePage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [mode, setMode] = useState<"local" | "url">("local");
  const [form, setForm] = useState({ title: "", description: "", url: "" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [playing, setPlaying] = useState<Reel | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [localUrls, setLocalUrls] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // Load reels + resolve local blobs to object URLs
  useEffect(() => {
    let list: Reel[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      list = raw ? JSON.parse(raw) : SEED_REELS;
    } catch {
      list = SEED_REELS;
    }
    setReels(list);
    setIsAdmin(localStorage.getItem(ADMIN_KEY) === "1");

    const urls: Record<string, string> = {};
    (async () => {
      for (const r of list) {
        if (r.source === "local") {
          const blob = await getVideo(r.id);
          if (blob) urls[r.id] = URL.createObjectURL(blob);
        }
      }
      setLocalUrls(urls);
    })();

    const params = new URLSearchParams(window.location.search);
    const v = params.get("v");
    if (v) {
      setTimeout(() => {
        const found = list.find((r) => r.id === v);
        if (found) setPlaying(found);
      }, 400);
    }

    return () => {
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } else toast.error("Contraseña incorrecta");
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_KEY);
    setIsAdmin(false);
    toast.success("Sesión cerrada");
  };

  const resetForm = () => {
    setForm({ title: "", description: "", url: "" });
    setFile(null);
    setMode("local");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleAdd = async () => {
    if (!form.title.trim()) return toast.error("El título es requerido");
    const id = `r-${Date.now()}`;

    if (mode === "local") {
      if (!file) return toast.error("Selecciona un archivo de video");
      if (file.size > MAX_UPLOAD_MB * 1024 * 1024)
        return toast.error(`El archivo supera los ${MAX_UPLOAD_MB} MB`);
      setUploading(true);
      try {
        await putVideo(id, file);
        const objUrl = URL.createObjectURL(file);
        setLocalUrls((prev) => ({ ...prev, [id]: objUrl }));
        const reel: Reel = {
          id,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          source: "local",
          mime: file.type,
          size: file.size,
          createdAt: Date.now(),
        };
        persist([reel, ...reels]);
        toast.success("Video subido y guardado localmente");
        setAddOpen(false);
        resetForm();
      } catch (e) {
        console.error(e);
        toast.error("No se pudo guardar el video");
      } finally {
        setUploading(false);
      }
    } else {
      if (!form.url.trim()) return toast.error("La URL es requerida");
      const reel: Reel = {
        id,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        source: "url",
        url: form.url.trim(),
        createdAt: Date.now(),
      };
      persist([reel, ...reels]);
      toast.success("Video agregado");
      setAddOpen(false);
      resetForm();
    }
  };

  const handleDelete = async (r: Reel) => {
    if (r.source === "local") {
      await deleteVideo(r.id);
      const u = localUrls[r.id];
      if (u) URL.revokeObjectURL(u);
      setLocalUrls((prev) => {
        const n = { ...prev };
        delete n[r.id];
        return n;
      });
    }
    persist(reels.filter((x) => x.id !== r.id));
    toast.success("Video eliminado");
  };

  const handleShare = async (reel: Reel) => {
    const url = `${window.location.origin}/auto-soporte?v=${reel.id}`;
    try {
      if (navigator.share) await navigator.share({ title: reel.title, text: reel.description, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopiedId(reel.id);
        toast.success("Link copiado");
        setTimeout(() => setCopiedId(null), 1500);
      }
    } catch {
      /* cancelled */
    }
  };

  const cards = useMemo(
    () =>
      reels.map((r) => {
        if (r.source === "local") {
          const src = localUrls[r.id];
          return { reel: r, parsed: { kind: "mp4" as const, embed: src ?? "", thumb: undefined } };
        }
        return { reel: r, parsed: parseVideoUrl(r.url ?? "") };
      }),
    [reels, localUrls],
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
                  ) : parsed.kind === "mp4" && parsed.embed ? (
                    <video src={parsed.embed} muted playsInline preload="metadata" className="h-full w-full object-cover" />
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
                  {reel.source === "local" && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                      <HardDrive className="h-3 w-3" /> Local
                    </span>
                  )}
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
                  <Button variant="ghost" size="sm" onClick={() => handleShare(reel)} className="text-primary">
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
                      onClick={() => handleDelete(reel)}
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
            const parsed =
              playing.source === "local"
                ? { kind: "mp4" as const, embed: localUrls[playing.id] ?? "" }
                : parseVideoUrl(playing.url ?? "");
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
                  <Button onClick={() => handleShare(playing)} variant="outline" size="sm" className="mt-4 w-full">
                    <Share2 className="mr-2 h-4 w-4" /> Compartir este video
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Admin login */}
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

      {/* Add video */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar video de auto soporte</DialogTitle>
          </DialogHeader>

          <div className="mb-2 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("local")}
              className={`flex items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-semibold transition ${
                mode === "local" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Upload className="h-3.5 w-3.5" /> Subir archivo
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`flex items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-semibold transition ${
                mode === "url" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Link2 className="h-3.5 w-3.5" /> Desde URL
            </button>
          </div>

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

            {mode === "local" ? (
              <div>
                <label className="text-xs font-semibold">Archivo de video *</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground"
                />
                {file && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  MP4 / WebM / MOV — hasta {MAX_UPLOAD_MB} MB. Se guarda en este navegador (IndexedDB).
                </p>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold">URL del video *</label>
                <Input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="YouTube, Shorts o link .mp4"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => { setAddOpen(false); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={uploading}>
              <Plus className="mr-1 h-4 w-4" /> {uploading ? "Subiendo..." : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
