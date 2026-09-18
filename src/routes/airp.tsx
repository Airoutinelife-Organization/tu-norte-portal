import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import AIRPDashboard from "@/components/AIRPDashboard";

export const Route = createFileRoute("/airp")({
  component: AIRPPage,
});

import { Brain } from "lucide-react";
import { LoginForm } from "./admin";

function AIRPPage() {
  const [ready, setReady] = useState(false);
  const STORAGE_KEY = "tunorte_airp_session";

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "ok") {
      setReady(true);
    }
  }, []);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted px-4 py-12">
        <div className="flex w-full max-w-sm flex-col">
          <LoginForm
            title="AIRP"
            description="AI Routine Partner"
            icon={Brain}
            expectedUser="admin"
            expectedPass="AIRP2026"
            onSuccess={() => {
              localStorage.setItem(STORAGE_KEY, "ok");
              setReady(true);
            }}
          />
        </div>
      </main>
    );
  }

  return (
    <AIRPDashboard
      onLogout={() => {
        localStorage.removeItem(STORAGE_KEY);
        setReady(false);
      }}
    />
  );
}
