// Lógica del "Aviso de corte" (solo servidor). Config + imagen en Workers KV (binding AVISO_KV).
// Secrets (wrangler secret put): AVISO_ADMIN_USER, AVISO_ADMIN_PASS, AVISO_N8N_TOKEN.
import { env } from "cloudflare:workers";

export type AvisoConfig = {
  enabled: boolean;
  franquicias: string[];
  catalogo: string[];
  image_url: string | null;
  desde: string | null; // ISO UTC
  hasta: string | null; // ISO UTC
  updated_at: string | null;
  updated_by: string | null;
};

const CFG_KEY = "aviso:config";
const IMG_PREFIX = "aviso:img:";
const IMG_NAME_RE = /^aviso-\d+\.(png|jpeg)$/;
export const MAX_IMG = 5 * 1024 * 1024; // límite de WhatsApp para imágenes

// Catálogo inicial (doc B.2.1 + franquicias del aviso actual). Editable desde la pantalla.
const CATALOGO_INICIAL = [
  "AGENCIADOS", "BUENOS AIRES", "MOTILONES", "RODEO", "TV JUNIOR", "TV SALOME",
  "GPON CUCUTA - II", "OVER TV", "TOLEDO PLATA", "GPON TECHNOLOGY", "POR ELIMINAR",
];

const DEFAULT_CFG: AvisoConfig = {
  enabled: false,
  franquicias: [],
  catalogo: CATALOGO_INICIAL,
  image_url: null,
  desde: null,
  hasta: null,
  updated_at: null,
  updated_by: null,
};

type Bindings = { AVISO_KV?: KVNamespace } & Record<string, unknown>;
const b = env as unknown as Bindings;

function kv(): KVNamespace {
  if (!b.AVISO_KV) throw new Error("Falta el binding AVISO_KV en wrangler.jsonc");
  return b.AVISO_KV;
}

function secret(name: string): string | undefined {
  const v = b[name];
  if (typeof v === "string" && v) return v;
  return typeof process !== "undefined" ? process.env[name] : undefined;
}

// Misma normalización que n8n: sin tildes, mayúsculas, espacios simples
export const norm = (s: unknown) =>
  String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/\s+/g, " ").trim();

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function safeEq(a: string, c: string) {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(c);
  if (x.byteLength !== y.byteLength) return false;
  return (crypto.subtle as unknown as { timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean }).timingSafeEqual(x, y);
}

/** Devuelve el usuario si el header Authorization: Basic es válido; si no, null. */
export function checkAdmin(request: Request): string | null {
  const user = secret("AVISO_ADMIN_USER");
  const pass = secret("AVISO_ADMIN_PASS");
  if (!user || !pass) return null;
  const h = request.headers.get("Authorization") || "";
  if (!h.startsWith("Basic ")) return null;
  let dec: string;
  try {
    dec = new TextDecoder().decode(Uint8Array.from(atob(h.slice(6)), (c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
  const i = dec.indexOf(":");
  if (i < 0) return null;
  const u = dec.slice(0, i);
  const p = dec.slice(i + 1);
  return safeEq(u, user) && safeEq(p, pass) ? u : null;
}

export function checkN8n(request: Request): boolean {
  const token = secret("AVISO_N8N_TOKEN");
  return !!token && safeEq(request.headers.get("x-api-key") || "", token);
}

export async function getConfig(): Promise<AvisoConfig> {
  const raw = await kv().get<Partial<AvisoConfig>>(CFG_KEY, "json");
  return { ...DEFAULT_CFG, ...(raw || {}) };
}

const uniq = <T,>(arr: T[]) => [...new Set(arr)];

function isoOrNull(v: unknown): string | null {
  if (!v || typeof v !== "string") return null;
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

export async function saveConfig(
  body: Record<string, unknown>,
  origin: string,
  user: string,
): Promise<{ ok: true; data: AvisoConfig } | { ok: false; error: string }> {
  const catalogo = uniq((Array.isArray(body.catalogo) ? body.catalogo : []).map(norm).filter(Boolean)).slice(0, 100);
  const franquicias = uniq((Array.isArray(body.franquicias) ? body.franquicias : []).map(norm).filter((f) => catalogo.includes(f)));
  const prefix = `${origin}/avisos/`;
  const image_url =
    typeof body.image_url === "string" && body.image_url.startsWith(prefix) && IMG_NAME_RE.test(body.image_url.slice(prefix.length))
      ? body.image_url
      : null;
  const desde = isoOrNull(body.desde);
  const hasta = isoOrNull(body.hasta);
  const enabled = body.enabled === true;

  if (enabled && (!franquicias.length || !image_url)) {
    return { ok: false, error: "Para activar el aviso elige al menos una franquicia y sube una imagen." };
  }
  if (desde && hasta && Date.parse(hasta) <= Date.parse(desde)) {
    return { ok: false, error: 'La fecha "Hasta" debe ser posterior a "Desde".' };
  }

  const cfg: AvisoConfig = {
    enabled, franquicias, catalogo, image_url, desde, hasta,
    updated_at: new Date().toISOString(),
    updated_by: user,
  };
  await kv().put(CFG_KEY, JSON.stringify(cfg));
  return { ok: true, data: cfg };
}

function magicOk(bytes: Uint8Array, ext: string) {
  if (ext === "png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

export async function saveImage(
  file: File,
  origin: string,
): Promise<{ ok: true; image_url: string } | { ok: false; error: string }> {
  // Extensión .jpeg (no .jpg): Wasapi exige URL terminada en .png o .jpeg
  const ext = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpeg" : null;
  if (!ext) return { ok: false, error: "Solo se aceptan PNG o JPG" };
  if (file.size > MAX_IMG) return { ok: false, error: "La imagen supera 5 MB" };
  const buf = await file.arrayBuffer();
  if (!magicOk(new Uint8Array(buf), ext)) return { ok: false, error: "El archivo no es una imagen válida" };

  // Nombre versionado: WhatsApp/Wasapi nunca reciben una imagen vieja en caché
  const name = `aviso-${Date.now()}.${ext}`;
  await kv().put(IMG_PREFIX + name, buf, { metadata: { contentType: file.type } });
  return { ok: true, image_url: `${origin}/avisos/${name}` };
}

export async function serveImage(name: string): Promise<Response> {
  if (!IMG_NAME_RE.test(name)) return new Response("Not found", { status: 404 });
  const { value, metadata } = await kv().getWithMetadata<{ contentType?: string }>(IMG_PREFIX + name, "arrayBuffer");
  if (!value) return new Response("Not found", { status: 404 });
  return new Response(value, {
    headers: {
      "Content-Type": metadata?.contentType || (name.endsWith(".png") ? "image/png" : "image/jpeg"),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
