import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  getRetellMetrics,
  type RetellMetrics,
} from "@/lib/retell.functions";
import {
  getRedisCallsVentas,
  type RedisCall,
} from "@/lib/redis.functions";

import React, { useEffect, useMemo, useState } from "react";

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
  ChevronDown,
  ChevronUp,
  Database,
  HeadphonesIcon,
  LayoutDashboard,
  LogOut,
  PhoneCall,
  PhoneMissed,
  PhoneOff,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
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
/* Auth                                                                     */
/* ---------------------------------------------------------------------- */

const ADMIN_USER = "admin";
const ADMIN_PASS = "TuNorte2026*";
const STORAGE_KEY = "tunorte_admin_session";

/* ---------------------------------------------------------------------- */
/* Types                                                                    */
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

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-4)",
];

/* ---------------------------------------------------------------------- */
/* AdminPage                                                                */
/* ---------------------------------------------------------------------- */

function AdminPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "ok") {
      window.location.href = "/calls-dashboard/index.html";
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) return <div className="min-h-screen bg-background" />;

  return (
    <Login
      onSuccess={() => {
        localStorage.setItem(STORAGE_KEY, "ok");
        window.location.href = "/calls-dashboard/index.html";
      }}
    />
  );
}

/* ---------------------------------------------------------------------- */
/* Login                                                                    */
/* ---------------------------------------------------------------------- */

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
          onChange={(e) => { setUser(e.target.value); setError(false); }}
          autoComplete="username"
          className="mb-4 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          placeholder="admin"
        />

        <label className="mb-1 block text-xs font-medium text-muted-foreground">Contraseña</label>
        <input
          type="password"
          value={pass}
          onChange={(e) => { setPass(e.target.value); setError(false); }}
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

/* ---------------------------------------------------------------------- */
/* Dashboard                                                                */
/* ---------------------------------------------------------------------- */

const RANGES = [
  { label: "Hoy", days: 1 },
  { label: "7 días", days: 7 },
  { label: "14 días", days: 14 },
  { label: "30 días", days: 30 },
];

type FilterMode = "preset" | "range";

type Tab = "general" | "ventas" | "servicio";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "Panel General", icon: LayoutDashboard },
  { id: "ventas", label: "Ventas", icon: ShoppingBag },
  { id: "servicio", label: "Servicio al Cliente", icon: HeadphonesIcon },
];

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [days, setDays] = useState(7);
  const [filterMode, setFilterMode] = useState<FilterMode>("preset");
  const [rangeStart, setRangeStart] = useState(""); // "YYYY-MM-DD"
  const [rangeEnd, setRangeEnd] = useState("");   // "YYYY-MM-DD"
  const [live, setLive] = useState<RetellMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchMetrics = useServerFn(getRetellMetrics);

  // ── Redis ────────────────────────────────────────────────────────────
  const [redisCalls, setRedisCalls] = useState<RedisCall[]>([]);
  const [redisLoading, setRedisLoading] = useState(true);
  const [redisError, setRedisError] = useState<string | null>(null);
  const [redisSearch, setRedisSearch] = useState("");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const fetchRedisCalls = useServerFn(getRedisCallsVentas);

  useEffect(() => {
    let cancelled = false;
    setRedisLoading(true);
    fetchRedisCalls()
      .then((res) => {
        if (!cancelled) {
          setRedisCalls(res.calls);
          setRedisError(res.error ?? null);
        }
      })
      .catch((e) => { if (!cancelled) setRedisError(String(e)); })
      .finally(() => { if (!cancelled) setRedisLoading(false); });
    return () => { cancelled = true; };
  }, [fetchRedisCalls]);

  const filteredCalls = useMemo(() => {
    const q = redisSearch.toLowerCase();
    if (!q) return redisCalls;
    return redisCalls.filter(
      (c) =>
        c.caller_name.toLowerCase().includes(q) ||
        c.user_number.includes(q) ||
        c.external_id.includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.specialist.toLowerCase().includes(q) ||
        c.notes.toLowerCase().includes(q) ||
        c.request.toLowerCase().includes(q),
    );
  }, [redisCalls, redisSearch]);
  // ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    let fetchArgs: { days?: number; startMs?: number; endMs?: number };
    if (filterMode === "range" && rangeStart && rangeEnd) {
      const startMs = new Date(rangeStart).setHours(0, 0, 0, 0);
      const endMs   = new Date(rangeEnd).setHours(23, 59, 59, 999);
      fetchArgs = { startMs, endMs };
    } else {
      fetchArgs = { days };
    }

    fetchMetrics({ data: fetchArgs })
      .then((res) => { if (!cancelled) setLive(res); })
      .catch(() => { if (!cancelled) setLive(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [days, filterMode, rangeStart, rangeEnd, fetchMetrics]);

  const isLive = true; // Forzamos true ya que ahora leemos de Redis

  const filteredRedisCalls = useMemo(() => {
    let startMs = 0;
    let endMs = Infinity;
    
    if (filterMode === "range" && rangeStart && rangeEnd) {
      startMs = new Date(rangeStart).setHours(0, 0, 0, 0);
      endMs = new Date(rangeEnd).setHours(23, 59, 59, 999);
    } else {
      startMs = Date.now() - days * 24 * 60 * 60 * 1000;
      endMs = Date.now();
    }
    
    return redisCalls.filter((c) => {
      const t = new Date(c.date).getTime();
      return t >= startMs && t <= endMs;
    });
  }, [redisCalls, filterMode, rangeStart, rangeEnd, days]);


  const { data, hourlyData, motivosData } = useMemo(() => {
    const dayMap = new Map<string, DayRow>();
    const hourMap = new Map<string, number>();
    const motivoCount = new Map<string, number>();
    let totalMotivos = 0;

    for (const c of filteredRedisCalls) {
      const d = new Date(c.date);
      if (isNaN(d.getTime())) continue;

      // 1. Agrupar por día
      const diaStr = d.toISOString().split("T")[0];
      if (!dayMap.has(diaStr)) {
        dayMap.set(diaStr, {
          dia: diaStr,
          atendidas: 0,
          resueltas: 0,
          abandonadas: 0,
          transferidas: 0,
          noResueltas: 0,
          noProcesadas: 0,
        });
      }
      const row = dayMap.get(diaStr)!;
      row.atendidas++;
      if (Number(c.score) > 3 || c.specialist === "Service") row.resueltas++;
      if (c.end_reason === "user_hangup") row.abandonadas++;

      if (c.pbx === "transfer failed") {
        row.noProcesadas++;
      } else {
        if (c.call_transfer === "ByProcess") row.transferidas++;
        if (c.call_transfer === "ByRequest") row.noResueltas++;
      }

      // 2. Agrupar por hora
      const horaStr = d.getHours().toString().padStart(2, "0") + ":00";
      hourMap.set(horaStr, (hourMap.get(horaStr) ?? 0) + 1);

      // 3. Agrupar motivos (usando request o type)
      const motivo = c.request || c.type || "Otro";
      motivoCount.set(motivo, (motivoCount.get(motivo) ?? 0) + 1);
      totalMotivos++;
    }

    const dataArr = Array.from(dayMap.values()).sort((a, b) => a.dia.localeCompare(b.dia));

    const hourlyArr = Array.from(hourMap.entries())
      .map(([hora, llamadas]) => ({ hora, llamadas }))
      .sort((a, b) => a.hora.localeCompare(b.hora));

    const motivosArr = Array.from(motivoCount.entries())
      .map(([name, count]) => ({
        name: name.length > 25 ? name.substring(0, 25) + "…" : name,
        value: totalMotivos > 0 ? Number(((count / totalMotivos) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return { data: dataArr, hourlyData: hourlyArr, motivosData: motivosArr };
  }, [filteredRedisCalls]);


  const totals = useMemo(() => {
    return filteredRedisCalls.reduce(
      (a, c) => {
        a.atendidas++;
        if (Number(c.score) > 3 || c.specialist === "Service") a.resueltas++;
        if (c.end_reason === "user_hangup") a.abandonadas++;
        
        if (c.pbx === "transfer failed") {
          a.noProcesadas++;
        } else {
          if (c.call_transfer === "ByProcess") a.transferidas++;
          if (c.call_transfer === "ByRequest") a.noResueltas++;
        }
        
        return a;
      },
      { atendidas: 0, resueltas: 0, abandonadas: 0, transferidas: 0, noResueltas: 0, noProcesadas: 0 },
    );
  }, [filteredRedisCalls]);

  const pct = (n: number) =>
    totals.atendidas ? `${((n / totals.atendidas) * 100).toFixed(1)}%` : "0%";

  const totalEntrantes = totals.atendidas + totals.noProcesadas;

  const kpis = [
    { label: "Llamadas Atendidas", value: totals.atendidas, hint: "Total del periodo", icon: PhoneCall },
    { label: "Resueltas por IA", value: totals.resueltas, hint: `${pct(totals.resueltas)} · sin transferencia y hacia servicio al cliente`, icon: CheckCircle2 },
    { label: "Abandonadas", value: totals.abandonadas, hint: `${pct(totals.abandonadas)} · el usuario colgó`, icon: PhoneOff },
    { label: "Escaladas dentro de proceso", value: totals.transferidas, hint: `${pct(totals.transferidas)} · requieren gestión humana`, icon: UserRoundCheck },
    { label: "Escaladas por peticion", value: totals.noResueltas, hint: `${pct(totals.noResueltas)} · el usuario lo solicitó`, icon: UserRoundX },
    {
      label: "Transferencia fallida por pbx",
      value: totals.noProcesadas,
      hint: totalEntrantes
        ? `${((totals.noProcesadas / totalEntrantes) * 100).toFixed(1)}% fallaron en PBX`
        : "Falla al transferir en PBX",
      icon: PhoneMissed,
    },
  ];

  const tooltipStyle = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    fontSize: 12,
  };

  return (
    <main className="min-h-screen bg-muted/30">
      {/* ── Header ── */}
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
            {activeTab === "general" && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Preset buttons */}
                <div className="flex rounded-lg border border-border bg-background p-1">
                  {RANGES.map((r) => (
                    <button
                      key={r.days}
                      onClick={() => { setFilterMode("preset"); setDays(r.days); }}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        filterMode === "preset" && days === r.days
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                  {/* Rango button */}
                  <button
                    onClick={() => setFilterMode("range")}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      filterMode === "range"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Rango
                  </button>
                </div>

                {/* Date range inputs — visible only in range mode */}
                {filterMode === "range" && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={rangeStart}
                      max={rangeEnd || undefined}
                      onChange={(e) => setRangeStart(e.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                    />
                    <span className="text-xs text-muted-foreground">→</span>
                    <input
                      type="date"
                      value={rangeEnd}
                      min={rangeStart || undefined}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>
            )}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto max-w-7xl px-4">
          <nav className="flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">

        {/* ═══════════════ PANEL GENERAL ═══════════════ */}
        {activeTab === "general" && (
          <div className="space-y-6">
            {/* KPIs */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

            {/* Tendencia diaria */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Tendencia diaria de llamadas</h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="dia" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="atendidas" name="Atendidas" stroke="var(--chart-1)" fill="url(#gA)" strokeWidth={2} />
                    <Area type="monotone" dataKey="resueltas" name="Resueltas por IA" stroke="var(--chart-2)" fill="url(#gR)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Desenlace + Motivos */}
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
                <h2 className="mb-4 text-sm font-semibold text-foreground">Desenlace de las llamadas por día</h2>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="dia" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="resueltas" name="Resueltas IA" stackId="a" fill="var(--chart-2)" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="transferidas" name="Escaladas" stackId="a" fill="var(--chart-3)" />
                      <Bar dataKey="abandonadas" name="Abandonadas" stackId="a" fill="var(--chart-5)" />
                      <Bar dataKey="noProcesadas" name="No procesadas (PBX/IVR)" stackId="a" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-foreground">Motivos de contacto</h2>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={motivosData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                        {motivosData.map((m, i) => (
                          <Cell key={m.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v}%`} contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            {/* Distribución horaria */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Distribución por hora del día</h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <defs>
                      <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="hora" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="llamadas" name="Llamadas" fill="url(#gH)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Detalle diario */}
            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <h2 className="border-b border-border px-6 py-4 text-sm font-semibold text-foreground">Detalle diario</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">Día</th>
                      <th className="px-4 py-3 text-right font-medium">Atendidas</th>
                      <th className="px-4 py-3 text-right font-medium">Resueltas IA</th>
                      <th className="px-4 py-3 text-right font-medium">Abandonadas</th>
                      <th className="px-4 py-3 text-right font-medium">Escaladas</th>
                      <th className="px-4 py-3 text-right font-medium">Transf. no resueltas</th>
                      <th className="px-6 py-3 text-right font-medium">No procesadas</th>
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
                        <td className="px-4 py-3 text-right text-foreground">{r.noResueltas}</td>
                        <td className="px-6 py-3 text-right text-foreground">{r.noProcesadas ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Detalle por llamada: datos de Redis */}
            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-sm font-semibold text-foreground">
                  Detalle por llamada · Redis
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Desglose de llamadas con sus desenlaces y motivos, obtenidas desde Redis en el rango seleccionado.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">Fecha</th>
                      <th className="px-4 py-3 text-left font-medium">ID</th>
                      <th className="px-4 py-3 text-left font-medium">Cliente</th>
                      <th className="px-4 py-3 text-left font-medium">Teléfono</th>
                      <th className="px-4 py-3 text-left font-medium">Especialista</th>
                      <th className="px-4 py-3 text-center font-medium">Score</th>
                      <th className="px-4 py-3 text-center font-medium">Transferencia</th>
                      <th className="px-4 py-3 text-center font-medium">Fallo PBX</th>
                      <th className="px-6 py-3 text-left font-medium">Motivo Fin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRedisCalls.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-6 text-center text-muted-foreground">
                          {redisLoading ? "Cargando llamadas…" : "Sin llamadas en el periodo seleccionado."}
                        </td>
                      </tr>
                    ) : (
                      filteredRedisCalls.map((c) => (
                        <tr key={c.callKey} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="whitespace-nowrap px-6 py-3 text-xs text-muted-foreground">
                            {c.date}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {c.callKey.replace("call:", "").slice(-8)}
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {c.caller_name || "—"}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-foreground">
                            {c.user_number || "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-foreground">
                            {c.specialist || "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex min-w-8 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                Number(c.score) >= 4
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : Number(c.score) >= 3
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {c.score}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-xs">
                            <span className={`inline-flex rounded-full px-2 py-0.5 font-medium ${
                                c.call_transfer && c.call_transfer !== "No"
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {c.call_transfer || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-xs">
                             <span className={`inline-flex rounded-full px-2 py-0.5 font-medium ${
                                c.pbx === "transfer failed"
                                  ? "bg-destructive/10 text-destructive"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {c.pbx || "—"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-3 text-xs text-muted-foreground">
                            {c.end_reason || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <p className="pb-6 text-center text-xs text-muted-foreground">
              {loading
                ? "Cargando datos de AIRP…"
                : isLive
                  ? `Datos en vivo desde AIRP · ${live!.totalCalls.toLocaleString("es-CO")} llamadas · duración promedio ${live!.avgDurationSec}s`
                  : `Sin datos de AIRP${live?.error ? ` (${live.error})` : ""}. Verifica la API Key o el rango de fechas.`}
            </p>
          </div>
        )}

        {/* ═══════════════ VENTAS ═══════════════ */}
        {activeTab === "ventas" && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <ShoppingBag className="h-7 w-7 text-primary/60" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Módulo de Ventas</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Este módulo está en construcción. Próximamente encontrarás aquí el análisis de
              oportunidades, conversiones y métricas del equipo comercial.
            </p>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Próximamente
            </span>
          </div>
        )}

        {/* ═══════════════ SERVICIO AL CLIENTE ═══════════════ */}
        {activeTab === "servicio" && (
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                  <Database className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Reporte de llamadas · Redis</h2>
                  <p className="text-xs text-muted-foreground">
                    {redisLoading
                      ? "Cargando desde el webhook…"
                      : redisError
                        ? `Error: ${redisError}`
                        : `${redisCalls.length} registros · ${filteredCalls.length} mostrados`}
                  </p>
                </div>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={redisSearch}
                  onChange={(e) => setRedisSearch(e.target.value)}
                  placeholder="Buscar por nombre, número, tipo…"
                  className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-xs text-foreground outline-none focus:border-violet-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium">Teléfono</th>
                    <th className="px-4 py-3 text-left font-medium">Tipo</th>
                    <th className="px-4 py-3 text-left font-medium">Especialista</th>
                    <th className="px-4 py-3 text-center font-medium">Score</th>
                    <th className="px-4 py-3 text-center font-medium">Transferencia</th>
                    <th className="px-4 py-3 text-center font-medium">Estado</th>
                    <th className="px-4 py-3 text-center font-medium">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {redisLoading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                          Consultando base de datos Redis…
                        </div>
                      </td>
                    </tr>
                  ) : filteredCalls.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                        {redisError ? `Error al cargar: ${redisError}` : "Sin registros encontrados."}
                      </td>
                    </tr>
                  ) : (
                    filteredCalls.map((c) => {
                      const isExpanded = expandedKey === c.callKey;
                      const hasDetail = !!(c.notes || c.request);
                      return (
                        <React.Fragment key={c.callKey}>
                          <tr
                            className={`border-t border-border transition-colors ${
                              isExpanded ? "bg-violet-500/5" : "hover:bg-muted/30"
                            }`}
                          >
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{c.date}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-foreground">{c.caller_name || "—"}</p>
                              <p className="text-xs text-muted-foreground">ID: {c.external_id || "—"}</p>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-foreground">{c.user_number || "—"}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600">
                                {c.type || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-foreground">{c.specialist || "—"}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex min-w-8 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                Number(c.score) >= 4
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : Number(c.score) >= 2
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "bg-muted text-muted-foreground"
                              }`}>
                                {c.score}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                c.call_transfer === "Yes" || c.call_transfer === "Si"
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {c.call_transfer}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                c.status === "Resolved"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : c.status === "Created"
                                    ? "bg-sky-500/10 text-sky-600"
                                    : "bg-muted text-muted-foreground"
                              }`}>
                                {c.status || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {hasDetail ? (
                                <button
                                  onClick={() => setExpandedKey(isExpanded ? null : c.callKey)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground transition hover:border-violet-500 hover:text-violet-500"
                                >
                                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                  {isExpanded ? "Cerrar" : "Ver"}
                                </button>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                          {isExpanded && hasDetail && (
                            <tr className="border-t border-violet-500/20 bg-violet-500/5">
                              <td colSpan={9} className="px-6 py-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {c.request && (
                                    <div>
                                      <p className="mb-1 text-xs font-semibold uppercase text-violet-500">Solicitud</p>
                                      <p className="text-xs text-foreground">{c.request}</p>
                                    </div>
                                  )}
                                  {c.notes && (
                                    <div>
                                      <p className="mb-1 text-xs font-semibold uppercase text-violet-500">Notas</p>
                                      <p className="text-xs text-foreground">{c.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
