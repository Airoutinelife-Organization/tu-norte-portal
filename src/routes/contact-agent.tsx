import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import ContactAgentDashboard from "@/components/ContactAgentDashboard";

type ContactAgentSearch = {
  agente?: string;
};

export const Route = createFileRoute("/contact-agent")({
  validateSearch: (search: Record<string, unknown>): ContactAgentSearch => {
    return {
      agente: search.agente as string | undefined,
    };
  },
  component: ContactAgentPage,
});

function ContactAgentPage() {
  const { agente } = Route.useSearch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("tunorte_admin_session") !== "ok") {
      window.location.href = "/admin";
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) return <div className="min-h-screen bg-background" />;

  return (
    <ContactAgentDashboard
      agente={agente}
      onLogout={() => {
        localStorage.removeItem("tunorte_admin_session");
        window.location.href = "/admin";
      }}
    />
  );
}
