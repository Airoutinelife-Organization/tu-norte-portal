import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const RealMap = lazy(() => import("./CucutaFiberMapLeaflet"));

/**
 * Public wrapper — renders the real Leaflet map only on the client.
 * Leaflet touches window/document on import, so it must be gated.
 */
export function CucutaFiberMap({ className = "" }: { className?: string }) {
  return (
    <ClientOnly
      fallback={
        <div className={className} style={{ background: "oklch(0.18 0.05 250)" }} />
      }
    >
      <Suspense
        fallback={
          <div className={className} style={{ background: "oklch(0.18 0.05 250)" }} />
        }
      >
        <RealMap className={className} />
      </Suspense>
    </ClientOnly>
  );
}
