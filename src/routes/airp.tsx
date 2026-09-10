import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import AIRPDashboard from "@/components/AIRPDashboard";

export const Route = createFileRoute("/airp")({
  component: AIRPPage,
});

function AIRPPage() {
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
    <AIRPDashboard
      onLogout={() => {
        localStorage.removeItem("tunorte_admin_session");
        window.location.href = "/admin";
      }}
    />
  );
}
