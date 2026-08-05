import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getRetellMetrics, type RetellMetrics } from "@/lib/retell.functions";
import { useEffect, useMemo, useState } from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BotMessageSquare,
  CheckCircle2,
  LogOut,
  PhoneCall,
  PhoneOff,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Panel Admin · Monitoreo IA | Tu Norte Portal" },
      {
        name: "description",
        content:
          "Panel administrativo de Tu Norte: indicadores de llamadas atendidas, resueltas y transferidas por el asistente de IA.",
      },
      { property: "og:title", content: "Panel Admin · Monitoreo IA | Tu Norte Portal" },
      {
        property: "og:description",
        content: "Indicadores en tiempo real del asistente de IA de Tu Norte TV.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

/* ---------------------------------------------------------------------- */
/* Acceso (gate simple del lado del cliente, sin backend)                  */
/* ---------------------------------------------------------------------- */

const ADMIN_USER = "admin";
const ADMIN_PASS = "TuNorte2026*";
const STORAGE_KEY = "tunorte_admin_session";

/* ---------------------------------------------------------------------- */
/* Datos demo (reemplazables por tu API / n8n)                             */
/* ---------------------------------------------------------------------- */

type DayRow = {
  dia: string;
  atendidas: number;
  resueltas: number;
  abandonadas: number;
  transferidas: number;
  noResueltas: number;
  noProcesadas: number;
};

function buildSeries(days: number): DayRow[] {
  const out: DayRow[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const seed = (d.getDate() * 37 + d.getMonth() * 11) % 23;
    const atendidas = 120 + seed * 7;
    const abandonadas = Math.round(atendidas * (0.05 + (seed % 5) / 100));
    const transferidas = Math.round(atendidas * (0.16 + (seed % 4) / 100));
    const noResueltas = Math.round(transferidas * (0.22 + (seed % 3) / 100));
    const noProcesadas = Math.round(atendidas * (0.03 + (seed % 4) / 200));
    const resueltas = atendidas - abandonadas - transferidas;
    out.push({
      dia: d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" }),
      atendidas,
      resueltas,
      abandonadas,
      transferidas,
      noResueltas,
      noProcesadas,
    });
  }
  return out;
}

const HOURLY = Array.from({ length: 12 }, (_, i) => {
  const h = 7 + i;
  return {
    hora: `${String(h).padStart(2, "0")}:00`,
    llamadas: 8 + Math.round(22 * Math.sin((i / 11) * Math.PI) + (i % 3) * 4),
  };
});

const MOTIVOS = [
  { name: "Soporte técnico", value: 38 },
  { name: "Facturación / pagos", value: 27 },
  { name: "Ventas y planes", value: 18 },
  { name: "Cobertura", value: 10 },
  { name: "PQR", value: 7 },
];

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--chart-3, var(--primary)))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--secondary-foreground))",
];

/* ---------------------------------------------------------------------- */

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthed(localStorage.getItem(STORAGE_KEY) === "ok");
    setReady(true);
  }, []);

  if (!ready) return <div className="min-h-screen bg-background" />;

  return authed ? (
    <Dashboard
      onLogout={() => {
        localStorage.removeItem(STORAGE_KEY);
        setAuthed(false);
      }}
    />
  ) : (
    <Login
      onSuccess={() => {
        localStorage.setItem(STORAGE_KEY, "ok");
        setAuthed(true);
      }}
    />
  );
}

/* ------------------------------ Login --------------------------------- */

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (user.trim() === ADMIN_USER && pass === ADMIN_PASS) onSuccess();
          else setError(true);
        }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Panel administrativo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitoreo del asistente de IA · Tu Norte
          </p>
        </div>

        <label className="mb-1 block text-xs font-medium text-muted-foreground">Usuario</label>
        <input
          value={user}
          onChange={(e) => {
            setUser(e.target.value);
            setError(false);
          }}
          autoComplete="username"
          className="mb-4 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          placeholder="admin"
        />

        <label className="mb-1 block text-xs font-medium text-muted-foreground">Contraseña</label>
        <input
          type="password"
          value={pass}
          onChange={(e) => {
            setPass(e.target.value);
            setError(false);
          }}
          autoComplete="current-password"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          placeholder="••••••••"
        />

        {error && (
          <p className="mt-3 text-sm text-destructive">Usuario o contraseña incorrectos.</p>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Ingresar
        </button>
      </form>
    </main>
  );
}

/* ---------------------------- Dashboard -------------------------------- */

const RANGES = [
  { label: "7 días", days: 7 },
  { label: "14 días", days: 14 },
  { label: "30 días", days: 30 },
];

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [days, setDays] = useState(7);
  const [live, setLive] = useState<RetellMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchMetrics = useServerFn(getRetellMetrics);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMetrics({ data: { days } })
      .then((res) => {
        if (!cancelled) setLive(res);
      })
      .catch(() => {
        if (!cancelled) setLive(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days, fetchMetrics]);

  const isLive = live?.source === "retell" && live.series.length > 0;
  const data = useMemo(
    () => (isLive ? (live!.series as DayRow[]) : buildSeries(days)),
    [isLive, live, days],
  );
  const hourlyData = isLive && live!.hourly.length ? live!.hourly : HOURLY;
  const motivosData = isLive && live!.motivos.length ? live!.motivos : MOTIVOS;



  const totals = useMemo(
    () =>
      data.reduce(
        (a, r) => ({
          atendidas: a.atendidas + r.atendidas,
          resueltas: a.resueltas + r.resueltas,
          abandonadas: a.abandonadas + r.abandonadas,
          transferidas: a.transferidas + r.transferidas,
          noResueltas: a.noResueltas + r.noResueltas,
          noProcesadas: a.noProcesadas + (r.noProcesadas ?? 0),
        }),
        {
          atendidas: 0,
          resueltas: 0,
          abandonadas: 0,
          transferidas: 0,
          noResueltas: 0,
          noProcesadas: 0,
        },
      ),
    [data],
  );

  const pct = (n: number) =>
    totals.atendidas ? `${((n / totals.atendidas) * 100).toFixed(1)}%` : "0%";

  const totalEntrantes = totals.atendidas + totals.noProcesadas;

  const kpis = [
    {
      label: "Llamadas atendidas por IA",
      value: totals.atendidas,
      hint: "Total del periodo",
      icon: PhoneCall,
    },
    {
      label: "Resueltas por IA",
      value: totals.resueltas,
      hint: `${pct(totals.resueltas)} de las atendidas`,
      icon: CheckCircle2,
    },
    {
      label: "Abandonadas durante IA",
      value: totals.abandonadas,
      hint: `${pct(totals.abandonadas)} de las atendidas`,
      icon: PhoneOff,
    },
    {
      label: "Transferidas a humano",
      value: totals.transferidas,
      hint: `${pct(totals.transferidas)} de las atendidas`,
      icon: UserRoundCheck,
    },
    {
      label: "Transferidas no resueltas",
      value: totals.noResueltas,
      hint: `${pct(totals.noResueltas)} de las atendidas`,
      icon: UserRoundX,
    },
    {
      label: "No procesadas por PBX / IVR",
      value: totals.noProcesadas,
      hint: totalEntrantes
        ? `${((totals.noProcesadas / totalEntrantes) * 100).toFixed(1)}% de las entrantes · no entregadas a la cola`
        : "No entregadas a la cola",
      icon: PhoneMissed,
    },
  ];

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BotMessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Monitoreo del asistente IA</h1>
              <p className="text-xs text-muted-foreground">Tu Norte · Panel administrativo</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border bg-background p-1">
              {RANGES.map((r) => (
                <button
                  key={r.days}
                  onClick={() => setDays(r.days)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    days === r.days
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        {/* KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <k.icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{k.value.toLocaleString("es-CO")}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{k.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{k.hint}</p>
            </div>
          ))}
        </section>

        {/* Tendencia */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Tendencia diaria de llamadas
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="dia" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="atendidas"
                  name="Atendidas"
                  stroke="hsl(var(--primary))"
                  fill="url(#gA)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="resueltas"
                  name="Resueltas por IA"
                  stroke="hsl(var(--accent))"
                  fill="transparent"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Desenlace */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Desenlace de las llamadas por día
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="dia"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="resueltas"
                    name="Resueltas IA"
                    stackId="a"
                    fill="hsl(var(--primary))"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="transferidas"
                    name="Transferidas"
                    stackId="a"
                    fill="hsl(var(--accent))"
                  />
                  <Bar
                    dataKey="abandonadas"
                    name="Abandonadas"
                    stackId="a"
                    fill="hsl(var(--muted-foreground))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Motivos */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Motivos de contacto</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={motivosData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {motivosData.map((m, i) => (
                      <Cell key={m.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => `${v}%`}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Distribución horaria */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Distribución por hora del día
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hora" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="llamadas"
                  name="Llamadas"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Detalle */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <h2 className="border-b border-border px-6 py-4 text-sm font-semibold text-foreground">
            Detalle diario
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Día</th>
                  <th className="px-4 py-3 text-right font-medium">Atendidas</th>
                  <th className="px-4 py-3 text-right font-medium">Resueltas IA</th>
                  <th className="px-4 py-3 text-right font-medium">Abandonadas</th>
                  <th className="px-4 py-3 text-right font-medium">Transferidas</th>
                  <th className="px-6 py-3 text-right font-medium">No resueltas</th>
                </tr>
              </thead>
              <tbody>
                {[...data].reverse().map((r) => (
                  <tr key={r.dia} className="border-t border-border">
                    <td className="px-6 py-3 font-medium text-foreground">{r.dia}</td>
                    <td className="px-4 py-3 text-right text-foreground">{r.atendidas}</td>
                    <td className="px-4 py-3 text-right text-foreground">{r.resueltas}</td>
                    <td className="px-4 py-3 text-right text-foreground">{r.abandonadas}</td>
                    <td className="px-4 py-3 text-right text-foreground">{r.transferidas}</td>
                    <td className="px-6 py-3 text-right text-foreground">{r.noResueltas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="pb-6 text-center text-xs text-muted-foreground">
          {loading
            ? "Cargando datos de Retell…"
            : isLive
              ? `Datos en vivo de Retell · ${live!.totalCalls.toLocaleString("es-CO")} llamadas · duración promedio ${live!.avgDurationSec}s`
              : `Mostrando datos de demostración${live?.error ? ` (Retell: ${live.error})` : ""}. Verifica la API Key o el rango de fechas.`}
        </p>

      </div>
    </main>
  );
}
