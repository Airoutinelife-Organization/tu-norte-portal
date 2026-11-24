import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BellRing, ImagePlus, Loader2, LogOut, Plus, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// /admin/aviso-corte — TuNorte configura a qué franquicias CORTADAS se envía la imagen del aviso
export const Route = createFileRoute("/admin_/aviso-corte")({
  component: AvisoCortePage,
  head: () => ({
    meta: [
      { title: "Aviso de corte · Tu Norte Portal" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type Cfg = {
  enabled: boolean;
  franquicias: string[];
  catalogo: string[];
  image_url: string | null;
  desde: string | null;
  hasta: string | null;
  updated_at: string | null;
  updated_by: string | null;
};

const API = "/api/admin/aviso-corte-config";
const API_IMG = "/api/admin/aviso-corte-imagen";
const SS_KEY = "tunorte_aviso_auth";
const BOG_MS = 5 * 3600 * 1000; // Colombia: UTC-5 fijo
const MAX_IMG = 5 * 1024 * 1024;

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/\s+/g, " ").trim();
const toLocal = (iso: string | null) => (iso ? new Date(Date.parse(iso) - BOG_MS).toISOString().slice(0, 16) : "");
const fromLocal = (v: string) => (v ? `${v}:00-05:00` : null);
const b64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));

function AvisoCortePage() {
  const [auth, setAuth] = useState<string | null>(null);
  const [open, setOpen] = useState(false); // true si el servidor tiene AVISO_AUTH = "off"
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(SS_KEY);
    fetch(API)
      .then((r) => setOpen(r.ok))
      .catch(() => setOpen(false))
      .finally(() => {
        setAuth(saved);
        setReady(true);
      });
  }, []);

  const logout = () => {
    sessionStorage.removeItem(SS_KEY);
    setAuth(null);
  };

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (open) return <Editor auth={null} onUnauthorized={() => setOpen(false)} />;
  if (!auth)
    return (
      <Login
        onLogin={(a) => {
          sessionStorage.setItem(SS_KEY, a);
          setAuth(a);
        }}
      />
    );
  return <Editor auth={auth} onUnauthorized={logout} onLogout={logout} />;
}

function Login({ onLogin }: { onLogin: (auth: string) => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted px-4 py-12">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const a = b64(`${user.trim()}:${pass}`);
          try {
            const r = await fetch(API, { headers: { Authorization: `Basic ${a}` } });
            if (r.ok) onLogin(a);
            else setError(r.status === 401 ? "Usuario o contraseña incorrectos." : "No se pudo conectar. Intenta de nuevo.");
          } catch {
            setError("No se pudo conectar. Intenta de nuevo.");
          } finally {
            setBusy(false);
          }
        }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <BellRing className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Aviso de corte</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configuración del aviso por WhatsApp</p>
        </div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Usuario</label>
        <Input value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" className="mb-4" />
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Contraseña</label>
        <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" />
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" className="mt-6 w-full" disabled={busy || !user || !pass}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Ingresar
        </Button>
      </form>
    </main>
  );
}

function Editor({ auth, onUnauthorized, onLogout }: { auth: string | null; onUnauthorized: () => void; onLogout?: () => void }) {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [nueva, setNueva] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [over, setOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const headers: Record<string, string> = auth ? { Authorization: `Basic ${auth}` } : {};

  const load = useCallback(async () => {
    const r = await fetch(API, { headers: auth ? { Authorization: `Basic ${auth}` } : {} });
    if (r.status === 401) return onUnauthorized();
    const j = await r.json();
    if (!r.ok) return toast.error(j.error || "No se pudo cargar la configuración");
    setCfg(j);
    setPreview(j.image_url);
    setDirty(false);
  }, [auth, onUnauthorized]);

  useEffect(() => {
    load().catch(() => toast.error("No se pudo cargar la configuración"));
  }, [load]);

  if (!cfg)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  const update = (patch: Partial<Cfg>) => {
    setCfg({ ...cfg, ...patch });
    setDirty(true);
  };

  const toggleFranq = (f: string) =>
    update({ franquicias: cfg.franquicias.includes(f) ? cfg.franquicias.filter((x) => x !== f) : [...cfg.franquicias, f] });

  const addFranq = () => {
    const v = norm(nueva);
    if (!v) return;
    update({
      catalogo: cfg.catalogo.includes(v) ? cfg.catalogo : [...cfg.catalogo, v],
      franquicias: cfg.franquicias.includes(v) ? cfg.franquicias : [...cfg.franquicias, v],
    });
    setNueva("");
  };

  const pick = (f?: File | null) => {
    if (!f) return;
    if (!["image/png", "image/jpeg"].includes(f.type)) return toast.error("Solo PNG o JPG");
    if (f.size > MAX_IMG) return toast.error("La imagen pesa más de 5 MB");
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      let image_url = cfg.image_url;
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch(API_IMG, { method: "POST", headers, body: fd });
        if (up.status === 401) return onUnauthorized();
        const uj = await up.json();
        if (!up.ok) throw new Error(uj.error || "Error subiendo la imagen");
        image_url = uj.image_url;
      }
      const r = await fetch(API, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ ...cfg, image_url }),
      });
      if (r.status === 401) return onUnauthorized();
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error guardando");
      setCfg(j);
      setFile(null);
      setPreview(j.image_url);
      setDirty(false);
      toast.success("Cambios guardados");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted px-4 pb-32 pt-10">
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <BellRing className="h-6 w-6 text-primary" /> Aviso de corte
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Imagen que Lina envía por WhatsApp a los clientes con servicio CORTADO de las franquicias que elijas.
            </p>
          </div>
          {onLogout && (
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Salir
            </Button>
          )}
        </header>

        <Card>
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <div>
              <p className="font-semibold text-foreground">Estado del aviso</p>
              <p className="text-sm text-muted-foreground">Si está apagado, no se envía a nadie.</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={cfg.enabled ? "default" : "secondary"}>{cfg.enabled ? "Activo" : "Inactivo"}</Badge>
              <Switch checked={cfg.enabled} onCheckedChange={(v) => update({ enabled: v })} aria-label="Activar aviso" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              Franquicias
              <span className="text-sm font-normal text-muted-foreground">{cfg.franquicias.length} seleccionada(s)</span>
            </CardTitle>
            <CardDescription>Toca para incluir o quitar. El nombre debe coincidir con el de SAE.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {cfg.catalogo.map((f) => {
                const sel = cfg.franquicias.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFranq(f)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition ${
                      sel
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                value={nueva}
                onChange={(e) => setNueva(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFranq();
                  }
                }}
                placeholder="Agregar franquicia (tal como aparece en SAE)"
              />
              <Button type="button" variant="outline" onClick={addFranq}>
                <Plus className="mr-1 h-4 w-4" /> Agregar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Imagen del aviso</CardTitle>
            <CardDescription>PNG o JPG, máximo 5 MB.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(true);
              }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setOver(false);
                pick(e.dataTransfer.files[0]);
              }}
              className={`flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center text-sm text-muted-foreground transition ${
                over ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              {preview ? (
                <img src={preview} alt="Vista previa del aviso" className="max-h-80 rounded-lg shadow" />
              ) : (
                <ImagePlus className="h-10 w-10" />
              )}
              <span>{preview ? "Haz clic o arrastra otra imagen para cambiarla" : "Arrastra la imagen o haz clic para elegirla"}</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg"
                hidden
                onChange={(e) => pick(e.target.files?.[0])}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vigencia</CardTitle>
            <CardDescription>Opcional. Hora de Colombia. Vacío = sin límite.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-muted-foreground">
              Desde
              <Input type="datetime-local" value={toLocal(cfg.desde)} onChange={(e) => update({ desde: fromLocal(e.target.value) })} />
            </label>
            <label className="space-y-1 text-sm text-muted-foreground">
              Hasta
              <Input type="datetime-local" value={toLocal(cfg.hasta)} onChange={(e) => update({ hasta: fromLocal(e.target.value) })} />
            </label>
          </CardContent>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {dirty
              ? "Tienes cambios sin guardar"
              : cfg.updated_at
                ? `Última actualización: ${new Date(cfg.updated_at).toLocaleString("es-CO", { timeZone: "America/Bogota" })}${cfg.updated_by ? ` · ${cfg.updated_by}` : ""}`
                : "Sin cambios guardados"}
          </span>
          <Button onClick={save} disabled={saving || !dirty}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar cambios
          </Button>
        </div>
      </div>
    </main>
  );
}
