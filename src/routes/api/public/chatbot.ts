import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { buildContext } from "@/lib/rag";

const N8N_WEBHOOK_URL =
  "https://vmi3345591.contaboserver.net/webhook/2e7caeca-c246-442f-910b-7d14e7e9a013/chat";

const SYSTEM_PROMPT = `Eres "Buen Servicio", el asistente virtual oficial de Tu Norte (Tu Norte TV / TVN Cúcuta), operador de internet de fibra y televisión en Cúcuta, Norte de Santander.

REGLAS ESTRICTAS:
- Responde ÚNICAMENTE con la información del CONTEXTO (Manual de Procesos de Tu Norte) y datos públicos del portal.
- Si el contexto no cubre la pregunta, dilo con honestidad y ofrece escalar por WhatsApp (333 033 3696) o visitar una oficina. Nunca inventes precios, plazos ni procesos.
- Sé breve (máx. 5 líneas), cálido y en español colombiano. Usa viñetas cuando ayuden.
- Menciona valores, tiempos y condiciones exactamente como aparecen en el contexto.
- No menciones "manual", "contexto", "documento" ni procesos internos de agentes; traduce la información a lenguaje para el cliente.`;


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
        let body: {
          message?: string;
          sessionId?: string;
          history?: { role?: string; content?: string }[];
        };
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

        const history = Array.isArray(body.history)
          ? body.history
              .filter(
                (m) =>
                  (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string",
              )
              .slice(-8)
              .map((m) => ({ role: m.role as "user" | "assistant", content: String(m.content).slice(0, 1000) }))
          : [];

        // 1) RAG grounded answer over the Tu Norte operations manual
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (apiKey) {
          try {
            const context = buildContext(message, 4);
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 25000);
            const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Lovable-API-Key": apiKey,
              },
              body: JSON.stringify({
                model: "google/gemini-3.7-flash",
                messages: [
                  { role: "system", content: SYSTEM_PROMPT },
                  { role: "system", content: `CONTEXTO (Manual de Procesos Tu Norte):\n\n${context}` },
                  ...history,
                  { role: "user", content: message },
                ],
              }),
              signal: controller.signal,
            });
            clearTimeout(timeout);

            if (res.status === 429) {
              return json(
                { error: "rate_limited", reply: "Estoy recibiendo muchas consultas ahora mismo. Intenta de nuevo en unos segundos o escríbenos al WhatsApp 333 033 3696." },
                429,
              );
            }
            if (res.status === 402) {
              return json(
                { error: "payment_required", reply: "El asistente está temporalmente fuera de servicio. Escríbenos al WhatsApp 333 033 3696 y te ayudamos de inmediato." },
                402,
              );
            }

            if (res.ok) {
              const data = (await res.json()) as {
                choices?: { message?: { content?: string } }[];
              };
              const reply = data.choices?.[0]?.message?.content?.trim();
              if (reply) return json({ reply, source: "rag" });
            }
          } catch {
            /* fall through to n8n */
          }
        }

        // 2) Fallback: n8n assistant
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
          return json({ reply, source: "n8n" });
        } catch {
          return json({ error: "network_error" }, 502);
        }
      },

    },
  },
});
