import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Facebook, Instagram, ShieldAlert } from "lucide-react";
const logo = "/images/logo.png";
const regIcbf = "/images/reg-icbf.png";
const regCai = "/images/reg-cai.png";
const regEntic = "/images/reg-entic.png";
const regFiscalia = "/images/reg-fiscalia.png";

const reportingChannels = [
  { name: "Bienestar Familiar", img: regIcbf, url: "https://www.icbf.gov.co/" },
  { name: "CAI Virtual — Policía Nacional", img: regCai, url: "https://caivirtual.policia.gov.co/" },
  { name: "En TIC Confío", img: regEntic, url: "https://www.enticconfio.gov.co/" },
  { name: "Fiscalía General de la Nación", img: regFiscalia, url: "https://www.fiscalia.gov.co/colombia/" },
] as const;

export function Footer() {
  return (
    <footer className="bg-gradient-dark text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-28 md:px-6 md:pb-20">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Tu Norte Portal" className="h-12 w-12 rounded-xl bg-white/10 p-1" width={48} height={48} loading="lazy" />
              <div>
                <p className="text-lg font-bold">Tu Norte Portal</p>
                <p className="text-xs uppercase tracking-widest text-white/60">Telecomunicaciones</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-white/70">
              Televisión e internet bajo premisas de calidad y tarifas equitativas para Norte de Santander.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="#" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-brand hover:text-primary"><Facebook className="h-4 w-4" /></a>
              <a href="#" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-brand hover:text-primary"><Instagram className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">Servicios</h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li><Link to="/planes" className="hover:text-brand">Planes Internet + TV</Link></li>
              <li><Link to="/cobertura" className="hover:text-brand">Verificar Cobertura</Link></li>
              <li><Link to="/test-velocidad" className="hover:text-brand">Test de Velocidad</Link></li>
              <li><Link to="/soporte" className="hover:text-brand">Soporte Técnico</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">Atención</h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li><Link to="/pqr" className="hover:text-brand">Radicar PQR</Link></li>
              <li><Link to="/empresa" className="hover:text-brand">Quiénes somos</Link></li>
              <li><a href="https://www.crcom.gov.co" target="_blank" rel="noreferrer" className="hover:text-brand">CRC</a></li>
              <li><a href="https://www.mintic.gov.co" target="_blank" rel="noreferrer" className="hover:text-brand">MinTIC</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand">Contacto</h4>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 text-brand" /><span>Av 1 # 4-50, Barrio Motilones, Cúcuta, N. de Santander</span></li>
              <li className="flex gap-3"><Phone className="h-4 w-4 shrink-0 text-brand" /><a href="tel:+573330333696" className="hover:text-brand">333 033 3696</a></li>
              <li className="flex gap-3"><Mail className="h-4 w-4 shrink-0 text-brand" /><span>contacto@tunorte.co</span></li>
            </ul>
          </div>
        </div>

        {/* Canales de denuncia y entidades reguladoras */}
        <div className="mt-14 border-t border-white/10 pt-10">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-brand" />
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand">
              Canales de denuncia
            </h4>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            En caso de delitos informáticos, abuso a menores o fraude, denuncia directamente ante las autoridades competentes.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {reportingChannels.map((c) => (
              <a
                key={c.name}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-4 text-center transition hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="grid h-20 w-full place-items-center">
                  <img
                    src={c.img}
                    alt={c.name}
                    className="max-h-16 w-auto object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary transition group-hover:brightness-110">
                  Denuncie aquí
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} Tu Norte TV. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-brand">Política de Privacidad</Link>
            <Link to="/" className="hover:text-brand">Términos y Condiciones</Link>
            <Link to="/admin" className="hover:text-brand">Admin</Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
