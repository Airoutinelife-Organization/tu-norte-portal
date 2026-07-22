import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Real map of Cúcuta using Leaflet + CartoDB dark tiles.
 * Overlays green polylines (active fiber) and orange dashed lines (in construction),
 * plus animated markers on the main POPs.
 */

// Approx real coordinates
const NODES: { name: string; coords: [number, number]; tier: 1 | 2 | 3 }[] = [
  { name: "Centro", coords: [7.8939, -72.5078], tier: 1 },
  { name: "La Libertad", coords: [7.9075, -72.4945], tier: 2 },
  { name: "Atalaya", coords: [7.8695, -72.5175], tier: 1 },
  { name: "San Mateo", coords: [7.8785, -72.4845], tier: 2 },
  { name: "Los Patios", coords: [7.8355, -72.5015], tier: 1 },
  { name: "Villa del Rosario", coords: [7.8365, -72.4755], tier: 1 },
  { name: "El Zulia", coords: [7.9365, -72.6015], tier: 2 },
  { name: "Quinta Oriental", coords: [7.9055, -72.5085], tier: 3 },
  { name: "Aeropuerto Camilo Daza", coords: [7.9275, -72.5115], tier: 3 },
  { name: "Motilones", coords: [7.8845, -72.5155], tier: 3 },
];

const ACTIVE_ROUTES: [number, number][][] = [
  // Backbone: El Zulia → Centro → La Libertad → San Mateo
  [
    [7.9365, -72.6015],
    [7.92, -72.55],
    [7.9075, -72.5085],
    [7.8939, -72.5078],
    [7.9075, -72.4945],
    [7.8785, -72.4845],
  ],
  // Centro → Atalaya → Motilones
  [
    [7.8939, -72.5078],
    [7.885, -72.513],
    [7.8695, -72.5175],
    [7.8845, -72.5155],
  ],
  // Centro → Los Patios
  [
    [7.8939, -72.5078],
    [7.87, -72.505],
    [7.8355, -72.5015],
  ],
  // Centro → Aeropuerto
  [
    [7.8939, -72.5078],
    [7.91, -72.5095],
    [7.9275, -72.5115],
  ],
  // Los Patios → Villa del Rosario
  [
    [7.8355, -72.5015],
    [7.836, -72.488],
    [7.8365, -72.4755],
  ],
];

const BUILDING_ROUTES: [number, number][][] = [
  // Villa del Rosario → frontera
  [
    [7.8365, -72.4755],
    [7.825, -72.465],
    [7.815, -72.46],
  ],
  // El Zulia extension oeste
  [
    [7.9365, -72.6015],
    [7.945, -72.615],
    [7.955, -72.625],
  ],
  // Atalaya extension sur
  [
    [7.8695, -72.5175],
    [7.855, -72.525],
    [7.845, -72.535],
  ],
];

export default function CucutaFiberMapLeaflet({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [7.885, -72.51],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    });
    mapRef.current = map;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution: "© OpenStreetMap © CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    // Active fiber lines — glow + core (thicker for readability)
    for (const path of ACTIVE_ROUTES) {
      L.polyline(path, {
        color: "#059669",
        weight: 12,
        opacity: 0.25,
        lineCap: "round",
      }).addTo(map);
      L.polyline(path, {
        color: "#10b981",
        weight: 5,
        opacity: 1,
        lineCap: "round",
      }).addTo(map);
    }

    // Under-construction — dashed orange
    for (const path of BUILDING_ROUTES) {
      L.polyline(path, {
        color: "#ea580c",
        weight: 10,
        opacity: 0.22,
        lineCap: "round",
      }).addTo(map);
      L.polyline(path, {
        color: "#fb923c",
        weight: 3,
        opacity: 1,
        dashArray: "10 8",
        className: "fiber-dash",
      }).addTo(map);
    }

    // Nodes as pulsing divIcons
    for (const node of NODES) {
      const size = node.tier === 1 ? 22 : node.tier === 2 ? 16 : 12;
      const color = node.tier === 1 ? "#34d399" : node.tier === 2 ? "#22d3ee" : "#a7f3d0";
      const icon = L.divIcon({
        className: "fiber-node-icon",
        html: `
          <div class="fiber-node" style="--c:${color};--s:${size}px">
            <span class="fiber-node-pulse"></span>
            <span class="fiber-node-core"></span>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
      L.marker(node.coords, { icon })
        .addTo(map)
        .bindTooltip(node.name, {
          permanent: node.tier === 1,
          direction: "top",
          offset: [0, -size / 2],
          className: "fiber-tooltip",
        });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <>
      <style>{`
        .leaflet-container { background: #0b1220; font-family: ui-sans-serif, system-ui; }
        .fiber-node-icon { background: transparent; border: 0; }
        .fiber-node {
          position: relative; width: var(--s); height: var(--s);
          display: flex; align-items: center; justify-content: center;
        }
        .fiber-node-pulse {
          position: absolute; inset: 0; border-radius: 999px;
          background: var(--c); opacity: 0.45;
          animation: fiber-pulse 2.2s ease-out infinite;
        }
        .fiber-node-core {
          position: relative; width: 60%; height: 60%;
          border-radius: 999px; background: #ecfdf5;
          box-shadow: 0 0 12px 2px var(--c), 0 0 4px var(--c);
        }
        @keyframes fiber-pulse {
          0% { transform: scale(0.6); opacity: 0.6; }
          80% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .fiber-dash { animation: fiber-march 1.2s linear infinite; }
        @keyframes fiber-march {
          to { stroke-dashoffset: -36; }
        }
        .fiber-tooltip {
          background: rgba(2,6,23,0.85) !important;
          color: #ecfdf5 !important;
          border: 1px solid rgba(52,211,153,0.5) !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          padding: 3px 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
        }
        .fiber-tooltip::before { display: none !important; }
        .leaflet-control-attribution {
          background: rgba(2,6,23,0.7) !important;
          color: #94a3b8 !important;
        }
        .leaflet-control-attribution a { color: #34d399 !important; }
        .leaflet-control-zoom a {
          background: rgba(2,6,23,0.85) !important;
          color: #ecfdf5 !important;
          border-color: rgba(52,211,153,0.35) !important;
        }
      `}</style>
      <div ref={containerRef} className={className} />
    </>
  );
}
