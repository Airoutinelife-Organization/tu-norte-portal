import { useId } from "react";

/**
 * Stylized live fiber-rollout map of Cúcuta, Colombia.
 * - Green solid animated lines = active fiber routes
 * - Orange dashed animated lines = under construction
 * - Pulsing nodes = network POPs / hubs
 * Pure SVG, no external map provider.
 */
export function CucutaFiberMap({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");

  // Approximate stylized geometry of Cúcuta + Los Patios + Villa del Rosario + El Zulia
  // Coordinates are within a 1000x600 viewBox.
  const activeRoutes = [
    "M 120 320 Q 260 260 420 300 T 720 280", // backbone east-west
    "M 420 300 L 460 200 L 540 160", // north spur to centro
    "M 540 160 L 640 180 L 720 220", // centro to atalaya
    "M 460 200 L 380 130 L 300 110", // to el zulia
    "M 720 280 L 780 360 L 820 440", // to los patios
    "M 540 160 L 560 110 L 620 90", // north quintas
  ];

  const buildingRoutes = [
    "M 820 440 L 870 500 L 900 540", // villa del rosario extension
    "M 300 110 L 220 90 L 160 110", // el zulia extension
    "M 720 220 L 820 200 L 880 220", // east industrial
    "M 380 130 L 360 70", // north reach
  ];

  const nodes: { x: number; y: number; label: string; size?: number }[] = [
    { x: 540, y: 160, label: "Centro", size: 7 },
    { x: 460, y: 200, label: "La Libertad", size: 5 },
    { x: 720, y: 220, label: "Atalaya", size: 6 },
    { x: 420, y: 300, label: "San Mateo", size: 5 },
    { x: 780, y: 360, label: "Los Patios", size: 6 },
    { x: 300, y: 110, label: "El Zulia", size: 5 },
    { x: 870, y: 500, label: "V. del Rosario", size: 6 },
    { x: 120, y: 320, label: "Hub Oeste", size: 4 },
  ];

  return (
    <svg
      viewBox="0 0 1000 600"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`bg-${id}`} cx="50%" cy="50%" r="75%">
          <stop offset="0%" stopColor="oklch(0.32 0.08 240)" />
          <stop offset="100%" stopColor="oklch(0.18 0.06 250)" />
        </radialGradient>
        <linearGradient id={`green-${id}`} x1="0" x2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
        </linearGradient>
        <filter id={`glow-${id}`}>
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id={`grid-${id}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width="1000" height="600" fill={`url(#bg-${id})`} />
      <rect width="1000" height="600" fill={`url(#grid-${id})`} />

      {/* River Pamplonita — stylized */}
      <path
        d="M -20 540 Q 200 480 380 500 T 700 460 T 1020 420"
        stroke="rgba(56,189,248,0.25)"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M -20 540 Q 200 480 380 500 T 700 460 T 1020 420"
        stroke="rgba(125,211,252,0.5)"
        strokeWidth="2"
        fill="none"
      />

      {/* City blocks (subtle) */}
      {Array.from({ length: 38 }).map((_, i) => {
        const x = 80 + (i % 10) * 85 + (i % 3) * 6;
        const y = 80 + Math.floor(i / 10) * 110 + (i % 2) * 8;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={36 + (i % 4) * 6}
            height={26 + (i % 3) * 4}
            rx="2"
            fill="rgba(255,255,255,0.04)"
            stroke="rgba(255,255,255,0.06)"
          />
        );
      })}

      {/* Building / under-construction routes (orange dashed, animated) */}
      {buildingRoutes.map((d, i) => (
        <g key={`b-${i}`}>
          <path d={d} stroke="rgba(251,146,60,0.25)" strokeWidth="6" fill="none" strokeLinecap="round" />
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

      {/* Active fiber routes (green, glowing pulse) */}
      {activeRoutes.map((d, i) => (
        <g key={`a-${i}`}>
          <path d={d} stroke="rgba(16,185,129,0.25)" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path
            d={d}
            stroke="#34d399"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            filter={`url(#glow-${id})`}
          />
          {/* Light pulse traveling along the path */}
          <circle r="4" fill="#a7f3d0" filter={`url(#glow-${id})`}>
            <animateMotion dur={`${3 + (i % 3)}s`} repeatCount="indefinite" path={d} />
          </circle>
        </g>
      ))}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={`n-${i}`}>
          <circle cx={n.x} cy={n.y} r={n.size ?? 5} fill="#10b981">
            <animate attributeName="r" values={`${n.size ?? 5};${(n.size ?? 5) + 4};${n.size ?? 5}`} dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.4;1" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx={n.x} cy={n.y} r={(n.size ?? 5) - 1} fill="#ecfdf5" />
          <text
            x={n.x + (n.size ?? 5) + 6}
            y={n.y + 4}
            fill="rgba(255,255,255,0.85)"
            fontSize="12"
            fontFamily="ui-sans-serif, system-ui"
            fontWeight="600"
          >
            {n.label}
          </text>
        </g>
      ))}

      {/* Compass */}
      <g transform="translate(940, 60)" opacity="0.7">
        <circle r="22" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.25)" />
        <path d="M 0 -16 L 4 0 L 0 16 L -4 0 Z" fill="#fff" />
        <text y="-26" textAnchor="middle" fontSize="10" fill="#fff" fontFamily="ui-sans-serif, system-ui">N</text>
      </g>

      {/* Title chip */}
      <g transform="translate(28, 28)">
        <rect width="220" height="34" rx="17" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.18)" />
        <circle cx="18" cy="17" r="5" fill="#34d399">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
        </circle>
        <text x="32" y="22" fill="#fff" fontSize="13" fontWeight="700" fontFamily="ui-sans-serif, system-ui">
          Red en vivo · Cúcuta
        </text>
      </g>
    </svg>
  );
}
