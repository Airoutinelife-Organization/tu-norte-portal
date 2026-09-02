import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import AdminDashboard from "@/components/AdminDashboard";

export const Route = createFileRoute("/ventas")({
  component: VentasPage,
});

function VentasPage() {
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
    <AdminDashboard
      mode="ventas"
      onLogout={() => {
        localStorage.removeItem("tunorte_admin_session");
        window.location.href = "/admin";
      }}
    />
  );
}
