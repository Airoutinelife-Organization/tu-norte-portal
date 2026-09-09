import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import * as fs from "fs";
import * as path from "path";

let envCache: Record<string, string> | null = null;
function getEnv(key: string): string {
  if (typeof process !== "undefined" && process.env[key]) {
    return process.env[key] as string;
  }
  if (!envCache && typeof process !== "undefined") {
    try {
      const envPath = path.resolve(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf-8");
        envCache = {};
        for (const line of envContent.split("\n")) {
          const match = line.match(/^([^=]+)=(.*)$/);
          if (match) {
            let val = match[2].trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            envCache[match[1].trim()] = val;
          }
        }
      }
    } catch (e) {
      envCache = {};
    }
  }
  return envCache?.[key] || "";
}

export const Route = createFileRoute("/api/public/dashboard-config")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(
          JSON.stringify({
            VITE_WEBHOOK_BASE_URL:
              getEnv("VITE_WEBHOOK_BASE_URL") ||
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
