import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, ShieldCheck, ArrowRight, ExternalLink, Info } from "lucide-react";
import { PaymentMethodsSection } from "@/components/PaymentMethodsSection";

export const Route = createFileRoute("/medios-de-pago")({
  head: () => ({
    meta: [
      { title: "Medios de pago — Tu Norte Portal" },
      { name: "description", content: "Paga tu factura de Tu Norte TV por PSE en línea, SuperGiros o en nuestras oficinas en Cúcuta. Sin necesidad de crear cuenta." },
      { property: "og:title", content: "Medios de pago — Tu Norte Portal" },
      { property: "og:description", content: "PSE, SuperGiros y oficinas — elige el medio de pago que más te convenga." },
    ],
  }),
  component: MediosDePagoPage,
});

function MediosDePagoPage() {
  const saeUrl = "https://saeplus.com/r_VRD*y2";

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-10 flex flex-col gap-6 rounded-3xl bg-gradient-brand p-8 text-primary-foreground shadow-glow md:flex-row md:items-center md:justify-between md:p-10">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-90">Acceso público</p>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">Paga tu factura sin crear cuenta</h1>
          <p className="mt-2 max-w-2xl text-sm opacity-90">
            Elige entre SAE PAY, PSE en línea, SuperGiros o nuestras oficinas. Ten a la mano el número de cédula del titular del servicio.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <a
            href={saeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-display font-bold text-primary shadow-glow transition hover:bg-white/90"
          >
            <CreditCard className="h-5 w-5" /> Pagar con SAE PAY
            <ExternalLink className="h-4 w-4" />
          </a>
          <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-xs font-semibold ring-1 ring-white/25">
            <Info className="h-4 w-4" /> Costo adicional $1.190
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-xs font-semibold ring-1 ring-white/25">
            <ShieldCheck className="h-4 w-4" /> Canales certificados
          </div>
        </div>
      </div>

      <PaymentMethodsSection
        eyebrow="Medios de pago"
        title="Elige el medio que prefieras"
        intro="No necesitas iniciar sesión. Usa cualquiera de nuestros canales oficiales para pagar tu factura de forma rápida y segura."
      />

      <div className="mt-12 rounded-3xl border border-border/60 bg-white p-6 shadow-soft md:p-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <CreditCard className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-lg font-bold">¿Ya eres cliente?</p>
              <p className="text-sm text-muted-foreground">Ingresa a tu cuenta para ver el detalle de tu factura e historial.</p>
            </div>
          </div>
          <Link
            to="/pagar"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow transition hover:opacity-90"
          >
            Ir a mi cuenta <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
