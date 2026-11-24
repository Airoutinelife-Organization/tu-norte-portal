import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

// Subida de la imagen del aviso (multipart, campo "file"). Basic Auth.
export const Route = createFileRoute("/api/admin/aviso-corte-imagen")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const lib = await import("@/lib/aviso-corte.server");
        if (!lib.checkAdmin(request)) return lib.json({ error: "Usuario o contraseña incorrectos" }, 401);
        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return lib.json({ error: "Formulario inválido" }, 400);
        }
        const file = form.get("file");
        if (!file || typeof file === "string") return lib.json({ error: "Falta el archivo" }, 400);
        try {
          const r = await lib.saveImage(file, new URL(request.url).origin);
          return r.ok ? lib.json({ image_url: r.image_url }) : lib.json({ error: r.error }, 400);
        } catch (e) {
          return lib.json({ error: (e as Error).message }, 500);
        }
      },
    },
  },
});
