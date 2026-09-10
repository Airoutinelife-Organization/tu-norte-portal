import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
// Environment variables are now accessed via import.meta.env which Vite statically replaces at build time.

export const Route = createFileRoute("/api/public/dashboard-config")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(
          JSON.stringify({
            VITE_WEBHOOK_BASE_URL:
              (typeof process !== "undefined" ? process.env.VITE_WEBHOOK_BASE_URL : undefined) ||
              import.meta.env.VITE_WEBHOOK_BASE_URL ||
              "https://vmi3533489.contaboserver.net/webhook",
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      },
    },
  },
});
