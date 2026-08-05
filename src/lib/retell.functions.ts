import { createServerFn } from "@tanstack/react-start";

export type RetellDayRow = {
  dia: string;
  atendidas: number;
  resueltas: number;
  abandonadas: number;
  transferidas: number;
  noResueltas: number;
  noProcesadas: number;
};

export type RetellMetrics = {
  source: "retell" | "unavailable";
  error?: string;
  totalCalls: number;
  series: RetellDayRow[];
  hourly: { hora: string; llamadas: number }[];
  motivos: { name: string; value: number }[];
  avgDurationSec: number;
};

type RetellCall = {
  call_id?: string;
  start_timestamp?: number;
  end_timestamp?: number;
  duration_ms?: number;
  disconnection_reason?: string;
  transfer_destination_number?: string;
  call_analysis?: {
    call_successful?: boolean;
    user_sentiment?: string;
    custom_analysis_data?: Record<string, unknown>;
  };
};

const TRANSFER_REASONS = new Set([
  "call_transfer",
  "agent_transfer",
  "transfer",
  "warm_transfer",
  "cold_transfer",
]);

const ABANDON_REASONS = new Set([
  "user_hangup",
  "voicemail_reached",
  "no_valid_payment",
  "inactivity",
]);

// Llamadas que nunca llegaron al IVR/PBX ni se entregaron a la cola
const NOT_PROCESSED_REASONS = new Set([
  "dial_no_answer",
  "dial_busy",
  "dial_failed",
  "no_answer",
  "registered_call_timeout",
  "concurrency_limit_reached",
  "telephony_provider_unavailable",
  "machine_detected",
]);

function isNotProcessed(reason: string, durationMs: number) {
  return (
    NOT_PROCESSED_REASONS.has(reason) ||
    reason.startsWith("error") ||
    reason.includes("dial_failed") ||
    durationMs <= 0
  );
}


function dayLabel(d: Date) {
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", timeZone: "America/Bogota" });
}

export const getRetellMetrics = createServerFn({ method: "POST" })
  .inputValidator((input: { days?: number }) => ({
    days: Math.min(Math.max(Number(input?.days) || 7, 1), 90),
  }))
  .handler(async ({ data }): Promise<RetellMetrics> => {
    const empty: RetellMetrics = {
      source: "unavailable",
      totalCalls: 0,
      series: [],
      hourly: [],
      motivos: [],
      avgDurationSec: 0,
    };

    const apiKey = process.env["RETELL_API_KEY"];
    if (!apiKey) return { ...empty, error: "missing_api_key" };

    const now = Date.now();
    const from = now - data.days * 24 * 60 * 60 * 1000;

    const calls: RetellCall[] = [];
    try {
      let paginationKey: string | undefined;
      for (let page = 0; page < 10; page++) {
        const res = await fetch("https://api.retellai.com/v2/list-calls", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filter_criteria: {
              start_timestamp: { lower_threshold: from, upper_threshold: now },
            },
            sort_order: "descending",
            limit: 1000,
            ...(paginationKey ? { pagination_key: paginationKey } : {}),
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          console.error(`Retell list-calls failed [${res.status}]: ${body}`);
          return { ...empty, error: `retell_${res.status}` };
        }

        const payload = (await res.json()) as RetellCall[] | { calls?: RetellCall[] };
        const batch = Array.isArray(payload) ? payload : (payload.calls ?? []);
        calls.push(...batch);
        if (batch.length < 1000) break;
        paginationKey = batch[batch.length - 1]?.call_id;
        if (!paginationKey) break;
      }
    } catch (e) {
      console.error("Retell request error", e);
      return { ...empty, error: "network_error" };
    }

    // Buckets per day
    const byDay = new Map<string, RetellDayRow>();
    const orderedDays: string[] = [];
    for (let i = data.days - 1; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const label = dayLabel(d);
      orderedDays.push(label);
      byDay.set(label, {
        dia: label,
        atendidas: 0,
        resueltas: 0,
        abandonadas: 0,
        transferidas: 0,
        noResueltas: 0,
      });
    }

    const hourly = Array.from({ length: 24 }, (_, h) => ({
      hora: `${String(h).padStart(2, "0")}:00`,
      llamadas: 0,
    }));

    const motivoCount = new Map<string, number>();
    let durationTotal = 0;
    let durationCount = 0;

    for (const c of calls) {
      const ts = c.start_timestamp ?? c.end_timestamp;
      if (!ts) continue;
      const d = new Date(ts);
      const row = byDay.get(dayLabel(d));
      if (!row) continue;

      row.atendidas += 1;

      const bogotaHour = Number(
        new Intl.DateTimeFormat("es-CO", {
          hour: "2-digit",
          hour12: false,
          timeZone: "America/Bogota",
        }).format(d),
      );
      const hourEntry = hourly[bogotaHour % 24];
      if (hourEntry) hourEntry.llamadas += 1;

      const durationMs =
        c.duration_ms ?? (c.end_timestamp && c.start_timestamp ? c.end_timestamp - c.start_timestamp : 0);
      if (durationMs > 0) {
        durationTotal += durationMs;
        durationCount += 1;
      }

      const reason = (c.disconnection_reason ?? "").toLowerCase();
      const transferred = TRANSFER_REASONS.has(reason) || Boolean(c.transfer_destination_number);
      const successful = c.call_analysis?.call_successful;

      if (transferred) {
        row.transferidas += 1;
        if (successful === false) row.noResueltas += 1;
      } else if (ABANDON_REASONS.has(reason) && durationMs < 20000) {
        row.abandonadas += 1;
      } else if (successful === false) {
        row.noResueltas += 1;
      } else {
        row.resueltas += 1;
      }

      const custom = c.call_analysis?.custom_analysis_data ?? {};
      const rawMotivo =
        (custom["motivo"] as string) ??
        (custom["intent"] as string) ??
        (custom["reason"] as string) ??
        (custom["categoria"] as string) ??
        (c.call_analysis?.user_sentiment ? `Sentimiento: ${c.call_analysis.user_sentiment}` : "Sin clasificar");
      const motivo = String(rawMotivo).slice(0, 40);
      motivoCount.set(motivo, (motivoCount.get(motivo) ?? 0) + 1);
    }

    const totalCalls = calls.length;
    const motivos = [...motivoCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({
        name,
        value: totalCalls ? Math.round((count / totalCalls) * 100) : 0,
      }));

    return {
      source: "retell",
      totalCalls,
      series: orderedDays.map((label) => byDay.get(label)!),
      hourly: hourly.filter((h) => h.llamadas > 0).length ? hourly : hourly,
      motivos,
      avgDurationSec: durationCount ? Math.round(durationTotal / durationCount / 1000) : 0,
    };
  });
