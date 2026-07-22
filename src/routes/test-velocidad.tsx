import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gauge, Download, Upload, Activity, Play, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/test-velocidad")({
  head: () => ({
    meta: [
      { title: "Test de Velocidad — Tu Norte Portal" },
      { name: "description", content: "Mide la velocidad real de tu conexión a internet de Tu Norte TV: descarga, carga y latencia." },
      { property: "og:title", content: "Test de Velocidad — Tu Norte Portal" },
      { property: "og:description", content: "Comprueba en segundos la velocidad de tu internet." },
    ],
  }),
  component: SpeedTestPage,
});

function SpeedTestPage() {
  const [phase, setPhase] = useState<"idle" | "ping" | "download" | "upload" | "done">("idle");
  const [ping, setPing] = useState(0);
  const [down, setDown] = useState(0);
  const [up, setUp] = useState(0);
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);

  const animate = (target: number, setter: (n: number) => void, duration: number, onDone: () => void) => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const wobble = t < 0.95 ? (Math.random() - 0.5) * target * 0.08 : 0;
      setter(Math.max(0, target * eased + wobble));
      setProgress(t * 100);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else { setter(target); onDone(); }
    };
    raf.current = requestAnimationFrame(tick);
  };

  const start = () => {
    setPing(0); setDown(0); setUp(0); setProgress(0);
    setPhase("ping");
    setTimeout(() => {
      setPing(8 + Math.floor(Math.random() * 12));
      setPhase("download");
      animate(285 + Math.random() * 30, setDown, 3500, () => {
        setPhase("upload");
        animate(180 + Math.random() * 30, setUp, 2800, () => setPhase("done"));
      });
    }, 1000);
  };

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  const isRunning = phase === "ping" || phase === "download" || phase === "upload";
  const current = phase === "download" ? down : phase === "upload" ? up : phase === "done" ? down : 0;
  // Gauge calculation: 0..600 Mbps -> -135deg..135deg
  const angle = -135 + Math.min(1, current / 600) * 270;

  return (
    <>
      <section className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center md:px-6 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-white/60 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur">
            <Activity className="h-3.5 w-3.5 text-brand" /> Test de velocidad
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold md:text-5xl">Mide tu <span className="text-gradient-brand">velocidad real</span></h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Comprueba la velocidad de descarga, carga y latencia de tu conexión.</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 md:px-6">
        <Card className="border-0 p-8 shadow-card md:p-12">
          {/* Gauge */}
          <div className="relative mx-auto aspect-square w-full max-w-sm">
            <svg viewBox="0 0 200 200" className="h-full w-full">
              <defs>
                <linearGradient id="gg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.16 210)" />
                  <stop offset="100%" stopColor="oklch(0.42 0.18 250)" />
                </linearGradient>
              </defs>
              {/* Track */}
              <path d="M 30 160 A 80 80 0 1 1 170 160" fill="none" stroke="oklch(0.93 0.015 220)" strokeWidth="14" strokeLinecap="round" />
              {/* Progress */}
              <path
                d="M 30 160 A 80 80 0 1 1 170 160"
                fill="none"
                stroke="url(#gg)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray="377"
                strokeDashoffset={377 - (377 * Math.min(1, current / 600))}
                style={{ transition: "stroke-dashoffset 0.15s linear" }}
              />
              {/* Needle */}
              <g transform={`rotate(${angle} 100 110)`} style={{ transition: "transform 0.15s linear" }}>
                <line x1="100" y1="110" x2="100" y2="45" stroke="oklch(0.42 0.18 250)" strokeWidth="3" strokeLinecap="round" />
                <circle cx="100" cy="110" r="8" fill="oklch(0.42 0.18 250)" />
              </g>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-12">
              <p className="font-display text-5xl font-bold text-primary md:text-6xl">{current.toFixed(1)}</p>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Mbps</p>
              <p className="mt-1 text-xs font-medium text-brand">
                {phase === "idle" && "Listo para iniciar"}
                {phase === "ping" && "Midiendo latencia..."}
                {phase === "download" && "Descarga"}
                {phase === "upload" && "Carga"}
                {phase === "done" && "Test completado"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <Stat icon={Activity} label="Ping" value={`${ping} ms`} active={phase === "ping"} />
            <Stat icon={Download} label="Descarga" value={`${down.toFixed(0)} Mbps`} active={phase === "download"} />
            <Stat icon={Upload} label="Carga" value={`${up.toFixed(0)} Mbps`} active={phase === "upload"} />
          </div>

          <div className="mt-8 flex justify-center">
            {phase === "done" ? (
              <Button size="lg" onClick={start} variant="outline" className="rounded-full"><RotateCcw className="mr-2 h-4 w-4" /> Repetir test</Button>
            ) : (
              <Button size="lg" onClick={start} disabled={isRunning} className="rounded-full bg-gradient-brand px-10 text-primary-foreground shadow-glow">
                {isRunning ? "Midiendo..." : (<><Play className="mr-2 h-4 w-4" fill="currentColor" /> Iniciar test</>)}
              </Button>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Resultados aproximados. Para una medición técnica certificada utiliza una conexión por cable Ethernet.
          </p>
        </Card>
      </section>
    </>
  );
}

function Stat({ icon: Icon, label, value, active }: { icon: any; label: string; value: string; active: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 text-center transition ${active ? "border-brand bg-brand/5" : "border-border"}`}>
      <Icon className={`mx-auto h-5 w-5 ${active ? "text-brand" : "text-muted-foreground"}`} />
      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display text-base font-bold">{value}</p>
    </div>
  );
}
