import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

// Config del aviso para la pantalla de administración (Basic Auth con AVISO_ADMIN_USER / AVISO_ADMIN_PASS)
export const Route = createFileRoute("/api/admin/aviso-corte-config")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const lib = await import("@/lib/aviso-corte.server");
        if (!lib.checkAdmin(request)) return lib.json({ error: "Usuario o contraseña incorrectos" }, 401);
        try {
          return lib.json(await lib.getConfig());
        } catch (e) {
          return lib.json({ error: (e as Error).message }, 500);
        }
      },
      PUT: async ({ request }) => {
        const lib = await import("@/lib/aviso-corte.server");
        const user = lib.checkAdmin(request);
        if (!user) return lib.json({ error: "Usuario o contraseña incorrectos" }, 401);
        let body: Record<string, unknown>;
        try {
          body = await request.json();
        } catch {
          return lib.json({ error: "JSON inválido" }, 400);
        }
        try {
          const r = await lib.saveConfig(body, new URL(request.url).origin, user);
          return r.ok ? lib.json(r.data) : lib.json({ error: r.error }, 400);
        } catch (e) {
          return lib.json({ error: (e as Error).message }, 500);
        }
      },
    },
  },
});
