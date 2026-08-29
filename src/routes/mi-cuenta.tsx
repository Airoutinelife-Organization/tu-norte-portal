import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  UserCircle, LogOut, CreditCard, FileText, Wifi, ShieldCheck, Loader2,
  AlertCircle, ArrowRight, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mi-cuenta")({
  head: () => ({
    meta: [
      { title: "Mi cuenta — Tu Norte Portal" },
      { name: "description", content: "Ingresa con tu cédula y consulta tu plan, facturas y estado de servicio de Tu Norte TV en un solo lugar." },
      { property: "og:title", content: "Mi cuenta — Tu Norte Portal" },
      { property: "og:description", content: "Consulta tu plan, facturas y estado de servicio con tu cédula." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MiCuentaPage,
});

const STORAGE_KEY = "tn_session";

type Session = { cedula: string; token?: string; nombre?: string };
type Account = Record<string, unknown>;

class SaeError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

async function callSae(payload: Record<string, unknown>) {
  const res = await fetch("/api/public/sae", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const code = String(data["error"] ?? "error");
    const msg =
      code === "not_configured"
        ? "El enlace con SAE Plus aún no está configurado. Contacta al administrador."
        : code === "invalid_cedula"
          ? "Cédula inválida."
          : code === "invalid_password"
            ? "La contraseña debe tener al menos 6 caracteres."
            : code === "account_required"
              ? "No encontramos una cuenta activa con esa cédula y contraseña. Crea tu cuenta en “Crear cuenta” o verifica tu contraseña."
              : code === "unauthorized"
                ? "Tu sesión expiró. Vuelve a iniciar sesión."
                : code === "network_error" || code === "upstream_error"
                  ? "No pudimos conectar con el sistema. Intenta de nuevo."
                  : "Cédula o contraseña incorrecta.";
    throw new SaeError(code, msg);
  }
  return data;
}


function str(v: unknown) {
  return v === null || v === undefined ? "" : String(v);
}

function formatCOP(v: string) {
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(n)) return v;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

function pick(acc: Account, keys: string[]) {
  for (const k of keys) {
    const v = acc[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v);
  }
  return "";
}

function accountFromResponse(data: Record<string, unknown>): Account {
  for (const key of ["cuenta", "account", "data", "result"]) {
    const value = data[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Account;
    }
  }
  return data;
}

function MiCuentaPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ cedula: "", password: "", nombre: "", email: "", telefono: "" });

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setAccount(null);
  }, []);

  const loadAccount = useCallback(
    async (s: Session) => {
      if (!s.token) {
        clearSession();
        setError("Tu sesión expiró. Vuelve a iniciar sesión.");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const data = await callSae({ action: "account", cedula: s.cedula, token: s.token });
        setAccount(accountFromResponse(data));
      } catch (e) {
        if (e instanceof SaeError && (e.code === "unauthorized" || e.code === "account_required")) {
          clearSession();
        }
        setError(e instanceof Error ? e.message : "Error");
      } finally {
        setLoading(false);
      }
    },
    [clearSession],
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const s = JSON.parse(stored) as Session;
        if (!s.token) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        setSession(s);
        void loadAccount(s);
      }
    } catch {
      /* ignore */
    }
  }, [loadAccount]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const data = await callSae({ action: mode, ...form });
      if (mode === "register") {
        setNotice("Cuenta creada. Ya puedes iniciar sesión con tu cédula y contraseña.");
        setMode("login");
        setForm({ cedula: form.cedula, password: "", nombre: "", email: "", telefono: "" });
        return;
      }
      const token = typeof data["token"] === "string" ? data["token"] : "";
      if (!token) {
        setError("No pudimos validar tu cuenta. Intenta de nuevo.");
        return;
      }
      const s: Session = {
        cedula: form.cedula.replace(/\D/g, ""),
        token,
        nombre: pick(data as Account, ["nombre", "name", "cliente"]) || undefined,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      setSession(s);
      const raw = accountFromResponse(data);
      const hasAccountData = ["cliente", "nombrestatus", "saldo", "nro_contrato", "det_tipo_servicio"]
        .some((key) => raw[key] !== undefined && raw[key] !== null);
      if (hasAccountData) setAccount(raw);
      else await loadAccount(s);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (session?.token) {
      void callSae({ action: "logout", cedula: session.cedula, token: session.token }).catch(() => {});
    }
    clearSession();
    setForm({ cedula: "", password: "", nombre: "", email: "", telefono: "" });
  };


  if (!session) {
    return (
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Mi cuenta</span>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            Tu información de <span className="text-gradient-brand">Tu Norte</span>, siempre a la mano
          </h1>
          <p className="mt-4 text-muted-foreground">
            Ingresa con la cédula del titular del contrato y consulta tu plan, tu saldo, tus facturas y el estado de tu servicio.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              { icon: FileText, t: "Facturas y saldo al día" },
              { icon: Wifi, t: "Tu plan y velocidad contratada" },
              { icon: ShieldCheck, t: "Datos protegidos, conexión segura" },
            ].map((i) => (
              <li key={i.t} className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/15 text-primary">
                  <i.icon className="h-4 w-4" />
                </span>
                {i.t}
              </li>
            ))}
          </ul>
        </div>

        <Card className="border-0 bg-white p-6 shadow-glow md:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted/50 p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(""); setNotice(""); }}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold transition",
                  mode === m ? "bg-white text-primary shadow-soft" : "text-muted-foreground",
                )}
              >
                {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Cédula del titular" value={form.cedula} onChange={(v) => setForm({ ...form, cedula: v })} placeholder="1090123456" inputMode="numeric" />
            {mode === "register" && (
              <>
                <Field label="Nombre completo" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} placeholder="Nombre y apellido" />
                <Field label="Correo electrónico" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="correo@ejemplo.com" type="email" />
                <Field label="Celular" value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} placeholder="3001234567" inputMode="tel" />
              </>
            )}
            <Field label="Contraseña" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="Mínimo 6 caracteres" type="password" />

            {error && (
              <p className="flex items-start gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </p>
            )}
            {notice && <p className="rounded-xl bg-success/10 p-3 text-sm text-success">{notice}</p>}

            <Button type="submit" size="lg" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground shadow-soft hover:opacity-90">
              {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <UserCircle className="mr-1 h-4 w-4" />}
              {mode === "login" ? "Ingresar" : "Crear mi cuenta"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            ¿Solo quieres pagar?{" "}
            <Link to="/medios-de-pago" className="font-semibold text-primary hover:underline">
              Ver medios de pago
            </Link>
          </p>
        </Card>
      </section>
    );
  }

  const nombre = account
    ? pick(account, ["cliente", "nombre", "name", "titular"])
    : session.nombre ?? "";
  const plan = account
    ? pick(account, ["det_tipo_servicio", "det_suscripcion_act", "det_suscripcion", "plan", "servicio", "paquete", "producto"])
    : "";
  const estado = account ? pick(account, ["nombrestatus", "estado", "status", "estado_servicio"]) : "";
  const saldoRaw = account ? pick(account, ["saldo", "saldo_pendiente", "valor", "total", "deuda"]) : "";
  const saldo = saldoRaw ? formatCOP(saldoRaw) : "";
  const mensualidad = account ? pick(account, ["suscripcion_act", "suscripcion", "monto_susc_int"]) : "";
  const vence = account
    ? pick(account, ["vencimiento", "fecha_vencimiento", "proximo_pago", "fecha_corte", "ult_factura"])
    : "";
  const direccion = account ? pick(account, ["direccion_fiscal", "direccion", "address", "barrio"]) : "";
  const contrato = account ? pick(account, ["nro_contrato", "contrato", "contrato_fisico"]) : "";
  const tipoFact = account ? pick(account, ["tipo_fact"]) : "";
  const franquicia = account ? pick(account, ["nombre_franq"]) : "";
  const telefono = account ? pick(account, ["telefono", "telf_casa", "telf_adic"]) : "";
  const detTv = account ? pick(account, ["det_susc_tv"]) : "";
  const detInt = account ? pick(account, ["det_susc_int"]) : "";
  const facturas = account && Array.isArray(account["facturas"]) ? (account["facturas"] as Record<string, unknown>[]) : [];
  const detalles = [
    { label: "Contrato", value: contrato },
    { label: "Facturación", value: tipoFact },
    { label: "Sede", value: franquicia },
    { label: "Teléfono", value: telefono },
    { label: "Internet", value: detInt },
    { label: "Televisión", value: detTv },
    { label: "Mensualidad", value: mensualidad ? formatCOP(mensualidad) : "" },
    { label: "Última factura", value: vence },
  ].filter((d) => d.value);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Mi cuenta</span>
          <h1 className="mt-1 font-display text-3xl font-bold">
            Hola{nombre ? `, ${nombre.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-sm text-muted-foreground">Cédula {session.cedula}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void loadAccount(session)} disabled={loading}>
            <RefreshCw className={cn("mr-1 h-4 w-4", loading && "animate-spin")} /> Actualizar
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="mr-1 h-4 w-4" /> Salir
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-6 flex items-start gap-2 rounded-xl bg-red-500/10 p-4 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {loading && !account ? (
        <div className="mt-10 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Consultando tu información…
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Card className="border-0 bg-gradient-dark p-6 text-primary-foreground shadow-card">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-bold uppercase text-success">
                  {estado || "Activo"}
                </span>
                <Wifi className="h-5 w-5 text-brand" />
              </div>
              <h2 className="mt-4 font-display text-xl font-bold">{plan || "Tu plan"}</h2>
              {direccion && <p className="mt-1 text-sm text-white/70">{direccion}</p>}
            </Card>

            <Card className="border-border/60 bg-white p-6 shadow-soft">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CreditCard className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold">Saldo</h2>
              <p className="mt-2 font-display text-3xl font-bold text-primary">{saldo || "—"}</p>
              {vence && <p className="mt-1 text-sm text-muted-foreground">Vence: {vence}</p>}
              <Link to="/medios-de-pago" className="mt-5 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90">
                Pagar ahora <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>

            <Card className="border-border/60 bg-white p-6 shadow-soft">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-600">
                <FileText className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold">Soporte</h2>
              <p className="mt-1 text-sm text-muted-foreground">¿Fallas en tu servicio? Abre un caso o revisa tus tickets.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline"><Link to="/diagnostico">Diagnóstico</Link></Button>
                <Button asChild size="sm" variant="outline"><Link to="/mis-tickets">Mis tickets</Link></Button>
              </div>
            </Card>
          </div>

          {detalles.length > 0 && (
            <Card className="mt-6 border-border/60 bg-white p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Detalles del contrato</h2>
              <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {detalles.map((d) => (
                  <div key={d.label}>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{d.label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}

          {facturas.length > 0 && (
            <Card className="mt-6 overflow-hidden border-border/60 bg-white shadow-soft">
              <div className="border-b border-border p-5">
                <h2 className="font-display text-lg font-bold">Historial de facturas</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">Factura</th>
                      <th className="px-5 py-3">Periodo</th>
                      <th className="px-5 py-3">Valor</th>
                      <th className="px-5 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturas.map((f, i) => (
                      <tr key={i} className="border-t border-border/60">
                        <td className="px-5 py-3 font-mono">{str(f["numero"] ?? f["id"] ?? i + 1)}</td>
                        <td className="px-5 py-3">{str(f["periodo"] ?? f["fecha"] ?? "")}</td>
                        <td className="px-5 py-3 font-semibold">{str(f["valor"] ?? f["total"] ?? "")}</td>
                        <td className="px-5 py-3">{str(f["estado"] ?? f["status"] ?? "")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </section>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "tel";
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        inputMode={inputMode}
        required
        maxLength={160}
        className="mt-1.5 h-12 w-full rounded-xl border border-input bg-muted/40 px-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}
