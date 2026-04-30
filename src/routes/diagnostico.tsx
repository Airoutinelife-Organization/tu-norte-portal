import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Wifi, Router, Cable, ShieldCheck, Check, X, AlertCircle, RefreshCw, MessageSquare,
  ArrowRight, Headphones,
} from "lucide-react";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      { title: "Diagnóstico — Solucionar problemas de internet | Tu Norte TV" },
      { name: "description", content: "Resuelve fallas de internet con nuestro asistente de diagnóstico paso a paso." },
    ],
  }),
  component: DiagnosticoPage,
});

type Step = { id: string; title: string; desc: string; icon: typeof Wifi };

const steps: Step[] = [
  { id: "router", title: "Verificando estado del router", desc: "Revisamos las luces y conectividad de tu equipo", icon: Router },
  { id: "fiber", title: "Comprobando línea de fibra", desc: "Confirmamos señal óptica desde el nodo", icon: Cable },
  { id: "network", title: "Probando red local", desc: "Verificamos velocidad y latencia", icon: Wifi },
  { id: "service", title: "Estado del servicio en tu zona", desc: "Consultamos incidencias en tiempo real", icon: ShieldCheck },
];

function DiagnosticoPage() {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState<("ok" | "fail")[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!started || done) return;
    if (current >= steps.length) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => {
      // simulate: 3 OK, 1 fail (router on step 0 to keep it interesting? we keep all OK except network)
      const outcome: "ok" | "fail" = current === 2 ? "fail" : "ok";
      setResults((r) => [...r, outcome]);
      setCurrent((c) => c + 1);
    }, 1400);
    return () => clearTimeout(t);
  }, [started, current, done]);

  const reset = () => {
    setStarted(false);
    setCurrent(0);
    setResults([]);
    setDone(false);
  };

  const hasIssue = results.includes("fail");

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8">
        <Link to="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-brand hover:underline">← Inicio</Link>
        <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">Diagnóstico de conexión</h1>
        <p className="mt-2 text-muted-foreground">Te guiamos para identificar y solucionar el problema.</p>
      </div>

      {!started && (
        <Card className="overflow-hidden border-0 bg-gradient-hero p-8 shadow-card md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-soft">
                Diagnóstico inteligente
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold md:text-3xl">¿Tu internet no funciona?</h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                Realizamos 4 verificaciones automáticas para ubicar la falla. Tarda menos de un minuto.
              </p>
              <Button onClick={() => setStarted(true)} size="lg" className="mt-6 bg-gradient-brand text-primary-foreground shadow-glow">
                Iniciar diagnóstico <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {steps.map((s) => (
                <div key={s.id} className="rounded-2xl bg-white p-4 shadow-soft">
                  <s.icon className="h-6 w-6 text-primary" />
                  <p className="mt-2 text-xs font-semibold">{s.title.replace("Verificando ", "").replace("Comprobando ", "").replace("Probando ", "").replace("Estado del ", "")}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {started && (
        <Card className="border-border/60 bg-white p-6 shadow-card md:p-8">
          <div className="space-y-3">
            {steps.map((s, i) => {
              const status = results[i];
              const isCurrent = i === current && !done;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                    isCurrent
                      ? "border-brand bg-brand/5"
                      : status === "ok"
                      ? "border-success/30 bg-success/5"
                      : status === "fail"
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border bg-muted/20"
                  }`}
                >
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                    isCurrent ? "bg-brand text-primary" : status === "ok" ? "bg-success text-success-foreground" : status === "fail" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {isCurrent ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : status === "ok" ? (
                      <Check className="h-5 w-5" />
                    ) : status === "fail" ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <s.icon className="h-5 w-5" />
                    )}
                  </span>
                  <div className="flex-1">
                    <p className="font-display font-bold">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                  {status === "ok" && <span className="text-xs font-semibold text-success">OK</span>}
                  {status === "fail" && <span className="text-xs font-semibold text-destructive">Falla</span>}
                </div>
              );
            })}
          </div>

          {done && (
            <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-6">
              {hasIssue ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-destructive/15 text-destructive">
                      <AlertCircle className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="font-display text-lg font-bold">Detectamos una falla en tu red local</p>
                      <p className="text-sm text-muted-foreground">Tu fibra está bien, pero la red WiFi presenta inestabilidad.</p>
                    </div>
                  </div>
                  <ol className="mt-5 space-y-2 text-sm">
                    {[
                      "Desconecta el router 30 segundos y vuelve a conectarlo.",
                      "Acércate al router para descartar problemas de cobertura WiFi.",
                      "Si persiste, crea un ticket y un técnico contactará en máx. 4 horas.",
                    ].map((t, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/20 text-xs font-bold text-primary">{i + 1}</span>
                        {t}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground shadow-soft">
                      <Link to="/pqr"><MessageSquare className="mr-1 h-4 w-4" /> Crear ticket técnico</Link>
                    </Button>
                    <Button onClick={reset} variant="outline" size="lg" className="border-2">
                      <RefreshCw className="mr-1 h-4 w-4" /> Volver a probar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-success/15 text-success">
                      <Check className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="font-display text-lg font-bold">Todo está funcionando correctamente</p>
                      <p className="text-sm text-muted-foreground">No detectamos fallas en tu servicio.</p>
                    </div>
                  </div>
                  <Button asChild className="mt-5 bg-gradient-brand text-primary-foreground">
                    <Link to="/soporte"><Headphones className="mr-1 h-4 w-4" /> Aún tengo problemas</Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </Card>
      )}
    </section>
  );
}
