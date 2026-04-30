import { useState, useRef, useEffect } from "react";
import { Send, X, Sparkles, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import noriAvatar from "@/assets/nori-avatar.png";

type Msg = {
  role: "bot" | "user";
  text: string;
  actions?: { label: string; to?: string; href?: string; reply?: string }[];
};

const initialMsg: Msg = {
  role: "bot",
  text: "¡Hola! Soy Nori 👋 Tu asistente virtual de Tu Norte TV. ¿Cómo puedo ayudarte hoy?",
  actions: [
    { label: "Mi internet no funciona", reply: "Mi internet no funciona" },
    { label: "Pagar mi factura", reply: "Quiero pagar mi factura" },
    { label: "Verificar cobertura", reply: "Quiero verificar cobertura" },
    { label: "Estado de mi PQR", reply: "Estado de mi PQR" },
  ],
};

function botReply(text: string): Msg {
  const t = text.toLowerCase();
  if (t.includes("internet") || t.includes("falla") || t.includes("no funciona") || t.includes("lento")) {
    return {
      role: "bot",
      text: "Lamento la molestia 😔. Vamos a solucionarlo. Inicia el diagnóstico guiado y revisamos tu conexión paso a paso.",
      actions: [
        { label: "Iniciar diagnóstico", to: "/diagnostico" },
        { label: "Hablar con un asesor", to: "/soporte" },
      ],
    };
  }
  if (t.includes("factura") || t.includes("pagar") || t.includes("pago")) {
    return {
      role: "bot",
      text: "Puedes ver y pagar tu factura del mes en línea, sin filas. ¿Quieres ir ahora?",
      actions: [{ label: "Ver mi factura", to: "/pagar" }],
    };
  }
  if (t.includes("cobertura") || t.includes("dirección") || t.includes("barrio")) {
    return {
      role: "bot",
      text: "Verifico cobertura al instante. Comparte tu dirección o usa nuestro mapa interactivo.",
      actions: [{ label: "Verificar cobertura", to: "/cobertura" }],
    };
  }
  if (t.includes("instalación") || t.includes("agendar") || t.includes("instalar")) {
    return {
      role: "bot",
      text: "¡Genial! Puedes agendar tu instalación en 2 minutos. Elige día y franja.",
      actions: [{ label: "Agendar instalación", to: "/agendar" }],
    };
  }
  if (t.includes("pqr") || t.includes("ticket") || t.includes("reclamo") || t.includes("queja")) {
    return {
      role: "bot",
      text: "Puedes radicar una nueva PQR o consultar el estado de las existentes en tu panel.",
      actions: [
        { label: "Ver mis tickets", to: "/mis-tickets" },
        { label: "Radicar nueva PQR", to: "/pqr" },
      ],
    };
  }
  if (t.includes("plan") || t.includes("contratar") || t.includes("velocidad") || t.includes("megas")) {
    return {
      role: "bot",
      text: "Te ayudo a encontrar el plan ideal con 3 preguntas rápidas. ¿Vamos?",
      actions: [
        { label: "Encontrar mi plan", to: "/recomendador" },
        { label: "Ver todos los planes", to: "/planes" },
      ],
    };
  }
  return {
    role: "bot",
    text: "Te puedo ayudar con cobertura, fallas, facturas, planes o tickets. ¿Qué necesitas?",
    actions: [
      { label: "Reportar falla", to: "/diagnostico" },
      { label: "Pagar factura", to: "/pagar" },
      { label: "Hablar con asesor", href: "https://wa.me/573217560178" },
    ],
  };
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([initialMsg]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const send = (text: string) => {
    const v = text.trim();
    if (!v) return;
    setMsgs((m) => [...m, { role: "user", text: v }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, botReply(v)]);
    }, 700);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 pl-2 pr-5 py-2 rounded-full bg-gradient-brand text-primary-foreground shadow-glow hover:scale-105 transition-all animate-float"
          aria-label="Abrir chat con Nori"
        >
          <div className="relative w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden">
            <img src={noriAvatar} alt="" className="w-10 h-10 object-contain" width={40} height={40} />
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-success ring-2 ring-white" />
          </div>
          <div className="text-left pr-1">
            <div className="text-sm font-semibold leading-tight">Hola, soy Nori</div>
            <div className="text-[11px] opacity-90">Resuelvo tus dudas al instante</div>
          </div>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-2rem)] bg-background rounded-3xl flex flex-col overflow-hidden shadow-glow border border-border animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-gradient-brand flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center ring-2 ring-white/40 overflow-hidden">
              <img src={noriAvatar} alt="" className="w-10 h-10 object-contain" width={40} height={40} />
            </div>
            <div className="flex-1 text-primary-foreground">
              <div className="font-semibold flex items-center gap-1.5">
                Nori <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] opacity-90 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Asistente virtual · en línea
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground p-1" aria-label="Cerrar">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
            {msgs.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-soft ${
                    m.role === "user"
                      ? "bg-gradient-brand text-primary-foreground rounded-br-sm"
                      : "bg-white text-foreground border border-border rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
                {m.actions && m.role === "bot" && (
                  <div className="flex flex-wrap gap-2 mt-2 max-w-[85%]">
                    {m.actions.map((a, j) =>
                      a.to ? (
                        <Link
                          key={j}
                          to={a.to}
                          onClick={() => setOpen(false)}
                          className="text-xs px-3 py-1.5 rounded-full bg-white border border-brand/40 text-primary font-medium hover:bg-brand hover:text-primary-foreground transition shadow-soft"
                        >
                          {a.label}
                        </Link>
                      ) : a.href ? (
                        <a
                          key={j}
                          href={a.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs px-3 py-1.5 rounded-full bg-white border border-brand/40 text-primary font-medium hover:bg-brand hover:text-primary-foreground transition shadow-soft"
                        >
                          {a.label}
                        </a>
                      ) : (
                        <button
                          key={j}
                          onClick={() => send(a.reply || a.label)}
                          className="text-xs px-3 py-1.5 rounded-full bg-white border border-brand/40 text-primary font-medium hover:bg-brand hover:text-primary-foreground transition shadow-soft"
                        >
                          {a.label}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-white border border-border rounded-bl-sm flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="p-3 border-t border-border flex items-center gap-2 bg-white"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 ring-brand"
              maxLength={500}
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center shadow-soft hover:scale-105 transition"
              aria-label="Enviar"
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </button>
          </form>

          <a
            href="https://wa.me/573217560178"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-center py-2 bg-success/10 text-success font-medium border-t border-border hover:bg-success/20 transition"
          >
            ¿Prefieres WhatsApp? Habla con un asesor humano →
          </a>
        </div>
      )}
    </>
  );
}
