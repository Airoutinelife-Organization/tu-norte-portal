import { createServerFn } from "@tanstack/react-start";

/* ---------------------------------------------------------------------- */
/* Tipos de datos Redis                                                     */
/* ---------------------------------------------------------------------- */

export type RedisCall = {
  callKey: string;
  user_number: string;
  caller_name: string;
  external_id: string;
  specialist: string;
  request: string;
  score: string;
  status: string;
  type: string;
  notes: string;
  call_transfer: string;
  pbx: string;
  source: string;
  date: string;
  end_reason: string;
};

export type RedisCallsResult = {
  source: "redis" | "unavailable";
  calls: RedisCall[];
  error?: string;
};

/* ---------------------------------------------------------------------- */
/* Server function                                                          */
/* ---------------------------------------------------------------------- */

const WEBHOOK_URL =
  "https://vmi3345591.contaboserver.net/webhook/redis-call-get-range";

export const getRedisCallsVentas = createServerFn().handler(
  async (): Promise<RedisCallsResult> => {
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const text = await res.text();
        return { source: "unavailable", calls: [], error: text };
      }

      const raw = await res.json();

      /* El webhook devuelve un objeto cuyas claves son "call:<id>"
         y los valores son los campos de cada llamada.              */
      const calls: RedisCall[] = Object.entries(
        raw as Record<string, Record<string, string>>,
      )
        .filter(([key]) => key.startsWith("call:"))
        .map(([key, val]) => ({
          callKey: key,
          user_number: val.user_number ?? "",
          caller_name: val.caller_name ?? "",
          external_id: val.external_id ?? "",
          specialist: val.specialist ?? "",
          request: val.request ?? "",
          score: val.score ?? "0",
          status: val.status ?? "",
          type: val.type ?? "",
          notes: val.notes ?? "",
          call_transfer: val.call_transfer ?? "No",
          pbx: val.pbx ?? "",
          source: val.source ?? "",
          date: val.date ?? "",
          end_reason: val.end_reason ?? "",
        }))
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

      return { source: "redis", calls };
    } catch (err) {
      return {
        source: "unavailable",
        calls: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
);

export type PurchasingCall = {
  key?: string;
  status?: string;
  channel?: string;
  start_timestamp?: string;
  agent?: string;
  specialist?: string;
  phone?: string;
  external_id?: string;
  caller_name?: string;
  zone?: string;
  call_summary?: string;
  notes?: string;
  url?: string;
  disconnection_reason?: string;
  assignedTo?: string;
};

export const getPurchasingCalls = createServerFn().handler(
  async (): Promise<{ calls: PurchasingCall[]; error?: string }> => {
    try {
      const res = await fetch("https://vmi3345591.contaboserver.net/webhook/get-purchasing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) return { calls: [], error: await res.text() };
      const raw = await res.json();
      const data = Array.isArray(raw) ? raw : (raw ? [raw] : []);
      return { calls: data };
    } catch (err) {
      return { calls: [], error: String(err) };
    }
  }
);

export type ServiceCall = {
  key?: string;
  status?: string;
  start_timestamp?: string;
  channel?: string;
  agent?: string;
  specialist?: string;
  phone?: string;
  external_id?: string;
  caller_name?: string;
  call_summary?: string;
  notes?: string;
  url?: string;
  call_transfer?: string;
  pbx?: string;
  disconnection_reason?: string;
  assignedTo?: string;
};

export const getServiceCalls = createServerFn().handler(
  async (): Promise<{ calls: ServiceCall[]; error?: string }> => {
    try {
      const res = await fetch("https://vmi3345591.contaboserver.net/webhook/get-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) return { calls: [], error: await res.text() };
      const raw = await res.json();
      const data = Array.isArray(raw) ? raw : (raw ? [raw] : []);
      return { calls: data };
    } catch (err) {
      return { calls: [], error: String(err) };
    }
  }
);
