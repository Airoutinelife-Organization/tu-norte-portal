import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ArrowLeft, Check, Wifi, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/recomendador")({
  head: () => ({
    meta: [
      { title: "Recomendador inteligente — Tu Norte TV" },
      { name: "description", content: "Encuentra el plan ideal para tu hogar en 3 preguntas." },
    ],
  }),
  component: RecomendadorPage,
});

type Q = { id: string; q: string; options: { label: string; weight: number }[] };

const questions: Q[] = [
  {
    id: "people",
    q: "¿Cuántas personas usarán internet en casa?",
    options: [
      { label: "1 – 2 personas", weight: 1 },
      { label: "3 – 4 personas", weight: 2 },
      { label: "5 – 6 personas", weight: 3 },
      { label: "Más de 6", weight: 4 },
    ],
  },
  {
    id: "use",
    q: "¿Para qué usan internet principalmente?",
    options: [
      { label: "Redes sociales y videos", weight: 1 },
      { label: "Streaming HD (Netflix, YouTube)", weight: 2 },
      { label: "Trabajo remoto / videollamadas", weight: 3 },
      { label: "Gaming y streaming 4K", weight: 4 },
    ],
  },
  {
    id: "tv",
    q: "¿Necesitas televisión por suscripción?",
    options: [
      { label: "No, solo internet", weight: 0 },
      { label: "Sí, canales básicos", weight: 1 },
      { label: "Sí, canales premium HD/4K", weight: 2 },
    ],
  },
];

const plans = [
  { name: "Hogar", speed: "100 Mbps", price: "59.900", tv: false, perks: ["100 Mbps simétricos", "WiFi 6 incluido", "Soporte 24/7"] },
  { name: "Familiar", speed: "300 Mbps", price: "89.900", tv: true, perks: ["300 Mbps simétricos", "+90 canales HD", "Decodificador incluido"] },
  { name: "Premium", speed: "600 Mbps", price: "129.900", tv: true, perks: ["600 Mbps simétricos", "+120 canales HD/4K", "2 decodificadores", "IP fija opcional"] },
];

function recommend(answers: number[]) {
  const total = answers.reduce((a, b) => a + b, 0);
  if (total <= 4) return 0;
  if (total <= 7) return 1;
  return 2;
}

function RecomendadorPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const reset = () => {
    setStep(0);
    setAnswers([]);
  };

  if (step >= questions.length) {
    const idx = recommend(answers);
    const plan = plans[idx];
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <Card className="overflow-hidden border-0 shadow-glow">
          <div className="bg-gradient-brand p-8 text-center text-primary-foreground md:p-10">
            <Sparkles className="mx-auto h-10 w-10" />
            <p className="mt-3 text-sm uppercase tracking-wider opacity-90">Tu plan ideal</p>
            <h1 className="mt-2 font-display text-4xl font-bold">Plan {plan.name}</h1>
            <p className="mt-2 font-display text-2xl font-bold">{plan.speed}</p>
          </div>
          <div className="p-8 md:p-10">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl font-bold text-primary">${plan.price}</span>
              <span className="text-muted-foreground">/ mes</span>
            </div>
            <ul className="mt-6 space-y-2.5">
              {plan.perks.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-success" /> {p}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="flex-1 bg-gradient-brand text-primary-foreground shadow-glow">
                <Link to="/agendar">Contratar y agendar <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button onClick={reset} variant="outline" size="lg" className="border-2">
                <RefreshCw className="mr-1 h-4 w-4" /> Volver a empezar
              </Button>
            </div>
            <Link to="/planes" className="mt-6 block text-center text-sm font-semibold text-primary hover:underline">
              Ver todos los planes →
            </Link>
          </div>
        </Card>
      </section>
    );
  }

  const q = questions[step];
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8">
        <Link to="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-brand hover:underline">← Inicio</Link>
        <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">Recomendador inteligente</h1>
        <p className="mt-2 text-muted-foreground">Responde 3 preguntas y encuentra tu plan ideal.</p>
      </div>

      <Card className="border-border/60 bg-white p-6 shadow-card md:p-10">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            Pregunta {step + 1} de {questions.length}
          </span>
          <Wifi className="h-5 w-5 text-brand" />
        </div>

        <p className="mt-5 font-display text-2xl font-bold">{q.q}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {q.options.map((o) => (
            <button
              key={o.label}
              onClick={() => {
                setAnswers([...answers, o.weight]);
                setStep(step + 1);
              }}
              className="rounded-2xl border-2 border-border bg-muted/20 px-5 py-4 text-left font-medium transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand/10 hover:text-primary"
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-brand transition-all" style={{ width: `${((step) / questions.length) * 100}%` }} />
        </div>

        {step > 0 && (
          <button
            onClick={() => {
              setStep(step - 1);
              setAnswers(answers.slice(0, -1));
            }}
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Anterior
          </button>
        )}
      </Card>
    </section>
  );
}
