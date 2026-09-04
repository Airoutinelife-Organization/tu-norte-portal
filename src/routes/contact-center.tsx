import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import ContactCenterDashboard from "@/components/ContactCenterDashboard";

export const Route = createFileRoute("/contact-center")({
  component: ContactCenterPage,
});

function ContactCenterPage() {
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
    <ContactCenterDashboard
      onLogout={() => {
        localStorage.removeItem("tunorte_admin_session");
        window.location.href = "/admin";
      }}
    />
  );
}
