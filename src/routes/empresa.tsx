import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Eye, Heart, Award, Users, Network } from "lucide-react";
const network = "/images/network.jpg";

export const Route = createFileRoute("/empresa")({
  head: () => ({
    meta: [
      { title: "Nuestra empresa — Tu Norte TV" },
      { name: "description", content: "Conoce a Tu Norte TV: misión, visión y valores. Operador de telecomunicaciones autorizado en Norte de Santander." },
      { property: "og:title", content: "Nuestra empresa — Tu Norte TV" },
      { property: "og:description", content: "+15 años conectando a Norte de Santander con internet y televisión." },
      { property: "og:image", content: "/network.jpg" },
    ],
  }),
  component: EmpresaPage,
});

function EmpresaPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-dark text-primary-foreground">
        <img src={network} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center md:px-6 md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur">
            <Network className="h-3.5 w-3.5 text-brand" /> Operador autorizado CRC · MinTIC
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold md:text-6xl">Conectando el <span className="text-brand">Norte</span> con el mundo</h1>
          <p className="mx-auto mt-5 max-w-2xl text-white/75">Somos expertos en telecomunicaciones, comprometidos con tarifas equitativas y tecnología de punta para impulsar el crecimiento de nuestra región.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: "Misión", desc: "Proporcionar servicios de telecomunicaciones a través de redes tecnológicamente actualizadas, cumpliendo la normativa vigente e impulsando el crecimiento económico productivo del país." },
            { icon: Eye, title: "Visión", desc: "Ser el operador de telecomunicaciones de referencia en Norte de Santander, reconocido por la calidad de su servicio, su compromiso social y la innovación tecnológica continua." },
            { icon: Heart, title: "Valores", desc: "Calidad, equidad, transparencia, innovación y compromiso con nuestros clientes y comunidades. Cada conexión que entregamos lleva nuestro sello de excelencia." },
          ].map((b) => (
            <Card key={b.title} className="border-border/60 bg-white p-7 shadow-soft transition hover:shadow-card">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground"><b.icon className="h-7 w-7" /></div>
              <h3 className="mt-5 font-display text-xl font-bold">{b.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{b.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Nuestro <span className="text-gradient-brand">impacto</span></h2>
          </div>
          <div className="grid gap-5 md:grid-cols-4">
            {[
              { icon: Users, k: "+25.000", v: "Hogares conectados" },
              { icon: Network, k: "+15", v: "Municipios con cobertura" },
              { icon: Award, k: "15", v: "Años de experiencia" },
              { icon: Heart, k: "99.9%", v: "Disponibilidad de red" },
            ].map((s) => (
              <Card key={s.v} className="border-0 bg-white p-6 text-center shadow-soft">
                <s.icon className="mx-auto h-7 w-7 text-brand" />
                <p className="mt-3 font-display text-3xl font-bold text-primary">{s.k}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.v}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:px-6">
        <Card className="mx-auto max-w-5xl border-0 bg-gradient-brand p-10 text-center text-primary-foreground shadow-glow md:p-16">
          <h2 className="font-display text-3xl font-bold md:text-4xl">¿Listo para unirte a Tu Norte?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">Verifica cobertura en tu zona y empieza a disfrutar internet de fibra y TV de calidad.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:opacity-90"><Link to="/cobertura">Verificar cobertura</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-primary/30 bg-white/40 text-primary hover:bg-white"><Link to="/planes">Ver planes</Link></Button>
          </div>
        </Card>
      </section>
    </>
  );
}
