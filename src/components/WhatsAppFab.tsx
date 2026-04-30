import { MessageCircle } from "lucide-react";

export function WhatsAppFab() {
  return (
    <a
      href="https://wa.me/573217560178?text=Hola%20Tu%20Norte%20TV%2C%20quiero%20informaci%C3%B3n"
      target="_blank"
      rel="noreferrer"
      aria-label="Chat por WhatsApp"
      className="pulse-ring fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground shadow-glow transition hover:scale-110"
    >
      <MessageCircle className="h-6 w-6" fill="currentColor" />
    </a>
  );
}
