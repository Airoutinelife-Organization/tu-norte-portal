import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

// Imagen pública del aviso: /avisos/aviso-<ts>.png|jpeg (URL directa que recibe Wasapi)
export const Route = createFileRoute("/avisos/$file")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const lib = await import("@/lib/aviso-corte.server");
        try {
          return await lib.serveImage(params.file);
        } catch {
          return new Response("Not found", { status: 404 });
        }
      },
    },
  },
});
