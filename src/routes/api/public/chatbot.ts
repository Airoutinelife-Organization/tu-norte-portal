import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

const N8N_WEBHOOK_URL =
  "https://vmi3345591.contaboserver.net/webhook/2e7caeca-c246-442f-910b-7d14e7e9a013/chat";

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

function pickText(payload: unknown): string | null {
  if (typeof payload === "string") return payload.trim() || null;
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const t = pickText(item);
      if (t) return t;
    }
    return null;
  }
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    for (const key of ["output", "text", "message", "reply", "answer", "response", "content"]) {
      const v = o[key];
      if (typeof v === "string" && v.trim()) return v.trim();
      if (v && typeof v === "object") {
        const nested = pickText(v);
        if (nested) return nested;
      }
    }
  }
  return null;
}

export const Route = createFileRoute("/api/public/chatbot")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        let body: { message?: string; sessionId?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return json({ error: "Invalid JSON" }, 400);
        }

        const message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
        const sessionId =
          typeof body.sessionId === "string" && body.sessionId.length <= 100
            ? body.sessionId
            : "web-anon";

        if (!message) return json({ error: "message is required" }, 400);

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 25000);
          const res = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "sendMessage",
              sessionId,
              chatInput: message,
              message,
              source: "tunorte-portal",
            }),
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (!res.ok) return json({ error: "upstream_error", status: res.status }, 502);

          const raw = await res.text();
          let parsed: unknown = raw;
          try {
            parsed = JSON.parse(raw);
          } catch {
            /* keep raw text */
          }
          const reply = pickText(parsed);
          if (!reply) return json({ error: "empty_reply" }, 502);
          return json({ reply });
        } catch {
          return json({ error: "network_error" }, 502);
        }
      },
    },
  },
});
