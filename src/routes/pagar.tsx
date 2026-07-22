import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CreditCard, Download, Check, Calendar, Wifi, Tv, FileText, ArrowRight, AlertCircle,
  Globe, Store, ExternalLink, Building2, ShieldCheck,
} from "lucide-react";
import { PaymentMethodsSection } from "@/components/PaymentMethodsSection";

export const Route = createFileRoute("/pagar")({
  head: () => ({
    meta: [
      { title: "Pagar factura — Tu Norte Portal" },
      { name: "description", content: "Consulta y paga tu factura mensual de forma segura, 100% en línea." },
    ],
  }),
  component: PagarPage,
});

const invoices = [
  { id: "FT-2026-04", month: "Abril 2026", amount: 89900, due: "15 May 2026", status: "pending" as const },
  { id: "FT-2026-03", month: "Marzo 2026", amount: 89900, due: "15 Abr 2026", status: "paid" as const },
  { id: "FT-2026-02", month: "Febrero 2026", amount: 89900, due: "15 Mar 2026", status: "paid" as const },
  { id: "FT-2026-01", month: "Enero 2026", amount: 89900, due: "15 Feb 2026", status: "paid" as const },
];

function PagarPage() {
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const current = invoices[0];

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPaid(true);
    }, 1800);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-8">
        <Link to="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-brand hover:underline">
          ← Inicio
        </Link>
        <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">Mi factura</h1>
        <p className="mt-2 text-muted-foreground">Consulta, descarga y paga sin filas. 100% seguro.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Current invoice */}
        <Card className="overflow-hidden border-0 shadow-card">
          <div className="bg-gradient-brand p-6 text-primary-foreground md:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm opacity-90">Factura actual</p>
                <p className="mt-1 font-display text-2xl font-bold">{current.month}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${paid ? "bg-success text-success-foreground" : "bg-amber-400 text-amber-950"}`}>
                {paid ? "Pagada" : "Pendiente"}
              </span>
            </div>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-5xl font-bold">${current.amount.toLocaleString("es-CO")}</span>
              <span className="text-sm opacity-80">COP</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm opacity-90">
              <Calendar className="h-4 w-4" /> Vence el {current.due}
            </div>
          </div>

          <div className="space-y-3 p-6 md:p-8">
            <h3 className="font-display font-bold">Detalle del servicio</h3>
            {[
              { icon: Wifi, label: "Internet Familiar 300 Mbps", price: 59900 },
              { icon: Tv, label: "TV HD · +90 canales", price: 25000 },
              { icon: FileText, label: "Cargos administrativos", price: 5000 },
            ].map((it) => (
              <div key={it.label} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                <span className="flex items-center gap-3 text-sm">
                  <it.icon className="h-4 w-4 text-primary" /> {it.label}
                </span>
                <span className="font-mono text-sm font-semibold">${it.price.toLocaleString("es-CO")}</span>
              </div>
            ))}

            {paid ? (
              <div className="mt-4 rounded-xl bg-success/10 p-4 text-center">
                <Check className="mx-auto h-10 w-10 text-success" />
                <p className="mt-2 font-display font-bold text-success">¡Pago exitoso!</p>
                <p className="text-sm text-muted-foreground">Recibirás el comprobante por correo.</p>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <a
                  href="https://saeplus.com/r_VRD*y2"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-xl bg-gradient-brand px-5 py-4 text-primary-foreground shadow-glow transition hover:opacity-95"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
                      <CreditCard className="h-5 w-5" />
                    </span>
                    <span className="flex flex-col text-left">
                      <span className="font-display text-base font-bold">Pagar con SAE PAY</span>
                      <span className="text-[11px] opacity-90">PSE en línea · Costo adicional $1.190</span>
                    </span>
                  </span>
                  <ExternalLink className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </a>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={handlePay} disabled={paying} size="lg" variant="outline" className="flex-1 border-2">
                    {paying ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                        Procesando…
                      </span>
                    ) : (
                      <><CreditCard className="mr-1 h-4 w-4" /> Marcar como pagada</>
                    )}
                  </Button>
                  <Button variant="outline" size="lg" className="border-2">
                    <Download className="mr-1 h-4 w-4" /> Descargar PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Payment methods quick view */}
        <div className="space-y-6">
          <Card className="border-border/60 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="font-display font-bold">Medios de pago</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Elige el que te resulte más cómodo y seguro.</p>
            <div className="mt-4 space-y-2">
              <a href="#pse" className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 transition hover:border-primary hover:bg-primary/5">
                <span className="flex items-center gap-3 text-sm font-semibold"><Globe className="h-4 w-4 text-primary" /> PSE en línea</span>
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase text-success">Recomendado</span>
              </a>
              <a href="#supergiros" className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 transition hover:border-primary hover:bg-primary/5">
                <span className="flex items-center gap-3 text-sm font-semibold"><Store className="h-4 w-4 text-primary" /> SuperGiros</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </a>
              <a href="#oficinas" className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 transition hover:border-primary hover:bg-primary/5">
                <span className="flex items-center gap-3 text-sm font-semibold"><Building2 className="h-4 w-4 text-primary" /> Nuestras oficinas</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          </Card>

          <Card className="border-amber-200 bg-amber-50 p-5 shadow-soft">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-display text-sm font-bold text-amber-900">Aviso importante</p>
                <p className="mt-1 text-xs text-amber-800">
                  Los pagos realizados a través de <strong>SAE PAY</strong> tienen un costo adicional de <strong>$1.190</strong>.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ============= Interactive payment methods section ============= */}
      <PaymentMethodsSection />


      {/* History */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold">Historial de facturas</h2>
        <Card className="mt-4 overflow-hidden border-border/60 bg-white shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Periodo</th>
                <th className="hidden px-4 py-3 text-left md:table-cell">Referencia</th>
                <th className="px-4 py-3 text-left">Valor</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{i.month}</td>
                  <td className="hidden px-4 py-3 font-mono text-muted-foreground md:table-cell">{i.id}</td>
                  <td className="px-4 py-3 font-mono font-semibold">${i.amount.toLocaleString("es-CO")}</td>
                  <td className="px-4 py-3">
                    {i.status === "paid" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-xs font-semibold text-success">
                        <Check className="h-3 w-3" /> Pagada
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-700">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-primary hover:text-brand" aria-label="Descargar">
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </section>
  );
}

