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
    // n8n often wraps the useful payload
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

export const Route = createFileRoute("/api/public/sae")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        const webhook = process.env["SAE_WEBHOOK_URL"];
        if (!webhook) return json({ error: "not_configured" }, 503);

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
        if (typeof body["token"] === "string") payload["token"] = body["token"].slice(0, 500);

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
            return json({ error: "upstream_error", status: res.status, ...data }, 502);
          }
          const ok = data["ok"] !== false && data["success"] !== false && !data["error"];
          if (!ok) {
            return json(
              { error: String(data["error"] ?? data["message"] ?? "rejected") },
              401,
            );
          }
          return json({ ok: true, ...data });
        } catch {
          return json({ error: "network_error" }, 502);
        }
      },
    },
  },
});
