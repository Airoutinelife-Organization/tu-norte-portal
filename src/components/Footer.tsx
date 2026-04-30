import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Facebook, Instagram } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="bg-gradient-dark text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Tu Norte TV" className="h-12 w-12 rounded-xl bg-white/10 p-1" width={48} height={48} loading="lazy" />
              <div>
                <p className="text-lg font-bold">Tu Norte TV</p>
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
              <li className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 text-brand" /> Av 1 # 4-50, Barrio Motilones, Cúcuta, N. de Santander</li>
              <li className="flex gap-3"><Phone className="h-4 w-4 shrink-0 text-brand" /> (+57) 321 756 0178</li>
              <li className="flex gap-3"><Mail className="h-4 w-4 shrink-0 text-brand" /> contacto@tunorte.co</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} Tu Norte TV. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-brand">Política de Privacidad</Link>
            <Link to="/" className="hover:text-brand">Términos y Condiciones</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
