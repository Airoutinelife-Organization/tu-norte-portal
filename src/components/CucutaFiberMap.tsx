import { useId } from "react";

/**
 * Isometric 3D-style fiber rollout map of Cúcuta.
 * - Green glowing lines = active fiber
 * - Orange dashed lines = under construction
 * - Extruded building blocks with depth
 * - Animated data pulses traveling the network
 */
export function CucutaFiberMap({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");

  // Isometric projection helpers (30° angle)
  const iso = (x: number, y: number, z = 0) => {
    const ix = (x - y) * 0.866;
    const iy = (x + y) * 0.5 - z;
    return { x: ix + 500, y: iy + 120 };
  };

  // Active fiber network paths (in iso-projected screen coords)
  const activeRoutes = [
    "M 120 360 Q 300 320 480 340 T 820 320",
    "M 480 340 L 500 240 L 560 200",
    "M 560 200 L 660 220 L 760 260",
    "M 500 240 L 420 170 L 340 150",
    "M 820 320 L 870 400 L 900 480",
    "M 560 200 L 600 140 L 680 120",
    "M 340 150 L 260 130 L 190 150",
  ];

  const buildingRoutes = [
    "M 900 480 L 950 540",
    "M 190 150 L 130 170",
    "M 760 260 L 860 240 L 920 260",
    "M 420 170 L 400 100",
  ];

  const nodes = [
    { x: 560, y: 200, label: "Centro", size: 8, tier: 1 },
    { x: 500, y: 240, label: "La Libertad", size: 6, tier: 2 },
    { x: 760, y: 260, label: "Atalaya", size: 7, tier: 1 },
    { x: 480, y: 340, label: "San Mateo", size: 6, tier: 2 },
    { x: 820, y: 320, label: "Los Patios", size: 7, tier: 1 },
    { x: 340, y: 150, label: "El Zulia", size: 6, tier: 2 },
    { x: 900, y: 480, label: "V. del Rosario", size: 7, tier: 1 },
    { x: 120, y: 360, label: "Hub Oeste", size: 5, tier: 3 },
    { x: 680, y: 120, label: "Quintas", size: 5, tier: 3 },
  ];

  // Generate isometric building blocks
  const buildings = Array.from({ length: 70 }).map((_, i) => {
    const gx = (i % 10);
    const gy = Math.floor(i / 10);
    const baseX = 60 + gx * 90 + (i * 17) % 25;
    const baseY = 80 + gy * 75 + (i * 13) % 20;
    const w = 28 + (i % 4) * 8;
    const h = 22 + (i % 3) * 6;
    const depth = 8 + ((i * 7) % 22);
    return { x: baseX, y: baseY, w, h, depth, hue: 220 + (i % 30) };
  });

  return (
    <svg
      viewBox="0 0 1000 600"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.28 0.09 250)" />
          <stop offset="60%" stopColor="oklch(0.20 0.07 245)" />
          <stop offset="100%" stopColor="oklch(0.14 0.05 250)" />
        </linearGradient>
        <linearGradient id={`ground-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.22 0.04 240)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="oklch(0.12 0.03 250)" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`bldg-top-${id}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id={`bldg-left-${id}`} x1="0" x2="1">
          <stop offset="0%" stopColor="#0369a1" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#082f49" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`bldg-right-${id}`} x1="0" x2="1">
          <stop offset="0%" stopColor="#0c4a6e" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
        </linearGradient>
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`glow-sm-${id}`}>
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id={`iso-grid-${id}`} width="40" height="23" patternUnits="userSpaceOnUse">
          <path d="M 0 11.5 L 20 0 L 40 11.5 L 20 23 Z" fill="none" stroke="rgba(56,189,248,0.08)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Sky/background */}
      <rect width="1000" height="600" fill={`url(#sky-${id})`} />

      {/* Ground plane with isometric grid */}
      <polygon points="0,220 1000,220 1000,600 0,600" fill={`url(#ground-${id})`} />
      <rect y="220" width="1000" height="380" fill={`url(#iso-grid-${id})`} opacity="0.6" />

      {/* Distant horizon glow */}
      <ellipse cx="500" cy="220" rx="500" ry="30" fill="#38bdf8" opacity="0.12" filter={`url(#glow-${id})`} />

      {/* River Pamplonita — flowing ribbon with depth */}
      <path
        d="M -20 560 Q 200 500 380 520 T 700 480 T 1020 440"
        stroke="rgba(14,165,233,0.35)"
        strokeWidth="18"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M -20 555 Q 200 495 380 515 T 700 475 T 1020 435"
        stroke="rgba(125,211,252,0.6)"
        strokeWidth="3"
        fill="none"
      >
        <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="4s" repeatCount="indefinite" />
      </path>

      {/* Isometric building blocks (extruded) */}
      {buildings.map((b, i) => {
        const d = b.depth;
        const topPts = `${b.x},${b.y} ${b.x + b.w},${b.y - d * 0.4} ${b.x + b.w},${b.y - d * 0.4 + b.h} ${b.x},${b.y + b.h}`;
        return (
          <g key={i} opacity="0.55">
            {/* right face */}
            <polygon
              points={`${b.x + b.w},${b.y - d * 0.4} ${b.x + b.w + d * 0.6},${b.y - d * 0.4 + d * 0.3} ${b.x + b.w + d * 0.6},${b.y + b.h + d * 0.3 - d * 0.4} ${b.x + b.w},${b.y + b.h - d * 0.4}`}
              fill={`url(#bldg-right-${id})`}
            />
            {/* front top face */}
            <polygon points={topPts} fill={`url(#bldg-top-${id})`} stroke="rgba(56,189,248,0.25)" strokeWidth="0.5" />
            {/* window dots */}
            {i % 3 === 0 && (
              <circle cx={b.x + b.w / 2} cy={b.y + b.h / 2} r="1.2" fill="#fef08a" opacity="0.7">
                <animate attributeName="opacity" values="0.7;0.2;0.7" dur={`${2 + (i % 4)}s`} repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })}

      {/* Under-construction routes (orange dashed) */}
      {buildingRoutes.map((d, i) => (
        <g key={`b-${i}`}>
          <path d={d} stroke="rgba(251,146,60,0.25)" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path
            d={d}
            stroke="#fb923c"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="10 8"
            filter={`url(#glow-${id})`}
          >
            <animate attributeName="stroke-dashoffset" from="0" to="-36" dur="1.2s" repeatCount="indefinite" />
          </path>
        </g>
      ))}

      {/* Active fiber routes (green glow + traveling pulses) */}
      {activeRoutes.map((d, i) => (
        <g key={`a-${i}`}>
          <path d={d} stroke="rgba(16,185,129,0.2)" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path
            d={d}
            stroke="#34d399"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            filter={`url(#glow-${id})`}
          />
          <circle r="4.5" fill="#ecfdf5" filter={`url(#glow-${id})`}>
            <animateMotion dur={`${3 + (i % 3)}s`} repeatCount="indefinite" path={d} />
          </circle>
          <circle r="2" fill="#a7f3d0">
            <animateMotion dur={`${3 + (i % 3)}s`} begin={`${(i % 3) * 0.5}s`} repeatCount="indefinite" path={d} />
          </circle>
        </g>
      ))}

      {/* Network nodes with vertical beacon */}
      {nodes.map((n, i) => {
        const beaconH = n.tier === 1 ? 45 : n.tier === 2 ? 28 : 18;
        return (
          <g key={`n-${i}`}>
            {/* Vertical light beacon */}
            <line
              x1={n.x}
              y1={n.y}
              x2={n.x}
              y2={n.y - beaconH}
              stroke="#34d399"
              strokeWidth="1.5"
              opacity="0.5"
              filter={`url(#glow-sm-${id})`}
            />
            {/* Base ring */}
            <ellipse cx={n.x} cy={n.y + 2} rx={n.size + 4} ry={(n.size + 4) * 0.4} fill="none" stroke="#10b981" strokeWidth="1" opacity="0.6">
              <animate attributeName="rx" values={`${n.size + 4};${n.size + 14};${n.size + 4}`} dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="ry" values={`${(n.size + 4) * 0.4};${(n.size + 14) * 0.4};${(n.size + 4) * 0.4}`} dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0;0.7" dur="2.8s" repeatCount="indefinite" />
            </ellipse>
            {/* Node top */}
            <circle cx={n.x} cy={n.y - beaconH} r={n.tier === 1 ? 4 : 3} fill="#ecfdf5" filter={`url(#glow-${id})`}>
              <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <circle cx={n.x} cy={n.y} r={n.size} fill="#10b981" filter={`url(#glow-sm-${id})`} />
            <circle cx={n.x} cy={n.y} r={n.size - 2} fill="#ecfdf5" />
            {/* Label */}
            <g transform={`translate(${n.x + n.size + 8}, ${n.y - beaconH - 4})`}>
              <rect x="-2" y="-10" width={n.label.length * 6.5 + 8} height="16" rx="3" fill="rgba(2,6,23,0.75)" stroke="rgba(52,211,153,0.4)" strokeWidth="0.5" />
              <text
                x="2"
                y="2"
                fill="#ecfdf5"
                fontSize="11"
                fontFamily="ui-sans-serif, system-ui"
                fontWeight="600"
              >
                {n.label}
              </text>
            </g>
          </g>
        );
      })}

      {/* Compass */}
      <g transform="translate(940, 60)" opacity="0.8">
        <circle r="24" fill="rgba(2,6,23,0.6)" stroke="rgba(52,211,153,0.4)" />
        <path d="M 0 -18 L 5 0 L 0 18 L -5 0 Z" fill="#34d399" />
        <text y="-28" textAnchor="middle" fontSize="10" fill="#ecfdf5" fontFamily="ui-sans-serif, system-ui" fontWeight="700">N</text>
      </g>

      {/* Title chip */}
      <g transform="translate(28, 28)">
        <rect width="240" height="36" rx="18" fill="rgba(2,6,23,0.7)" stroke="rgba(52,211,153,0.5)" />
        <circle cx="20" cy="18" r="5" fill="#34d399" filter={`url(#glow-sm-${id})`}>
          <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
        </circle>
        <text x="34" y="23" fill="#ecfdf5" fontSize="13" fontWeight="700" fontFamily="ui-sans-serif, system-ui">
          Red 3D en vivo · Cúcuta
        </text>
      </g>

      {/* Legend */}
      <g transform="translate(28, 540)">
        <rect width="260" height="44" rx="8" fill="rgba(2,6,23,0.7)" stroke="rgba(148,163,184,0.25)" />
        <circle cx="16" cy="16" r="4" fill="#34d399" filter={`url(#glow-sm-${id})`} />
        <text x="26" y="20" fill="#ecfdf5" fontSize="11" fontFamily="ui-sans-serif, system-ui">Fibra activa</text>
        <circle cx="16" cy="32" r="4" fill="#fb923c" filter={`url(#glow-sm-${id})`} />
        <text x="26" y="36" fill="#ecfdf5" fontSize="11" fontFamily="ui-sans-serif, system-ui">En construcción</text>
        <text x="130" y="20" fill="#94a3b8" fontSize="10" fontFamily="ui-sans-serif, system-ui">● Nodo tier-1</text>
        <text x="130" y="36" fill="#94a3b8" fontSize="10" fontFamily="ui-sans-serif, system-ui">○ Nodo secundario</text>
      </g>
    </svg>
  );
}
