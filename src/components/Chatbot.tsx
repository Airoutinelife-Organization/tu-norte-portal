import { useState, useRef, useEffect } from "react";
import { Send, X, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
const noriAvatar = "/images/nori-avatar.png";

type Msg = {
  role: "bot" | "user";
  text: string;
  actions?: { label: string; to?: string; href?: string; reply?: string; intent?: string }[];
};

type LeadStep = "idle" | "name" | "phone" | "address" | "plan" | "done";
type Lead = { name?: string; phone?: string; address?: string; plan?: string };

const initialMsg: Msg = {
  role: "bot",
  text: "¡Hola! Soy Nori 👋 Tu asistente virtual de Tu Norte TV. ¿Cómo puedo ayudarte hoy?",
  actions: [
    { label: "🛒 Quiero contratar", reply: "Quiero contratar un plan", intent: "buy" },
    { label: "Mi internet no funciona", reply: "Mi internet no funciona" },
    { label: "Pagar mi factura", reply: "Quiero pagar mi factura" },
    { label: "Verificar cobertura", reply: "Quiero verificar cobertura" },
  ],
};

const PLAN_OPTIONS = [
  "Internet 100 Mbps",
  "Internet 300 Mbps",
  "Internet 600 Mbps",
  "Combo Internet + TV",
  "Solo TV",
  "Aún no estoy seguro",
];

function botReply(text: string): Msg {
  const t = text.toLowerCase();
  if (t.includes("internet") && (t.includes("no funciona") || t.includes("falla") || t.includes("lento"))) {
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
  return {
    role: "bot",
    text: "Te puedo ayudar con cobertura, fallas, facturas, planes o tickets. ¿Qué necesitas?",
    actions: [
      { label: "🛒 Quiero contratar", reply: "Quiero contratar un plan", intent: "buy" },
      { label: "Reportar falla", to: "/diagnostico" },
      { label: "Pagar factura", to: "/pagar" },
      { label: "Hablar con asesor", href: "https://wa.me/573217560178" },
    ],
  };
}

function isBuyIntent(t: string) {
  const s = t.toLowerCase();
  return (
    s.includes("contratar") ||
    s.includes("comprar") ||
    s.includes("adquirir") ||
    s.includes("quiero un plan") ||
    s.includes("quiero el plan") ||
    s.includes("hire") ||
    s.includes("contratación") ||
    (s.includes("plan") && (s.includes("quiero") || s.includes("nuevo")))
  );
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([initialMsg]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [leadStep, setLeadStep] = useState<LeadStep>("idle");
  const [lead, setLead] = useState<Lead>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const pushBot = (msg: Msg, delay = 600) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, msg]);
    }, delay);
  };

  const startBuyFlow = () => {
    setLead({});
    setLeadStep("name");
    pushBot({
      role: "bot",
      text: "¡Excelente decisión! 🎉 Te ayudo a contratar en menos de 1 minuto. Para personalizar tu oferta, necesito unos datos.\n\n👤 ¿Cuál es tu nombre completo?",
    });
  };

  const handleLeadInput = (value: string) => {
    const v = value.trim();
    if (!v) return;

    if (leadStep === "name") {
      if (v.length < 2) {
        pushBot({ role: "bot", text: "Por favor ingresa un nombre válido 🙂" });
        return;
      }
      setLead((l) => ({ ...l, name: v }));
      setLeadStep("phone");
      pushBot({
        role: "bot",
        text: `Mucho gusto, ${v.split(" ")[0]} ✨\n\n📱 ¿A qué número de celular podemos contactarte?`,
      });
      return;
    }

    if (leadStep === "phone") {
      const digits = v.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        pushBot({ role: "bot", text: "Ese número no parece válido. ¿Puedes verificarlo? (ej: 3217560178)" });
        return;
      }
      setLead((l) => ({ ...l, phone: digits }));
      setLeadStep("address");
      pushBot({
        role: "bot",
        text: "📍 Perfecto. ¿En qué dirección y barrio te gustaría instalar el servicio?",
      });
      return;
    }

    if (leadStep === "address") {
      if (v.length < 5) {
        pushBot({ role: "bot", text: "Necesito una dirección un poco más completa para verificar cobertura 🗺️" });
        return;
      }
      setLead((l) => ({ ...l, address: v }));
      setLeadStep("plan");
      pushBot({
        role: "bot",
        text: "🎯 Último paso: ¿qué servicio te interesa?",
        actions: PLAN_OPTIONS.map((p) => ({ label: p, reply: p })),
      });
      return;
    }

    if (leadStep === "plan") {
      const finalLead: Lead = { ...lead, plan: v };
      setLead(finalLead);
      setLeadStep("done");

      const summary =
        `*Nueva solicitud de contratación — Tu Norte TV*\n\n` +
        `👤 Nombre: ${finalLead.name}\n` +
        `📱 Teléfono: ${finalLead.phone}\n` +
        `📍 Dirección: ${finalLead.address}\n` +
        `🎯 Servicio: ${finalLead.plan}\n\n` +
        `¡Hola! Quiero contratar este plan, ¿me ayudan a continuar?`;

      const waUrl = `https://wa.me/573217560178?text=${encodeURIComponent(summary)}`;

      pushBot(
        {
          role: "bot",
          text:
            `¡Listo, ${(finalLead.name || "").split(" ")[0]}! ✅\n\n` +
            `Resumen de tu solicitud:\n` +
            `• Plan: ${finalLead.plan}\n` +
            `• Dirección: ${finalLead.address}\n` +
            `• Contacto: ${finalLead.phone}\n\n` +
            `Un asesor te contactará en minutos. Mientras tanto, puedes confirmar por WhatsApp o agendar tu instalación 👇`,
          actions: [
            { label: "💬 Continuar por WhatsApp", href: waUrl },
            { label: "📅 Agendar instalación", to: "/agendar" },
            { label: "Ver todos los planes", to: "/planes" },
          ],
        },
        700,
      );
      return;
    }
  };

  const send = (text: string, intent?: string) => {
    const v = text.trim();
    if (!v) return;
    setMsgs((m) => [...m, { role: "user", text: v }]);
    setInput("");

    // Buy intent triggers guided flow
    if (intent === "buy" || (leadStep === "idle" && isBuyIntent(v))) {
      startBuyFlow();
      return;
    }

    // Active lead capture flow
    if (leadStep !== "idle" && leadStep !== "done") {
      handleLeadInput(v);
      return;
    }

    // Default Q&A
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, botReply(v)]);
    }, 700);
  };

  const placeholder =
    leadStep === "name"
      ? "Escribe tu nombre completo..."
      : leadStep === "phone"
      ? "Tu número de celular..."
      : leadStep === "address"
      ? "Dirección y barrio..."
      : leadStep === "plan"
      ? "Escribe o elige un plan..."
      : "Escribe tu mensaje...";

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

          {leadStep !== "idle" && leadStep !== "done" && (
            <div className="px-4 py-2 bg-brand/5 border-b border-border flex items-center gap-2 text-[11px] font-medium text-primary">
              <span>Contratación</span>
              <div className="flex-1 flex gap-1">
                {(["name", "phone", "address", "plan"] as LeadStep[]).map((s, i) => {
                  const order = ["name", "phone", "address", "plan"];
                  const active = order.indexOf(leadStep) >= i;
                  return (
                    <span
                      key={s}
                      className={`h-1.5 flex-1 rounded-full transition ${active ? "bg-gradient-brand" : "bg-muted"}`}
                    />
                  );
                })}
              </div>
              <span>{["name", "phone", "address", "plan"].indexOf(leadStep) + 1}/4</span>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
            {msgs.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-soft whitespace-pre-line ${
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
                          onClick={() => send(a.reply || a.label, a.intent)}
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
              placeholder={placeholder}
              type={leadStep === "phone" ? "tel" : "text"}
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
