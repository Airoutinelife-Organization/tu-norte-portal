import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

const ACTIONS = ["register", "login", "account", "logout"] as const;
type Action = (typeof ACTIONS)[number];

function env(name: string): string | undefined {
  const g = (globalThis as unknown as Record<string, string | undefined>)[name];
  return process.env[name] || g;
}

function unwrap(payload: unknown): Record<string, unknown> | null {
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const r = unwrap(item);
      if (r) return r;
    }
    return null;
  }
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    for (const key of ["json", "data", "body", "result", "output"]) {
      const v = o[key];
      if (v && typeof v === "object") {
        const nested = unwrap(v);
        if (nested) return nested;
      }
    }
    return o;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Sesión firmada (HMAC-SHA256) — sin base de datos en el portal        */
/* ------------------------------------------------------------------ */

const SESSION_TTL = 60 * 60 * 8; // 8 horas

function b64url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, msg: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return b64url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg)));
}

async function signToken(secret: string, cedula: string) {
  const payload = `${cedula}.${Math.floor(Date.now() / 1000) + SESSION_TTL}`;
  return `${payload}.${await hmac(secret, payload)}`;
}

async function verifyToken(secret: string, token: string, cedula: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [sub, exp, sig] = parts;
  if (sub !== cedula) return false;
  if (!/^\d+$/.test(exp ?? "") || Number(exp) < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmac(secret, `${sub}.${exp}`);
  if (expected.length !== sig!.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig!.charCodeAt(i);
  return diff === 0;
}

/* Confirmación explícita de credenciales por parte del flujo n8n/Redis.
   Si el webhook no confirma la contraseña, NO se concede acceso.        */
const TRUE_VALUES = new Set(["true", "1", "si", "sí", "yes", "ok", "valid", "authenticated"]);

function isTrue(v: unknown) {
  if (v === true) return true;
  if (typeof v === "string") return TRUE_VALUES.has(v.trim().toLowerCase());
  return false;
}

function credentialsConfirmed(data: Record<string, unknown>) {
  const flags = [
    "auth",
    "auth_ok",
    "authenticated",
    "autenticado",
    "password_ok",
    "clave_ok",
    "credentials_valid",
    "valid",
    "verified",
  ];
  if (flags.some((f) => isTrue(data[f]))) return true;
  const status = String(data["auth_status"] ?? data["estado_auth"] ?? "").toLowerCase();
  return status === "authenticated" || status === "autenticado" || status === "ok";
}

export const Route = createFileRoute("/api/public/sae")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        const webhook = env("SAE_WEBHOOK_URL");
        if (!webhook) return json({ error: "not_configured" }, 503);
        const secret = env("SAE_SESSION_SECRET");
        if (!secret) return json({ error: "not_configured" }, 503);

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ error: "invalid_json" }, 400);
        }

        const action = String(body["action"] ?? "") as Action;
        if (!ACTIONS.includes(action)) return json({ error: "invalid_action" }, 400);

        const cedula = String(body["cedula"] ?? "")
          .replace(/\D/g, "")
          .slice(0, 20);
        if (!cedula || cedula.length < 5) return json({ error: "invalid_cedula" }, 400);

        const password = typeof body["password"] === "string" ? body["password"].slice(0, 200) : "";
        if ((action === "login" || action === "register") && password.length < 6) {
          return json({ error: "invalid_password" }, 400);
        }

        const token = typeof body["token"] === "string" ? body["token"].slice(0, 500) : "";

        // Los datos privados solo se consultan con una sesión firmada válida.
        if (action === "account" || action === "logout") {
          if (!token || !(await verifyToken(secret, token, cedula))) {
            return json({ error: "unauthorized" }, 401);
          }
          if (action === "logout") return json({ ok: true });
        }

        const payload: Record<string, unknown> = {
          action,
          cedula,
          source: "tunorte-portal",
        };
        if (password) payload["password"] = password;
        if (action === "register") {
          payload["nombre"] = String(body["nombre"] ?? "").slice(0, 120);
          payload["email"] = String(body["email"] ?? "").slice(0, 160);
          payload["telefono"] = String(body["telefono"] ?? "").slice(0, 40);
        }

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 25000);
          const res = await fetch(webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          clearTimeout(timeout);

          const raw = await res.text();
          let parsed: unknown = raw;
          try {
            parsed = JSON.parse(raw);
          } catch {
            /* keep raw text */
          }
          const data = unwrap(parsed) ?? {};

          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
              return json({ error: "invalid_credentials" }, 401);
            }
            return json({ error: "upstream_error", status: res.status }, 502);
          }
          const ok = data["ok"] !== false && data["success"] !== false && !data["error"];
          if (!ok) {
            return json(
              { error: String(data["error"] ?? data["message"] ?? "invalid_credentials") },
              401,
            );
          }

          if (action === "register") {
            return json({ ok: true, pendiente: true });
          }

          if (action === "login") {
            // El portal nunca entrega datos privados si el flujo no confirmó la contraseña.
            if (!credentialsConfirmed(data)) {
              return json({ error: "account_required" }, 403);
            }
            const session = await signToken(secret, cedula);
            return json({ ok: true, token: session, ...data });
          }

          return json({ ok: true, ...data });
        } catch {
          return json({ error: "network_error" }, 502);
        }
      },
    },
  },
});
