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
        ? "[SAE] El enlace con SAE Plus aún no está configurado. Contacta al administrador."
        : code === "invalid_cedula"
          ? "[SAE] Cédula inválida."
          : code === "invalid_password"
            ? "[SAE] La contraseña debe tener al menos 6 caracteres."
            : code === "account_required"
              ? "[SAE] No encontramos una cuenta activa con esa cédula y contraseña. Crea tu cuenta en “Crear cuenta” o verifica tu contraseña."
              : code === "unauthorized"
                ? "[SAE] Tu sesión expiró. Vuelve a iniciar sesión."
                : code === "network_error" || code === "upstream_error"
                  ? "[SAE] No pudimos conectar con el sistema. Intenta de nuevo."
                  : "[SAE] Cédula o contraseña incorrecta.";
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
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ cedula: "", password: "", nombre: "", email: "", telefono: "" });

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setAccounts(null);
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
        const res = await fetch("https://vmi3345591.contaboserver.net/webhook/lista-abonados", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ external_id: s.cedula })
        });
        const webhookData = await res.json().catch(() => ({}));
        
        if (!res.ok) {
           throw new Error(webhookData.error || "Error al cargar la información");
        }
        if (webhookData.error) {
           throw new Error(webhookData.error);
        }
        
        const accs = Array.isArray(webhookData.data) ? webhookData.data : [];
        setAccounts(accs);
      } catch (e) {
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

    if (!form.cedula.trim()) {
      setError("La cédula es requerida.");
      setLoading(false);
      return;
    }
    if (!form.password.trim()) {
      setError("La contraseña es requerida.");
      setLoading(false);
      return;
    }

    if (mode === "register") {
      if (!form.nombre.trim()) {
        setError("El nombre completo es requerido.");
        setLoading(false);
        return;
      }
      if (!form.email.trim()) {
        setError("El correo electrónico es requerido.");
        setLoading(false);
        return;
      }
      if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
        setError("El correo electrónico no tiene un formato válido.");
        setLoading(false);
        return;
      }
      if (!form.telefono.trim()) {
        setError("El celular es requerido.");
        setLoading(false);
        return;
      }
      if (!/^\d{10}$/.test(form.telefono.replace(/\s+/g, ""))) {
        setError("El celular debe tener exactamente 10 dígitos numéricos.");
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === "register") {
        try {
          const res = await fetch("https://vmi3345591.contaboserver.net/webhook/set-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              document: form.cedula,
              full_name: form.nombre,
              email: form.email,
              phone: form.telefono,
              password: form.password,
            }),
          });

          let webhookData;
          try {
            webhookData = await res.json();
          } catch (e) {
            webhookData = null;
          }

          if (!res.ok) {
            const errorMsg = webhookData && webhookData.message ? webhookData.message : `Error en el servidor (Código: ${res.status})`;
            throw new Error(errorMsg);
          }

          if (webhookData && webhookData.error) {
            throw new Error(webhookData.error);
          }

          const successMsg = webhookData && webhookData.message 
            ? webhookData.message 
            : "Cuenta creada exitosamente.";
            
          setNotice(successMsg);
          setMode("login");
          setForm({ cedula: form.cedula, password: "", nombre: "", email: "", telefono: "" });
          return;
        } catch (webhookErr) {
          throw new Error(webhookErr instanceof Error ? webhookErr.message : String(webhookErr));
        }
      }

      if (mode === "login") {
        try {
          const res = await fetch("https://vmi3345591.contaboserver.net/webhook/get-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              document: form.cedula,
              password: form.password,
            }),
          });

          let webhookData;
          try {
            webhookData = await res.json();
          } catch (e) {
            webhookData = null;
          }

          if (!res.ok) {
            const errorMsg = webhookData && (webhookData.error || webhookData.message) ? (webhookData.error || webhookData.message) : `Error en el servidor (Código: ${res.status})`;
            throw new Error(errorMsg);
          }

          if (webhookData && webhookData.error) {
            throw new Error(webhookData.error);
          }

          if (!webhookData || !webhookData.message) {
            throw new Error("Respuesta inválida del servidor al iniciar sesión.");
          }

          const s: Session = {
            cedula: form.cedula.replace(/\D/g, ""),
            token: "valid-session",
            nombre: pick(webhookData as Account, ["nombre", "name", "cliente", "full_name"]) || undefined,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
          setSession(s);
          await loadAccount(s);
          return;
        } catch (webhookErr) {
          throw new Error(webhookErr instanceof Error ? webhookErr.message : String(webhookErr));
        }
      }

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

  const nombre = session.nombre ?? "";

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

      {loading && !accounts ? (
        <div className="mt-10 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Consultando tu información…
        </div>
      ) : accounts && accounts.length > 0 ? (
        <div className="mt-8 space-y-8">
          {[...accounts]
            .sort((a, b) => {
              const statusA = str(a.nombrestatus).toUpperCase();
              const statusB = str(b.nombrestatus).toUpperCase();
              if (statusA === "CORTADO" && statusB !== "CORTADO") return -1;
              if (statusB === "CORTADO" && statusA !== "CORTADO") return 1;
              return 0;
            })
            .map((acc, idx) => {
              const status = str(acc.nombrestatus);
            const isActive = status.toUpperCase() === "ACTIVO" || status.toUpperCase() === "AL DIA";
            
            return (
              <Card key={idx} className="overflow-hidden border-border/60 bg-white shadow-soft">
                <div className="border-b border-border/60 bg-muted/20 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Wifi className="h-5 w-5 text-brand" />
                    <h2 className="font-display text-lg font-bold">Contrato {str(acc.nro_contrato)}</h2>
                  </div>
                  <span className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold uppercase",
                    isActive ? "bg-success/15 text-success" : "bg-red-500/15 text-red-600"
                  )}>
                    {status || "Desconocido"}
                  </span>
                </div>
                
                <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">ID Contrato</dt>
                    <dd className="mt-1 font-mono text-sm font-semibold text-primary">{str(acc.id_contrato) || "—"}</dd>
                  </div>
                  
                  <div className="sm:col-span-2 lg:col-span-1">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Dirección Fiscal</dt>
                    <dd className="mt-1 text-sm font-semibold">{str(acc.direccion_fiscal) || "No registrada"}</dd>
                  </div>

                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Suscripción</dt>
                    <dd className="mt-1 text-sm font-semibold">{formatCOP(str(acc.suscripcion)) || "—"}</dd>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Detalle de Suscripción</dt>
                    <dd className="mt-1 text-sm font-semibold text-muted-foreground">{str(acc.det_suscripcion) || "—"}</dd>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-1 rounded-xl bg-muted/40 p-4 border border-border/50 flex flex-col justify-between">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4" /> Saldo Pendiente
                      </dt>
                      <dd className="mt-2 font-display text-2xl font-bold text-primary">
                        {formatCOP(str(acc.saldo)) || "$0"}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      {Number(str(acc.saldo).replace(/[^\d.-]/g, "")) > 0 && (
                        <Link to="/medios-de-pago" className="mt-4 inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-brand px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90">
                          Pagar ahora <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      <div className="flex-1">
                        <VerFacturaButton idContrato={str(acc.id_contrato)} />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : accounts && accounts.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 text-center text-muted-foreground">
          <FileText className="mx-auto mb-3 h-8 w-8 opacity-50" />
          <p>No tienes contratos activos asociados a tu cédula.</p>
        </div>
      ) : null}
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

function VerFacturaButton({ idContrato }: { idContrato: string }) {
  const [loading, setLoading] = useState(false);

  const handleVerFactura = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://vmi3345591.contaboserver.net/webhook/ultimaFacturaPDF", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_contrato: idContrato })
      });
      const data = await res.json();
      const pdfUrl = data?.data?.info?.fact_cuenta;
      if (pdfUrl) {
        window.open(pdfUrl, "_blank");
      } else {
        alert("No se encontró factura para este contrato.");
      }
    } catch (e) {
      alert("Error al cargar la factura.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleVerFactura} 
      disabled={loading}
      className="mt-4 w-full h-[36px] bg-white text-xs"
    >
      {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <FileText className="mr-1.5 h-3.5 w-3.5" />}
      Ver Factura
    </Button>
  );
}
