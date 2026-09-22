import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, Lock } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tu Norte | Centro de Operaciones" },
      { name: "description", content: "Portal interno seguro de Tu Norte. Acceso autorizado únicamente." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("TuNorte2026*");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "TuNorte2026*") {
      localStorage.setItem("tunorte_admin_session", "ok");
      navigate({ to: "/admin" });
    } else {
      setError(true);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-4 bg-[#0B1121]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <video 
          className="h-full w-full object-cover motion-reduce:hidden opacity-40" 
          src="https://tu-norte-command-center.contact-4b1.workers.dev/tu-norte-tech-loop.webm" 
          autoPlay 
          loop 
          muted 
          playsInline 
          preload="auto"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
      </div>
      <section className="relative z-10 w-full max-w-md">
        <header className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-center">
          <img 
            src="https://tu-norte-command-center.contact-4b1.workers.dev/tu-norte-logo-white-3d.png" 
            alt="Tu Norte TV" 
            className="mx-auto h-auto w-32 drop-shadow-[0_16px_30px_var(--shadow-glow)] sm:w-36"
          />
          <p className="mt-1.5 font-display text-[0.72rem] font-bold uppercase tracking-[0.32em] text-brand">Centro de Operaciones</p>
          <p className="mt-1 text-xs text-muted-foreground">Acceso interno autorizado</p>
        </header>
        <form onSubmit={handleLogin} style={{animationDelay: '120ms'}} className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards mt-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 sm:p-6 shadow-2xl">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground" htmlFor="identifier">
                Usuario o correo electrónico
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(false);
                }}
                className="flex w-full px-3 py-2 text-base shadow-sm h-11 rounded-xl border border-white/10 bg-black/20 text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/60 md:text-sm" 
                id="identifier" 
                required 
                autoComplete="username" 
                placeholder="nombre@tunorte.com" 
                name="identifier" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  className="flex w-full px-3 py-2 text-base shadow-sm h-11 rounded-xl border border-white/10 bg-black/20 pr-12 text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/60 md:text-sm" 
                  id="password" 
                  required 
                  autoComplete="current-password" 
                  placeholder="••••••••" 
                  name="password" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Mostrar contraseña" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-white">
                  <Eye className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-500 font-medium">Credenciales incorrectas.</p>
            )}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5">
                <input type="checkbox" id="remember" name="remember" className="h-4 w-4 rounded-sm border-white/20 bg-black/20 text-brand focus:ring-brand" />
                <label className="text-sm font-normal text-muted-foreground" htmlFor="remember">Recordarme</label>
              </div>
              <a href="#" className="text-sm font-medium text-brand underline-offset-4 transition-colors hover:text-white hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <button className="inline-flex items-center justify-center gap-2 bg-gradient-brand shadow-glow hover:opacity-90 px-4 py-2 h-11 w-full rounded-xl font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5" type="submit">
              Ingresar
            </button>
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 border-t border-white/10 pt-4 text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Entorno interno seguro
          </div>
        </form>
        <footer style={{animationDelay: '260ms'}} className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards mt-4 flex items-center justify-center gap-2 text-center">
          <p className="text-[0.68rem] tracking-[0.12em] text-muted-foreground/80">AI Technology powered by AI Routine Partner</p>
          <a href="https://airoutinepartner.com/" target="_blank" rel="noopener noreferrer" className="group inline-flex shrink-0">
            <img 
              src="https://tu-norte-command-center.contact-4b1.workers.dev/ai-routine-partner-footer.png" 
              alt="AI Routine Partner" 
              className="h-auto w-12 opacity-90 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.06] group-hover:opacity-100" 
            />
          </a>
        </footer>
      </section>
    </main>
  );
}
