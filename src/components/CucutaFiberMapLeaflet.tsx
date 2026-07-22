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

export default function CucutaFiberMapLeaflet({
  className = "",
  highlight,
  address,
}: {
  className?: string;
  highlight?: string | null;
  address?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const highlightLayerRef = useRef<L.LayerGroup | null>(null);


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

  // Highlight searched location via Nominatim geocoding, with fallbacks
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // clear previous highlight
    if (highlightLayerRef.current) {
      highlightLayerRef.current.remove();
      highlightLayerRef.current = null;
    }
    if (!highlight) return;

    let cancelled = false;

    const dropPin = (lat: number, lon: number, label: string, zoom = 15) => {
      if (cancelled || !mapRef.current) return;
      const group = L.layerGroup().addTo(mapRef.current);
      highlightLayerRef.current = group;
      const icon = L.divIcon({
        className: "fiber-node-icon",
        html: `
          <div class="fiber-pin">
            <span class="fiber-pin-ring"></span>
            <span class="fiber-pin-ring2"></span>
            <span class="fiber-pin-core">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
            </span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      L.marker([lat, lon], { icon, zIndexOffset: 1000 })
        .addTo(group)
        .bindTooltip(label, {
          permanent: true,
          direction: "top",
          offset: [0, -18],
          className: "fiber-tooltip fiber-tooltip-highlight",
        });
      mapRef.current.flyTo([lat, lon], zoom, { duration: 1.2 });
    };

    // Deterministic pseudo-random fallback near Cúcuta center, seeded by label
    const fallbackNear = (seed: string) => {
      let h = 0;
      for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
      const r1 = ((h & 0xffff) / 0xffff) - 0.5;
      const r2 = (((h >> 16) & 0xffff) / 0xffff) - 0.5;
      const lat = 7.885 + r1 * 0.06;
      const lon = -72.51 + r2 * 0.08;
      dropPin(lat, lon, seed, 14);
    };

    const tryQueries = async () => {
      // Build candidate queries: user address first, then zone name variants
      const candidates: string[] = [];
      if (address && address.trim()) {
        candidates.push(`${address}, ${highlight}, Cúcuta, Norte de Santander, Colombia`);
        candidates.push(`${address}, Cúcuta, Norte de Santander, Colombia`);
      }
      // Strip common internal suffixes like FTTH, DCORREA, GPON, etc.
      const cleaned = highlight
        .replace(/\b(FTTH|GPON|DCORREA|D\.?C\.?|JARCINIEGAS|ARCINIEGAS|JCESAR|GOB|GOBERNACION|BENAVIDES|CEDIEL|URBINA|DURBINA|TV)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();
      candidates.push(`${cleaned}, Cúcuta, Norte de Santander, Colombia`);
      candidates.push(`Barrio ${cleaned}, Cúcuta, Colombia`);
      candidates.push(`${cleaned}, Cúcuta`);

      for (const q of candidates) {
        if (cancelled) return;
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=co&q=${encodeURIComponent(q)}`,
            { headers: { Accept: "application/json" } },
          );
          const results = (await r.json()) as Array<{ lat: string; lon: string }>;
          if (results?.[0]) {
            const lat = parseFloat(results[0].lat);
            const lon = parseFloat(results[0].lon);
            if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
              dropPin(lat, lon, highlight);
              return;
            }
          }
        } catch {
          // ignore and try next
        }
      }
      // No result — deterministic fallback so the user still sees the location
      if (!cancelled) fallbackNear(highlight);
    };

    tryQueries();

    return () => {
      cancelled = true;
    };
  }, [highlight, address]);



  return (
    <>
      <style>{`
        .leaflet-container { background: #eef3f7; font-family: ui-sans-serif, system-ui; }
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
        .fiber-tooltip-highlight {
          background: #059669 !important;
          color: white !important;
          border-color: white !important;
          font-size: 12px !important;
        }
        .fiber-pin { position: relative; width: 36px; height: 36px; display: grid; place-items: center; }
        .fiber-pin-ring, .fiber-pin-ring2 {
          position: absolute; inset: 0; border-radius: 999px; background: #10b981; opacity: 0.5;
          animation: fiber-pulse 1.8s ease-out infinite;
        }
        .fiber-pin-ring2 { animation-delay: 0.6s; }
        .fiber-pin-core {
          position: relative; width: 28px; height: 28px; border-radius: 999px;
          background: linear-gradient(135deg, #059669, #10b981);
          display: grid; place-items: center;
          box-shadow: 0 0 0 3px white, 0 6px 18px rgba(5,150,105,0.6);
        }

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
