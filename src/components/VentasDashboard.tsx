import { useServerFn } from "@tanstack/react-start";
import {
  getRetellMetrics,
  type RetellMetrics,
} from "@/lib/retell.functions";
import {
  getRedisCallsVentas,
  getPurchasingCalls,
  getServiceCalls,
  getVentasHistoricoCalls,
  getVentasEnProgresoCalls,
  type RedisCall,
  type PurchasingCall,
  type ServiceCall,
} from "@/lib/redis.functions";

import React, { useEffect, useMemo, useState } from "react";
import { DateTime } from 'luxon';

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
  Clock,
  Archive,
} from "lucide-react";

const formatDateLocal = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

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

type Tab = "general" | "ventas" | "servicio" | "en_progreso" | "historico";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "Dashboard", icon: LayoutDashboard },
  { id: "ventas", label: "Por Asignar", icon: ShoppingBag },
  { id: "servicio", label: "Por Asignar", icon: UserPlus },
  { id: "en_progreso", label: "En Progreso", icon: Clock },
  { id: "historico", label: "Historico", icon: Archive },
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

export default function VentasDashboard({

  onLogout,
  mode = "ventas",
}: {
  onLogout: () => void;
  mode?: "contact-center" | "ventas";
}) {
  const [activeTab, setActiveTab] = useState<Tab>("ventas");

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
  const [newTicketId, setNewTicketId] = useState<string>("");

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
  
  const isTicketFormValid = newTicketAgent && newTicketSpecialist && newTicketRequest.trim();

  useEffect(() => {
    if (isCreatingTicket && voiceAgents.length === 0) {
      fetch("https://vmi3345591.contaboserver.net/webhook/voice-agent", { method: "POST" })
        .then(res => res.json())
        .then((data: VoiceAgent[]) => setVoiceAgents(data))
        .catch(err => console.error("Error loading voice agents:", err));
    }
    if (isCreatingTicket && !newTicketId) {
      fetch("https://vmi3345591.contaboserver.net/webhook/get-call-id-manually", { method: "POST" })
        .then(res => res.json())
        .then(data => {
          const num = data["ticket-manual"] || Object.values(data)[0];
          setNewTicketId(`ticket-manual-${num}`);
        })
        .catch(err => console.error(err));
    }
    if (!isCreatingTicket && newTicketId) {
      setNewTicketId("");
    }
  }, [isCreatingTicket, voiceAgents.length, newTicketId]);
  const [availableAgents, setAvailableAgents] = useState<HumanAgent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [assignedAgents, setAssignedAgents] = useState<Record<string, { initials: string, name: string, agentKey?: string }>>({});

  const [allAgents, setAllAgents] = useState<Record<string, HumanAgent>>({});
  useEffect(() => {
    fetch("https://vmi3345591.contaboserver.net/webhook/get-human-agent", { method: "POST" })
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
    return TABS.filter((t) => t.id !== "servicio");
  }, []);

  const [days, setDays] = useState(1);
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

  const filteredServiceCalls = useMemo(() => {
    if (activeTab === "servicio") return serviceCalls;
    
    const now = new Date();
    return serviceCalls.filter((c) => {
      if (!c.start_timestamp) return true;
      
      // Parse DD/MM/YYYY HH:mm:ss or similar. Assuming standard parsable format or ISO.
      // If the webhook returns DD/MM/YYYY, this might be tricky. Let's assume standard ISO or YYYY-MM-DD for now.
      const callDate = new Date(c.start_timestamp);
      if (isNaN(callDate.getTime())) return true;

      if (filterMode === "preset") {
        const diffTime = now.getTime() - callDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= days;
      } else {
        if (!rangeStart || !rangeEnd) return true;
        const start = new Date(rangeStart + "T00:00:00");
        const end = new Date(rangeEnd + "T23:59:59");
        return callDate >= start && callDate <= end;
      }
    });
  }, [serviceCalls, activeTab, filterMode, days, rangeStart, rangeEnd]);


  useEffect(() => {
    let cancelled = false;
    if (true) {
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



  // ── En Progreso Calls ──────────────────────────────────────────────────────
  const [enProgresoCalls, setEnProgresoCalls] = useState<ServiceCall[]>([]);
  const [enProgresoLoading, setEnProgresoLoading] = useState(false);
  const [enProgresoError, setEnProgresoError] = useState<string | null>(null);
  const [refreshProgreso, setRefreshProgreso] = useState(0);

  const [enProgresoPage, setEnProgresoPage] = useState(1);
  const [enProgresoPageSize, setEnProgresoPageSize] = useState(10);
  const [enProgresoSortField, setEnProgresoSortField] = useState<keyof ServiceCall | "">("start_timestamp");
  const [enProgresoSortDirection, setEnProgresoSortDirection] = useState<"asc" | "desc">("asc");

  const paginatedEnProgresoCalls = useMemo(() => {
    let calls = [...enProgresoCalls];
    if (enProgresoSortField) {
      calls.sort((a, b) => {
        let valA: any = a[enProgresoSortField] || "";
        let valB: any = b[enProgresoSortField] || "";
        
        // Manejar correctamente las fechas
        if (enProgresoSortField === "start_timestamp" || enProgresoSortField === "status_timestamp") {
          valA = valA ? new Date(valA.replace(' ', 'T')).getTime() : 0;
          valB = valB ? new Date(valB.replace(' ', 'T')).getTime() : 0;
          if (isNaN(valA)) valA = 0;
          if (isNaN(valB)) valB = 0;
        } else {
          if (typeof valA === "string") valA = valA.toLowerCase();
          if (typeof valB === "string") valB = valB.toLowerCase();
        }

        if (valA < valB) return enProgresoSortDirection === "asc" ? -1 : 1;
        if (valA > valB) return enProgresoSortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    const startIdx = (enProgresoPage - 1) * enProgresoPageSize;
    return calls.slice(startIdx, startIdx + enProgresoPageSize);
  }, [enProgresoCalls, enProgresoPage, enProgresoPageSize, enProgresoSortField, enProgresoSortDirection]);
  
  const enProgresoTotalPages = Math.ceil(enProgresoCalls.length / enProgresoPageSize);

  const fetchEnProgreso = useServerFn(getVentasEnProgresoCalls);

  useEffect(() => {
    let cancelled = false;
    if (activeTab === "en_progreso") {
        setEnProgresoLoading(true);
        let beginDate = new Date();
        let endDate = new Date();
        if (filterMode === "preset") {
            beginDate.setDate(beginDate.getDate() - (days - 1));
        } else {
            if (rangeStart) beginDate = new Date(rangeStart + "T00:00:00");
            if (rangeEnd) endDate = new Date(rangeEnd + "T23:59:59");
        }
        
        const begin = formatDateLocal(beginDate);
        const end = formatDateLocal(endDate);

        fetchEnProgreso({ data: { begin, end } })
          .then((res) => {
            if (!cancelled) {
              setEnProgresoCalls(res.calls || []);
              setEnProgresoError(res.error ?? null);
            }
          })
          .catch((e) => { if (!cancelled) setEnProgresoError(String(e)); })
          .finally(() => { if (!cancelled) setEnProgresoLoading(false); });
    }
    return () => { cancelled = true; };
  }, [fetchEnProgreso, activeTab, days, filterMode, rangeStart, rangeEnd, refreshProgreso]);

  // ── Historico Calls ────────────────────────────────────────────────────────
  const [historicoCalls, setHistoricoCalls] = useState<ServiceCall[]>([]);
  const [historicoLoading, setHistoricoLoading] = useState(false);
  const [historicoError, setHistoricoError] = useState<string | null>(null);
  
  const [historicoPage, setHistoricoPage] = useState(1);
  const [historicoPageSize, setHistoricoPageSize] = useState(10);
  const [historicoSortField, setHistoricoSortField] = useState<keyof ServiceCall | "">("start_timestamp");
  const [historicoSortDirection, setHistoricoSortDirection] = useState<"asc" | "desc">("desc");

  const paginatedHistoricoCalls = useMemo(() => {
    let calls = [...historicoCalls];
    if (historicoSortField) {
      calls.sort((a, b) => {
        let valA: any = a[historicoSortField] || "";
        let valB: any = b[historicoSortField] || "";
        
        // Manejar correctamente las fechas
        if (historicoSortField === "start_timestamp" || historicoSortField === "status_timestamp") {
          valA = valA ? new Date(valA.replace(' ', 'T')).getTime() : 0;
          valB = valB ? new Date(valB.replace(' ', 'T')).getTime() : 0;
          if (isNaN(valA)) valA = 0;
          if (isNaN(valB)) valB = 0;
        } else {
          if (typeof valA === "string") valA = valA.toLowerCase();
          if (typeof valB === "string") valB = valB.toLowerCase();
        }

        if (valA < valB) return historicoSortDirection === "asc" ? -1 : 1;
        if (valA > valB) return historicoSortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    const startIdx = (historicoPage - 1) * historicoPageSize;
    return calls.slice(startIdx, startIdx + historicoPageSize);
  }, [historicoCalls, historicoPage, historicoPageSize, historicoSortField, historicoSortDirection]);
  
  const historicoTotalPages = Math.ceil(historicoCalls.length / historicoPageSize);

  const fetchHistorico = useServerFn(getVentasHistoricoCalls);

  useEffect(() => {
    let cancelled = false;
    if (activeTab === "historico") {
        setHistoricoLoading(true);
        let beginDate = new Date();
        let endDate = new Date();
        if (filterMode === "preset") {
            beginDate.setDate(beginDate.getDate() - (days - 1)); // - days or -(days-1)? Let's use exactly days as difference. Or for 1 day, it's today. For 7 days it's today - 7
            // actually if "hoy", begin and end are the same
        } else {
            if (rangeStart) beginDate = new Date(rangeStart + "T00:00:00");
            if (rangeEnd) endDate = new Date(rangeEnd + "T23:59:59");
        }
        
        const begin = formatDateLocal(beginDate);
        const end = formatDateLocal(endDate);

        fetchHistorico({ data: { begin, end } })
          .then((res) => {
            if (!cancelled) {
              setHistoricoCalls(res.calls || []);
              setHistoricoError(res.error ?? null);
            }
          })
          .catch((e) => { if (!cancelled) setHistoricoError(String(e)); })
          .finally(() => { if (!cancelled) setHistoricoLoading(false); });
    }
    return () => { cancelled = true; };
  }, [fetchHistorico, activeTab, days, filterMode, rangeStart, rangeEnd]);

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
      const diaStr = formatDateLocal(d);
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

  const todayLocalStr = useMemo(() => formatDateLocal(new Date()), []);

  const dateDisplay = useMemo(() => {
    if (filterMode === "preset") {
      const today = new Date();
      const past = new Date();
      past.setDate(today.getDate() - (days - 1));
      const rangeLabel = RANGES.find(r => r.days === days)?.label || "Rango";
      if (days === 1) {
        return `${rangeLabel}: ${formatDateLocal(today)}`;
      } else {
        return `${rangeLabel}: ${formatDateLocal(past)} a ${formatDateLocal(today)}`;
      }
    } else {
      if (rangeStart && rangeEnd) {
        return `Rango: ${rangeStart} a ${rangeEnd}`;
      }
      return "Rango: Personalizado";
    }
  }, [filterMode, days, rangeStart, rangeEnd]);

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
                Ventas - Tickets
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(activeTab === "general" || activeTab === "en_progreso" || activeTab === "historico") && (
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
                
                <div className="flex rounded-lg border border-transparent bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                  {dateDisplay}
                </div>

                {/* Date range inputs — visible only in range mode */}
                {filterMode === "range" && (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={rangeStart}
                      max={rangeEnd || todayLocalStr}
                      onChange={(e) => setRangeStart(e.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                    />
                    <span className="text-xs text-muted-foreground">→</span>
                    <input
                      type="date"
                      value={rangeEnd}
                      min={rangeStart || undefined}
                      max={todayLocalStr}
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
                  <h2 className="text-sm font-semibold text-foreground">Por Asignar</h2>
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
                                {(c.recording_url || c.url) && (
                                  <a href={c.recording_url || c.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800" title="Oír grabación">
                                    <Play className="h-4 w-4" />
                                  </a>
                                )}
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => {
                                      const role = c.agent || "Ventas";
                                      setAssigningCall({ key: c.key!, role });
                                      setAgentsLoading(true);
                                      fetch("https://vmi3345591.contaboserver.net/webhook/get-human-agent", { method: "POST" })
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
                                    }).then(async res => {
                                      if (res.ok) window.location.reload();
                                      else {
                                        const errorText = await res.text();
                                        alert(`Error al cambiar el estado: ${errorText}`);
                                      }
                                    }).catch((err) => alert(`Error de conexión: ${err.message}`));
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
                                              }).then(async r => {
                                                  if(r.ok) alert("Notas guardadas correctamente");
                                                  else {
                                                      const errorText = await r.text();
                                                      alert(`Error al guardar notas: ${errorText}`);
                                                  }
                                              }).catch(err => alert(`Error al guardar notas: ${err.message}`));
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
                  <UserPlus className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Por Asignar</h2>
                  <p className="text-xs text-muted-foreground">
                    {serviceLoading
                      ? "Cargando desde el webhook..."
                      : serviceError
                        ? `Error: ${serviceError}`
                        : `${filteredServiceCalls.length} Tickets`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setNewTicketAgent("");
                  setNewTicketSpecialist("");
                  setNewTicketPhone("");
                  setNewTicketName("");
                  setNewTicketDoc("");
                  setNewTicketAddress("");
                  setNewTicketRequest("");
                  setNewTicketNotes("");
                  setAssignedAgents(prev => {
                    const next = { ...prev };
                    delete next["new_ticket"];
                    return next;
                  });
                  setIsCreatingTicket(true);
                }}
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
                  ) : filteredServiceCalls.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                        {serviceError ? `Error al cargar: ${serviceError}` : "Sin registros encontrados."}
                      </td>
                    </tr>
                  ) : (
                    filteredServiceCalls.map((c, i) => {
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
                                {(c.recording_url || c.url) && (
                                  <a href={c.recording_url || c.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800" title="Oír grabación">
                                    <Play className="h-4 w-4" />
                                  </a>
                                )}
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => {
                                      const role = c.agent || "Ventas";
                                      setAssigningCall({ key: c.key!, role });
                                      setAgentsLoading(true);
                                      fetch("https://vmi3345591.contaboserver.net/webhook/get-human-agent", { method: "POST" })
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
                                </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground">
                              <div className="flex flex-col items-center">
                                <button
                                  className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded px-3 py-1 text-xs font-medium transition-colors"
                                  onClick={() => {
                                    if (confirm('¿Estás seguro de que deseas cancelar este ticket?')) {
                                      fetch('https://vmi3345591.contaboserver.net/webhook/set-status', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ call_id: c.key, status: "Cancelado" })
                                      }).then(async res => {
                                        if (res.ok) window.location.reload();
                                        else {
                                          const errorText = await res.text();
                                          alert(`Error al cancelar: ${errorText}`);
                                        }
                                      }).catch((err) => alert(`Error de conexión: ${err.message}`));
                                    }
                                  }}
                                >
                                  Cancelar
                                </button>
                                {(() => {
                                  if (!c.start_timestamp) return null;
                                  
                                  const startStr = c.start_timestamp.replace(' ', 'T');
                                  const start = new Date(startStr);
                                  if (isNaN(start.getTime())) return null;

                                  const nowBogotaStr = DateTime.now().setZone('America/Bogota').toFormat('yyyy-MM-dd HH:mm:ss');
                                  const now = new Date(nowBogotaStr.replace(' ', 'T'));
                                  
                                  const diffMs = now.getTime() - start.getTime();
                                  if (diffMs < 0) return null;
                                  const diffHoursTotal = Math.floor(diffMs / (1000 * 60 * 60));
                                  const diffDays = Math.floor(diffHoursTotal / 24);
                                  const diffHours = diffHoursTotal % 24;
                                  let timeStr = "";
                                  if (diffDays > 0) timeStr += `${diffDays} día(s) `;
                                  timeStr += `${diffHours} hora(s)`;
                                  return (
                                    <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-muted-foreground font-medium">
                                      <Clock className="h-3 w-3" />
                                      <span>{timeStr}</span>
                                    </div>
                                  );
                                })()}
                              </div>
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
                                              }).then(async r => {
                                                  if(r.ok) alert("Notas guardadas correctamente");
                                                  else {
                                                      const errorText = await r.text();
                                                      alert(`Error al guardar notas: ${errorText}`);
                                                  }
                                              }).catch((err) => alert(`Error al guardar notas: ${err.message}`));
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
        {activeTab === "en_progreso" && (
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
              <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">En Progreso</h2>
                  <p className="text-xs text-muted-foreground">
                    {enProgresoLoading
                      ? "Cargando desde el webhook..."
                      : enProgresoError
                        ? `Error: ${enProgresoError}`
                        : `${enProgresoCalls.length} Ticket(s)`}
                  </p>
                </div>
              </div>
              {!enProgresoLoading && !enProgresoError && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Mostrar:</span>
                  <select
                    className="border border-border rounded px-2 py-1 text-xs"
                    value={enProgresoPageSize}
                    onChange={(e) => {
                      setEnProgresoPageSize(Number(e.target.value));
                      setEnProgresoPage(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    {[
                      { label: "Key", field: "key" },
                      { label: "", field: "status" },
                      { label: "Inicio", field: "start_timestamp" },
                      { label: "Canal", field: "channel" },
                      { label: "Agente", field: "agent" },
                      { label: "Teléfono", field: "phone" },
                      { label: "ID Externo", field: "external_id" },
                      { label: "Transferencia", field: "call_transfer" },
                      { label: "Desconexión", field: "disconnection_reason" }
                    ].map((col) => {
                      const isSortable = col.field !== "key" && col.field !== "status";
                      return (
                        <th
                          key={col.field}
                          className={`px-4 py-3 text-left font-medium ${isSortable ? "cursor-pointer hover:bg-muted/80 select-none" : ""}`}
                          onClick={() => {
                            if (!isSortable) return;
                            if (enProgresoSortField === col.field) {
                              setEnProgresoSortDirection(enProgresoSortDirection === "asc" ? "desc" : "asc");
                            } else {
                              setEnProgresoSortField(col.field as any);
                              setEnProgresoSortDirection("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-1">
                            {col.label}
                            {isSortable && enProgresoSortField === col.field && (
                              <span className="text-[10px]">
                                {enProgresoSortDirection === "asc" ? "▲" : "▼"}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {enProgresoLoading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                          Consultando llamadas de servicio...
                        </div>
                      </td>
                    </tr>
                  ) : enProgresoCalls.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                        {enProgresoError ? `Error al cargar: ${enProgresoError}` : "Sin registros encontrados."}
                      </td>
                    </tr>
                  ) : (
                    paginatedEnProgresoCalls.map((c, i) => {
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
                                {(c.recording_url || c.url) && (
                                  <a href={c.recording_url || c.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800" title="Oír grabación">
                                    <Play className="h-4 w-4" />
                                  </a>
                                )}
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => {
                                      const role = c.agent || "Ventas";
                                      setAssigningCall({ key: c.key!, role });
                                      setAgentsLoading(true);
                                      fetch("https://vmi3345591.contaboserver.net/webhook/get-human-agent", { method: "POST" })
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
                                </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground">
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex gap-2">
                                  <button
                                    className="rounded px-2 py-1 text-[10px] font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                                    onClick={() => {
                                      const newStatus = "Solucionado";
                                      if (confirm(`¿Estás seguro de que deseas cambiar el estado a ${newStatus}?`)) {
                                        fetch('https://vmi3345591.contaboserver.net/webhook/set-status', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ call_id: c.key, status: newStatus })
                                        }).then(async res => {
                                          if (res.ok) {
                                            setRefreshProgreso(p => p + 1);
                                          } else {
                                            const errorText = await res.text();
                                            alert(`Error al cambiar el estado: ${errorText}`);
                                          }
                                        }).catch((err) => alert(`Error de conexión: ${err.message}`));
                                      }
                                    }}
                                  >
                                    Solucionado
                                  </button>
                                  <button
                                    className="rounded px-2 py-1 text-[10px] font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                                    onClick={() => {
                                      const newStatus = "Cancelado";
                                      if (confirm(`¿Estás seguro de que deseas cambiar el estado a ${newStatus}?`)) {
                                        fetch('https://vmi3345591.contaboserver.net/webhook/set-status', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ call_id: c.key, status: newStatus })
                                        }).then(async res => {
                                          if (res.ok) {
                                            setRefreshProgreso(p => p + 1);
                                          } else {
                                            const errorText = await res.text();
                                            alert(`Error al cambiar el estado: ${errorText}`);
                                          }
                                        }).catch((err) => alert(`Error de conexión: ${err.message}`));
                                      }
                                    }}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                                {(() => {
                                  if (!c.start_timestamp) return null;
                                  
                                  const startStr = c.start_timestamp.replace(' ', 'T');
                                  const start = new Date(startStr);
                                  if (isNaN(start.getTime())) return null;

                                  const nowBogotaStr = DateTime.now().setZone('America/Bogota').toFormat('yyyy-MM-dd HH:mm:ss');
                                  const now = new Date(nowBogotaStr.replace(' ', 'T'));
                                  
                                  const diffMs = now.getTime() - start.getTime();
                                  if (diffMs < 0) return null;
                                  const diffHoursTotal = Math.floor(diffMs / (1000 * 60 * 60));
                                  const diffDays = Math.floor(diffHoursTotal / 24);
                                  const diffHours = diffHoursTotal % 24;
                                  let timeStr = "";
                                  if (diffDays > 0) timeStr += `${diffDays} día(s) `;
                                  timeStr += `${diffHours} hora(s)`;
                                  return (
                                    <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground font-medium">
                                      <Clock className="h-3 w-3" />
                                      <span>{timeStr}</span>
                                    </div>
                                  );
                                })()}
                              </div>
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
                                              }).then(async r => {
                                                  if(r.ok) alert("Notas guardadas correctamente");
                                                  else {
                                                      const errorText = await r.text();
                                                      alert(`Error al guardar notas: ${errorText}`);
                                                  }
                                              }).catch((err) => alert(`Error al guardar notas: ${err.message}`));
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
            {!enProgresoLoading && enProgresoCalls.length > 0 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Página {enProgresoPage} de {enProgresoTotalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={enProgresoPage === 1}
                    onClick={() => setEnProgresoPage(p => Math.max(1, p - 1))}
                  >
                    Anterior
                  </button>
                  <button
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={enProgresoPage === enProgresoTotalPages}
                    onClick={() => setEnProgresoPage(p => Math.min(enProgresoTotalPages, p + 1))}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ═══════════════ SERVICIO AL CLIENTE ═══════════════ */}
        {activeTab === "historico" && (/* Historico Block */
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
              <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                  <Archive className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Historial</h2>
                  <p className="text-xs text-muted-foreground">
                    {historicoLoading
                      ? "Cargando desde el webhook..."
                      : historicoError
                        ? `Error: ${historicoError}`
                        : `${historicoCalls.length} Tickets`}
                  </p>
                </div>
              </div>
              {!historicoLoading && !historicoError && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Mostrar:</span>
                  <select
                    className="border border-border rounded px-2 py-1 text-xs"
                    value={historicoPageSize}
                    onChange={(e) => {
                      setHistoricoPageSize(Number(e.target.value));
                      setHistoricoPage(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    {[
                      { label: "Key", field: "key" },
                      { label: "Status", field: "status" },
                      { label: "Inicio", field: "start_timestamp" },
                      { label: "Canal", field: "channel" },
                      { label: "Agente", field: "agent" },
                      { label: "Teléfono", field: "phone" },
                      { label: "ID Externo", field: "external_id" },
                      { label: "Transferencia", field: "call_transfer" },
                      { label: "Desconexión", field: "disconnection_reason" }
                    ].map((col) => {
                      const isSortable = col.field !== "key";
                      return (
                        <th
                          key={col.field}
                          className={`px-4 py-3 text-left font-medium ${isSortable ? "cursor-pointer hover:bg-muted/80 select-none" : ""}`}
                          onClick={() => {
                            if (!isSortable) return;
                            if (historicoSortField === col.field) {
                              setHistoricoSortDirection(historicoSortDirection === "asc" ? "desc" : "asc");
                            } else {
                              setHistoricoSortField(col.field as any);
                              setHistoricoSortDirection("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-1">
                            {col.label}
                            {isSortable && historicoSortField === col.field && (
                              <span className="text-[10px]">
                                {historicoSortDirection === "asc" ? "▲" : "▼"}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {historicoLoading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                          Consultando llamadas de servicio...
                        </div>
                      </td>
                    </tr>
                  ) : historicoCalls.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                        {historicoError ? `Error al cargar: ${historicoError}` : "Sin registros encontrados."}
                      </td>
                    </tr>
                  ) : (
                    paginatedHistoricoCalls.map((c, i) => {
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
                                {(c.recording_url || c.url) && (
                                  <a href={c.recording_url || c.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800" title="Oír grabación">
                                    <Play className="h-4 w-4" />
                                  </a>
                                )}
                                <div className="flex items-center gap-1">
                                  <div className="text-orange-500" title="Asignar a">
                                    <UserPlus className="h-4 w-4" />
                                  </div>
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
                                </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs">
                              {(() => {
                                const status = c.status || "Nuevo";
                                let bg = "bg-muted";
                                let text = "text-muted-foreground";
                                if (status === "Solucionado") {
                                  bg = "bg-green-100";
                                  text = "text-green-800";
                                } else if (status === "En Progreso") {
                                  bg = "bg-yellow-100";
                                  text = "text-yellow-800";
                                } else if (status === "Nuevo") {
                                  bg = "bg-blue-100";
                                  text = "text-blue-800";
                                } else if (status === "Cancelado") {
                                  bg = "bg-red-100";
                                  text = "text-red-800";
                                }

                                let timeElement = null;
                                if (c.start_timestamp) {
                                  const startStr = c.start_timestamp.replace(' ', 'T');
                                  const start = new Date(startStr);
                                  if (!isNaN(start.getTime())) {
                                    let end: Date | null = null;
                                    if (status === "Cancelado" || status === "Solucionado") {
                                      if (c.status_timestamp) {
                                        end = new Date(c.status_timestamp.replace(' ', 'T'));
                                      }
                                    } else {
                                      const nowBogotaStr = DateTime.now().setZone('America/Bogota').toFormat('yyyy-MM-dd HH:mm:ss');
                                      end = new Date(nowBogotaStr.replace(' ', 'T'));
                                    }
                                    
                                    if (end && !isNaN(end.getTime())) {
                                      const diffMs = end.getTime() - start.getTime();
                                      if (diffMs >= 0) {
                                        const diffHoursTotal = Math.floor(diffMs / (1000 * 60 * 60));
                                        const diffDays = Math.floor(diffHoursTotal / 24);
                                        const diffHours = diffHoursTotal % 24;
                                        let timeStr = "";
                                        if (diffDays > 0) timeStr += `${diffDays} día(s) `;
                                        timeStr += `${diffHours} hora(s)`;
                                        timeElement = (
                                          <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-muted-foreground font-medium">
                                            <Clock className="h-3 w-3" />
                                            <span>{timeStr}</span>
                                          </div>
                                        );
                                      }
                                    }
                                  }
                                }

                                return (
                                  <div className="flex flex-col items-center">
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${bg} ${text}`}>
                                      {status}
                                    </span>
                                    {timeElement}
                                  </div>
                                );
                              })()}
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
                                              }).then(async r => {
                                                  if(r.ok) alert("Notas guardadas correctamente");
                                                  else {
                                                      const errorText = await r.text();
                                                      alert(`Error al guardar notas: ${errorText}`);
                                                  }
                                              }).catch((err) => alert(`Error al guardar notas: ${err.message}`));
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
            {!historicoLoading && historicoCalls.length > 0 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-3">
                <div className="text-xs text-muted-foreground">
                  Mostrando {((historicoPage - 1) * historicoPageSize) + 1} a {Math.min(historicoPage * historicoPageSize, historicoCalls.length)} de {historicoCalls.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={historicoPage === 1}
                    onClick={() => setHistoricoPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded border border-border text-xs font-medium disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-xs font-medium px-2">
                    {historicoPage} / {historicoTotalPages}
                  </span>
                  <button
                    disabled={historicoPage === historicoTotalPages}
                    onClick={() => setHistoricoPage(p => Math.min(historicoTotalPages, p + 1))}
                    className="px-3 py-1 rounded border border-border text-xs font-medium disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

      </div>


      {assigningCall && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
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
                      if (assigningCall.key === "new_ticket") {
                        setAssignedAgents(prev => ({ ...prev, [assigningCall.key]: { initials: a.initials, name: a.name, agentKey: a.agentKey } }));
                        setAssigningCall(null);
                        return;
                      }
                      fetch("https://vmi3345591.contaboserver.net/webhook/call-set-assignedTo", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ call_id: assigningCall.key, assignedTo: a.agentKey })
                      }).then(async res => {
                        if (res.ok) {
                          setAssignedAgents(prev => ({ ...prev, [assigningCall.key]: { initials: a.initials, name: a.name } }));
                          setAssigningCall(null);
                          alert("Agente asignado exitosamente");
                          window.location.reload();
                        } else {
                          const errorText = await res.text();
                          alert(`Error al asignar agente: ${errorText}`);
                        }
                      }).catch((err) => alert(`Error de red al asignar: ${err.message}`));
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
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {newTicketId || "Crear Nuevo Ticket"}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  disabled={!newTicketAgent}
                  onClick={() => {
                    if (!newTicketAgent) return;
                    setAgentsLoading(true);
                    setAssigningCall({ key: "new_ticket", role: newTicketAgent });
                    fetch("https://vmi3345591.contaboserver.net/webhook/get-human-agent", { method: "POST" })
                      .then(res => res.json())
                      .then((data: HumanAgent[]) => {
                        const filtered = data.filter(a => a.roles && a.roles.some(r => r.toLowerCase() === newTicketAgent.toLowerCase()));
                        setAvailableAgents(filtered);
                      })
                      .catch(err => console.error(err))
                      .finally(() => setAgentsLoading(false));
                  }}
                  className={`text-orange-500 transition-colors ${
                    newTicketAgent ? "hover:text-orange-700" : "opacity-50 cursor-not-allowed"
                  }`}
                  title="Asignar a"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
                {assignedAgents["new_ticket"] && (
                  <span className="text-sm font-medium text-foreground">
                    {assignedAgents["new_ticket"].name}
                  </span>
                )}
              </div>
            </div>
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
                  <label className="block text-sm font-medium text-foreground mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="###-###-####"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    value={newTicketPhone}
                    onChange={handlePhoneChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Documento de Identidad</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    value={newTicketDoc}
                    onChange={e => setNewTicketDoc(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre Completo</label>
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
                  setAgentsLoading(true);
                  const payload = {
                    id_ticket: newTicketId,
                    asignar_a: assignedAgents["new_ticket"]?.agentKey || "",
                    agente: newTicketAgent || "",
                    especialista: newTicketSpecialist || "",
                    telefono: newTicketPhone.replace(/\D/g, ""),
                    documento: newTicketDoc || "",
                    nombre: newTicketName || "",
                    direccion: newTicketAddress || "",
                    requerimiento: newTicketRequest || "",
                    notas: newTicketNotes || ""
                  };

                  fetch("https://vmi3345591.contaboserver.net/webhook/set-call-manually", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                  })
                    .then(async res => {
                      if (res.ok) {
                        alert("Ticket creado exitosamente.");
                        setIsCreatingTicket(false);
                        if (!payload.asignar_a) {
                          window.location.reload();
                        }
                      } else {
                        const errorText = await res.text();
                        alert(`Error al crear ticket: ${errorText}`);
                      }
                    })
                    .catch(err => {
                      console.error(err);
                      alert(`Error de red al crear ticket: ${err.message}`);
                    })
                    .finally(() => setAgentsLoading(false));
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
