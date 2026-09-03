import { useServerFn } from "@tanstack/react-start";
import {
  getRetellMetrics,
  type RetellMetrics,
} from "@/lib/retell.functions";
import {
  getRedisCallsVentas,
  getPurchasingCalls,
  getServiceCalls,
  type RedisCall,
  type PurchasingCall,
  type ServiceCall,
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
  Play,
  FileText,
  Info,
  Calendar as CalendarIcon,
  UserPlus,
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/* Dashboard                                                                */
/* ---------------------------------------------------------------------- */

type DayRow = {
  dia: string;
  resueltas: number;
  atendidas: number;
  abandonadas: number;
  noProcesadas: number;
  transferidas: number;
  noResueltas: number;
};

const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

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
  { id: "servicio", label: "Tickets", icon: HeadphonesIcon },
];


type VoiceAgent = {
  Agent: string;
  key: string;
  specialist: string[];
};

type HumanAgent = {
  agentKey: string;
  name: string;
  initials: string;
  status: string;
  roles: string[];
};

export default function AdminDashboard({

  onLogout,
  mode = "contact-center",
}: {
  onLogout: () => void;
  mode?: "contact-center" | "ventas";
}) {
  const [activeTab, setActiveTab] = useState<Tab>(mode === "ventas" ? "ventas" : "servicio");

  // ── Assignment State ──────────────────────────────────────────────────────────
  const [assigningCall, setAssigningCall] = useState<{ key: string; role: string } | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [voiceAgents, setVoiceAgents] = useState<VoiceAgent[]>([]);
  const [newTicketAgent, setNewTicketAgent] = useState<string>("");
  const [newTicketSpecialist, setNewTicketSpecialist] = useState<string>("");
  const [newTicketPhone, setNewTicketPhone] = useState("");
  const [newTicketName, setNewTicketName] = useState("");
  const [newTicketDoc, setNewTicketDoc] = useState("");
  const [newTicketAddress, setNewTicketAddress] = useState("");
  const [newTicketRequest, setNewTicketRequest] = useState("");
  const [newTicketNotes, setNewTicketNotes] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 10) val = val.slice(0, 10);
    let formatted = val;
    if (val.length > 6) {
      formatted = `${val.slice(0, 3)}-${val.slice(3, 6)}-${val.slice(6, 10)}`;
    } else if (val.length > 3) {
      formatted = `${val.slice(0, 3)}-${val.slice(3, 6)}`;
    }
    setNewTicketPhone(formatted);
  };
  
  const isTicketFormValid = newTicketAgent && newTicketSpecialist && newTicketPhone.length === 12 && newTicketName.trim() && newTicketDoc.trim() && newTicketRequest.trim();

  useEffect(() => {
    if (isCreatingTicket && voiceAgents.length === 0) {
      fetch("https://vmi3345591.contaboserver.net/webhook/voice-agent", { method: "POST" })
        .then(res => res.json())
        .then((data: VoiceAgent[]) => setVoiceAgents(data))
        .catch(err => console.error("Error loading voice agents:", err));
    }
  }, [isCreatingTicket, voiceAgents.length]);
  const [availableAgents, setAvailableAgents] = useState<HumanAgent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [assignedAgents, setAssignedAgents] = useState<Record<string, { initials: string, name: string }>>({});

  const [allAgents, setAllAgents] = useState<Record<string, HumanAgent>>({});
  useEffect(() => {
    fetch("https://vmi3345591.contaboserver.net/webhook/human-agent", { method: "POST" })
      .then(res => res.json())
      .then((data: HumanAgent[]) => {
        const map: Record<string, HumanAgent> = {};
        if(Array.isArray(data)) {
           data.forEach(a => map[a.agentKey] = a);
        }
        setAllAgents(map);
      })
      .catch(err => console.error("Error loading agents:", err));
  }, []);
  
  const currentTabs = useMemo(() => {
    if (mode === "ventas") {
      return TABS.filter((t) => t.id !== "servicio");
    }
    if (mode === "contact-center") {
      return TABS.filter((t) => t.id !== "ventas");
    }
    return TABS;
  }, [mode]);

  const [days, setDays] = useState(7);
  const [filterMode, setFilterMode] = useState<FilterMode>("preset");
  const [rangeStart, setRangeStart] = useState(""); // "YYYY-MM-DD"
  const [rangeEnd, setRangeEnd] = useState("");   // "YYYY-MM-DD"
  const [live, setLive] = useState<RetellMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchMetrics = useServerFn(getRetellMetrics);


  // ── Ventas ────────────────────────────────────────────────────────
  const [purchasingCalls, setPurchasingCalls] = useState<PurchasingCall[]>([]);
  const [purchasingLoading, setPurchasingLoading] = useState(true);
  const [purchasingError, setPurchasingError] = useState<string | null>(null);
  const fetchPurchasing = useServerFn(getPurchasingCalls);

  useEffect(() => {
    let cancelled = false;
    if (mode === "ventas" || activeTab === "ventas") {
        setPurchasingLoading(true);
        fetchPurchasing()
          .then((res) => {
            if (!cancelled) {
              setPurchasingCalls(res.calls || []);
              setPurchasingError(res.error ?? null);
            }
          })
          .catch((e) => { if (!cancelled) setPurchasingError(String(e)); })
          .finally(() => { if (!cancelled) setPurchasingLoading(false); });
    }
    return () => { cancelled = true; };
  }, [fetchPurchasing, mode, activeTab]);
  // ─────────────────────────────────────────────────────────────────────


  // ── Tickets (Servicio) ────────────────────────────────────────────────────────
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>([]);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const fetchService = useServerFn(getServiceCalls);

  useEffect(() => {
    let cancelled = false;
    if (mode === "contact-center" || activeTab === "servicio") {
        setServiceLoading(true);
        fetchService()
          .then((res) => {
            if (!cancelled) {
              setServiceCalls(res.calls || []);
              setServiceError(res.error ?? null);
            }
          })
          .catch((e) => { if (!cancelled) setServiceError(String(e)); })
          .finally(() => { if (!cancelled) setServiceLoading(false); });
    }
    return () => { cancelled = true; };
  }, [fetchService, mode, activeTab]);
  // ─────────────────────────────────────────────────────────────────────────────

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
              <h1 className="text-lg font-bold text-foreground">
                {mode === "ventas" 
                  ? "Monitoreo del asistente IA - Ventas" 
                  : "Monitoreo del asistente IA - Contact Center"}
              </h1>
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
            {currentTabs.map((tab) => {
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
                      <th className="px-4 py-3 text-left font-medium">Agente</th>
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
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                  <ShoppingBag className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Tickets de Venta</h2>
                  <p className="text-xs text-muted-foreground">
                    {purchasingLoading
                      ? "Cargando desde el webhook..."
                      : purchasingError
                        ? `Error: ${purchasingError}`
                        : `${purchasingCalls.length} registros`}
                  </p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Key</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Canal</th>
                    <th className="px-4 py-3 text-left font-medium">Inicio</th>
                    <th className="px-4 py-3 text-left font-medium">Especialista</th>
                    <th className="px-4 py-3 text-left font-medium">Teléfono</th>
                    <th className="px-4 py-3 text-left font-medium">ID Externo</th>
                    <th className="px-4 py-3 text-left font-medium">Zona</th>
                    <th className="px-4 py-3 text-left font-medium">Desconexión</th>
                  </tr>
                </thead>
                <tbody>
                  {purchasingLoading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                          Consultando llamadas de ventas...
                        </div>
                      </td>
                    </tr>
                  ) : purchasingCalls.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                        {purchasingError ? `Error al cargar: ${purchasingError}` : "Sin registros encontrados."}
                      </td>
                    </tr>
                  ) : (
                    purchasingCalls.map((c, i) => {
                      const isExpanded = expandedKey === (c.key || String(i));
                      const hasDetail = !!(c.call_summary || c.notes);
                      return (
                        <React.Fragment key={c.key || i}>
                          <tr className={`border-t border-border transition-colors ${isExpanded ? "bg-blue-500/5" : "hover:bg-muted/30"}`}>
                            <td className="px-4 py-3">
                              <p className="font-medium text-foreground max-w-[200px] truncate" title={c.key}>{c.key}</p>
                              <div className="flex items-center justify-center gap-3 mt-2">
                                {hasDetail && (
                                  <button onClick={() => setExpandedKey(isExpanded ? null : (c.key || String(i)))} className="text-blue-600 hover:text-blue-800" title="Ver resumen y notas">
                                    <FileText className="h-4 w-4" />
                                  </button>
                                )}
                                {c.url && (
                                  <>
                                    <a href={c.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800" title="Oír grabación">
                                      <Play className="h-4 w-4" />
                                    </a>
                                    <div className="flex items-center gap-1">
                                      <button 
                                        onClick={() => {
                                          const role = c.agent || "Ventas";
                                          setAssigningCall({ key: c.key!, role });
                                          setAgentsLoading(true);
                                          fetch("https://vmi3345591.contaboserver.net/webhook/human-agent", { method: "POST" })
                                            .then(res => res.json())
                                            .then((data: HumanAgent[]) => {
                                               setAvailableAgents(data.filter(a => a.roles.includes(role)));
                                            })
                                            .finally(() => setAgentsLoading(false));
                                        }} 
                                        className="text-orange-500 hover:text-orange-700" title="Asignar a"
                                      >
                                        <UserPlus className="h-4 w-4" />
                                      </button>
                                      {(() => {
                                        const currentAgent = assignedAgents[c.key!] || (c.assignedTo && allAgents[c.assignedTo] ? {
                                          initials: allAgents[c.assignedTo].initials,
                                          name: allAgents[c.assignedTo].name
                                        } : null);
                                        return currentAgent ? (
                                          <span className="ml-1 text-[10px] font-bold text-orange-700 bg-orange-100 rounded px-1.5 py-0.5" title={currentAgent.name}>
                                            {currentAgent.initials}
                                          </span>
                                        ) : null;
                                      })()}
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground">
                              <select
                                className="bg-background border border-border rounded px-2 py-1 text-xs"
                                defaultValue={c.status || "Nuevo"}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  if (confirm(`¿Estás seguro de que deseas cambiar el estado a ${newStatus}?`)) {
                                    fetch('https://vmi3345591.contaboserver.net/webhook/set-status', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ call_id: c.key, status: newStatus })
                                    }).then(res => {
                                      if (res.ok) window.location.reload();
                                      else alert('Error al cambiar el estado.');
                                    }).catch(() => alert('Error de conexión.'));
                                  } else {
                                    e.target.value = c.status || "Nuevo";
                                  }
                                }}
                              >
                                <option value="Nuevo">Nuevo</option>
                                <option value="En Progreso">En Progreso</option>
                                <option value="Solucionado">Solucionado</option>
                                <option value="Cancelado">Cancelado</option>
                              </select>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground">{c.channel || "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground">{c.start_timestamp || "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground">
                              <p className="font-medium">{c.agent || "—"}</p>
                              {c.specialist && <p className="text-muted-foreground">{c.specialist}</p>}
                            </td>
                            <td className="px-4 py-3 text-xs text-foreground">
                               <p className="font-medium">{c.phone || "—"}</p>
                               {c.caller_name && <p className="text-muted-foreground">{c.caller_name}</p>}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-foreground">{c.external_id || "—"}</td>
                            <td className="px-4 py-3 text-xs text-foreground">{c.zone || "—"}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{c.disconnection_reason || "—"}</td>
                          </tr>
                          {isExpanded && hasDetail && (
                            <tr className="border-t border-blue-500/20 bg-blue-500/5">
                              <td colSpan={9} className="px-6 py-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {c.call_summary && (
                                    <div>
                                      <p className="mb-1 text-xs font-semibold uppercase text-blue-600">Resumen de Llamada</p>
                                      <p className="text-xs text-foreground whitespace-pre-wrap">{decodeURIComponent(c.call_summary)}</p>
                                    </div>
                                  )}
                                  {c.notes !== undefined && (
                                    <div className="flex flex-col h-full">
                                      <div className="flex justify-between items-center mb-1">
                                          <p className="text-xs font-semibold uppercase text-blue-600">Notas</p>
                                      </div>
                                      <textarea 
                                        id={`notes-${c.key}`}
                                        className="w-full flex-grow text-xs text-foreground bg-background border border-border p-2 rounded resize-y min-h-[60px]" 
                                        defaultValue={decodeURIComponent(c.notes)}
                                      ></textarea>
                                      <div className="mt-2 flex justify-center">
                                        <button 
                                          className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded hover:bg-blue-700 transition-colors font-medium"
                                          onClick={() => {
                                            const newNotes = (document.getElementById(`notes-${c.key}`) as HTMLTextAreaElement).value;
                                            if(confirm("¿Deseas guardar las notas?")) {
                                              fetch('https://vmi3345591.contaboserver.net/webhook/call-set-notes', {
                                                  method: 'POST',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({ call_id: c.key, notes: newNotes })
                                              }).then(r => {
                                                  if(r.ok) alert("Notas guardadas correctamente");
                                                  else alert("Error al guardar notas");
                                              }).catch(()=>alert("Error al guardar notas"));
                                            }
                                          }}
                                        >
                                          Guardar
                                        </button>
                                      </div>
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

        {/* ═══════════════ SERVICIO AL CLIENTE ═══════════════ */}
        {activeTab === "servicio" && (
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
              <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                  <HeadphonesIcon className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Tickets de Servicio al Cliente</h2>
                  <p className="text-xs text-muted-foreground">
                    {serviceLoading
                      ? "Cargando desde el webhook..."
                      : serviceError
                        ? `Error: ${serviceError}`
                        : `${serviceCalls.length} registros`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreatingTicket(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Crear Ticket
              </button>
            </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Key</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Inicio</th>
                    <th className="px-4 py-3 text-left font-medium">Canal</th>
                    <th className="px-4 py-3 text-left font-medium">Agente</th>
                    <th className="px-4 py-3 text-left font-medium">Teléfono</th>
                    <th className="px-4 py-3 text-left font-medium">ID Externo</th>
                    <th className="px-4 py-3 text-left font-medium">Transferencia</th>
                    
                    <th className="px-4 py-3 text-left font-medium">Desconexión</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceLoading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                          Consultando llamadas de servicio...
                        </div>
                      </td>
                    </tr>
                  ) : serviceCalls.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                        {serviceError ? `Error al cargar: ${serviceError}` : "Sin registros encontrados."}
                      </td>
                    </tr>
                  ) : (
                    serviceCalls.map((c, i) => {
                      const isExpanded = expandedKey === (c.key || String(i) + "svc");
                      const hasDetail = !!(c.call_summary || c.notes);
                      return (
                        <React.Fragment key={c.key || i}>
                          <tr className={`border-t border-border transition-colors ${isExpanded ? "bg-blue-500/5" : "hover:bg-muted/30"}`}>
                            <td className="px-4 py-3">
                              <p className="font-medium text-foreground max-w-[200px] truncate" title={c.key}>{c.key}</p>
                              <div className="flex items-center justify-center gap-3 mt-2">
                                {hasDetail && (
                                  <button onClick={() => setExpandedKey(isExpanded ? null : (c.key || String(i) + "svc"))} className="text-blue-600 hover:text-blue-800" title="Ver resumen y notas">
                                    <FileText className="h-4 w-4" />
                                  </button>
                                )}
                                {c.url && (
                                  <>
                                    <a href={c.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800" title="Oír grabación">
                                      <Play className="h-4 w-4" />
                                    </a>
                                    <div className="flex items-center gap-1">
                                      <button 
                                        onClick={() => {
                                          const role = c.agent || "Ventas";
                                          setAssigningCall({ key: c.key!, role });
                                          setAgentsLoading(true);
                                          fetch("https://vmi3345591.contaboserver.net/webhook/human-agent", { method: "POST" })
                                            .then(res => res.json())
                                            .then((data: HumanAgent[]) => {
                                               setAvailableAgents(data.filter(a => a.roles.includes(role)));
                                            })
                                            .finally(() => setAgentsLoading(false));
                                        }} 
                                        className="text-orange-500 hover:text-orange-700" title="Asignar a"
                                      >
                                        <UserPlus className="h-4 w-4" />
                                      </button>
                                      {(() => {
                                        const currentAgent = assignedAgents[c.key!] || (c.assignedTo && allAgents[c.assignedTo] ? {
                                          initials: allAgents[c.assignedTo].initials,
                                          name: allAgents[c.assignedTo].name
                                        } : null);
                                        return currentAgent ? (
                                          <span className="ml-1 text-[10px] font-bold text-orange-700 bg-orange-100 rounded px-1.5 py-0.5" title={currentAgent.name}>
                                            {currentAgent.initials}
                                          </span>
                                        ) : null;
                                      })()}
                                    </div>
                                  </>
                                )}
                                </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground">
                              <select
                                className="bg-background border border-border rounded px-2 py-1 text-xs"
                                defaultValue={c.status || "Nuevo"}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  if (confirm(`¿Estás seguro de que deseas cambiar el estado a ${newStatus}?`)) {
                                    fetch('https://vmi3345591.contaboserver.net/webhook/set-status', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ call_id: c.key, status: newStatus })
                                    }).then(res => {
                                      if (res.ok) window.location.reload();
                                      else alert('Error al cambiar el estado.');
                                    }).catch(() => alert('Error de conexión.'));
                                  } else {
                                    e.target.value = c.status || "Nuevo";
                                  }
                                }}
                              >
                                <option value="Nuevo">Nuevo</option>
                                <option value="En Progreso">En Progreso</option>
                                <option value="Solucionado">Solucionado</option>
                                <option value="Cancelado">Cancelado</option>
                              </select>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground">{c.start_timestamp || "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground">{c.channel || "—"}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground">
                              <p className="font-medium">{c.agent || "—"}</p>
                              {c.specialist && <p className="text-muted-foreground">{c.specialist}</p>}
                            </td>
                            <td className="px-4 py-3 text-xs text-foreground">
                               <p className="font-medium">{c.phone || "—"}</p>
                               {c.caller_name && <p className="text-muted-foreground">{c.caller_name}</p>}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-foreground">{c.external_id || "—"}</td>
                            <td className="px-4 py-3 text-xs text-foreground">
                              {c.pbx === "Fallo" ? (
                                <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-700">
                                  {c.call_transfer === "Si" ? "Sí (Fallo PBX)" : "Fallo PBX"}
                                </span>
                              ) : c.call_transfer === "Si" ? (
                                <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700">
                                  Sí {c.pbx && c.pbx !== "Fallo" ? `(${c.pbx})` : ""}
                                </span>
                              ) : c.call_transfer === "No" ? (
                                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">No</span>
                              ) : "—"}
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{c.disconnection_reason || "—"}</td>
                          </tr>
                          {isExpanded && hasDetail && (
                            <tr className="border-t border-blue-500/20 bg-blue-500/5">
                              <td colSpan={9} className="px-6 py-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {c.call_summary && (
                                    <div>
                                      <p className="mb-1 text-xs font-semibold uppercase text-blue-600">Resumen de Llamada</p>
                                      <p className="text-xs text-foreground whitespace-pre-wrap">{decodeURIComponent(c.call_summary)}</p>
                                    </div>
                                  )}
                                  {c.notes !== undefined && (
                                    <div className="flex flex-col h-full">
                                      <div className="flex justify-between items-center mb-1">
                                          <p className="text-xs font-semibold uppercase text-blue-600">Notas</p>
                                      </div>
                                      <textarea 
                                        id={`notes-${c.key}`}
                                        className="w-full flex-grow text-xs text-foreground bg-background border border-border p-2 rounded resize-y min-h-[60px]" 
                                        defaultValue={decodeURIComponent(c.notes)}
                                      ></textarea>
                                      <div className="mt-2 flex justify-center">
                                        <button 
                                          className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded hover:bg-blue-700 transition-colors font-medium"
                                          onClick={() => {
                                            const newNotes = (document.getElementById(`notes-${c.key}`) as HTMLTextAreaElement).value;
                                            if(confirm("¿Deseas guardar las notas?")) {
                                              fetch('https://vmi3345591.contaboserver.net/webhook/call-set-notes', {
                                                  method: 'POST',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({ call_id: c.key, notes: newNotes })
                                              }).then(r => {
                                                  if(r.ok) alert("Notas guardadas correctamente");
                                                  else alert("Error al guardar notas");
                                              }).catch(()=>alert("Error al guardar notas"));
                                            }
                                          }}
                                        >
                                          Guardar
                                        </button>
                                      </div>
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


      {assigningCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Asignar agente ({assigningCall.role})
            </h3>
            {agentsLoading ? (
              <div className="flex justify-center py-8 text-muted-foreground">Cargando agentes...</div>
            ) : availableAgents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay agentes humanos con el rol: {assigningCall.role}</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                {availableAgents.map((a) => (
                  <button
                    key={a.agentKey}
                    onClick={() => {
                      fetch("https://vmi3345591.contaboserver.net/webhook/call-set-assignedTo", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ call_id: assigningCall.key, assignedTo: a.agentKey })
                      }).then(res => {
                        if (res.ok) {
                          setAssignedAgents(prev => ({ ...prev, [assigningCall.key]: { initials: a.initials, name: a.name } }));
                          setAssigningCall(null);
                          alert("Agente asignado exitosamente");
                        } else {
                          alert("Error al asignar agente");
                        }
                      }).catch(() => alert("Error de red al asignar"));
                    }}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                        {a.initials}
                      </div>
                      <div className="text-sm font-medium text-foreground">{a.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setAssigningCall(null)}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    
      {isCreatingTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-background p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Crear Nuevo Ticket
            </h3>
            <div className="flex flex-col gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Agente *</label>
                  <select 
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    value={newTicketAgent}
                    onChange={e => {
                      setNewTicketAgent(e.target.value);
                      setNewTicketSpecialist("");
                    }}
                  >
                    <option value="">Seleccione un agente...</option>
                    {voiceAgents.map(a => (
                      <option key={a.key} value={a.Agent}>{a.Agent}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Especialista *</label>
                  <select 
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    value={newTicketSpecialist}
                    onChange={e => setNewTicketSpecialist(e.target.value)}
                    disabled={!newTicketAgent}
                  >
                    <option value="">Seleccione un especialista...</option>
                    {voiceAgents.find(a => a.Agent === newTicketAgent)?.specialist.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Teléfono *</label>
                  <input
                    type="text"
                    placeholder="###-###-####"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    value={newTicketPhone}
                    onChange={handlePhoneChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Documento de Identidad *</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    value={newTicketDoc}
                    onChange={e => setNewTicketDoc(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  value={newTicketName}
                  onChange={e => setNewTicketName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Dirección</label>
                <input
                  type="text"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  value={newTicketAddress}
                  onChange={e => setNewTicketAddress(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Requerimiento *</label>
                <textarea
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground min-h-[80px] resize-y"
                  value={newTicketRequest}
                  onChange={e => setNewTicketRequest(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notas</label>
                <textarea
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground min-h-[60px] resize-y"
                  value={newTicketNotes}
                  onChange={e => setNewTicketNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsCreatingTicket(false)}
                className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80"
              >
                Cancelar
              </button>
              <button
                disabled={!isTicketFormValid}
                onClick={() => {
                  alert("Formulario validado correctamente. En espera del webhook final.");
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  isTicketFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                }`}
              >
                Guardar Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </main>

  );
}
