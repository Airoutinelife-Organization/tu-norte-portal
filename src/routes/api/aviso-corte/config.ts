import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

// Lectura de la config para n8n. Header: x-api-key = AVISO_N8N_TOKEN
export const Route = createFileRoute("/api/aviso-corte/config")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const lib = await import("@/lib/aviso-corte.server");
        if (!lib.checkN8n(request)) return lib.json({ error: "unauthorized" }, 401);
        try {
          const { catalogo: _omit, ...pub } = await lib.getConfig();
          return lib.json(pub);
        } catch (e) {
          return lib.json({ error: (e as Error).message }, 500);
        }
      },
    },
  },
});
