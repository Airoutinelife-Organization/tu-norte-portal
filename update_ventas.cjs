const fs = require('fs');
let content = fs.readFileSync('src/components/VentasDashboard.tsx', 'utf8');

// Rename component
content = content.replace(
  /export default function AdminDashboard\(\{\n  mode = "contact-center",\n  onLogout,\n\}: \{\n  mode\?: "contact-center" \| "ventas";\n  onLogout: \(\) => void;\n\}\) \{/g,
  'export default function VentasDashboard({ onLogout }: { onLogout: () => void }) {'
);

// Remove mode references
content = content.replace(/mode === "ventas" \? "ventas" : "servicio"/g, '"ventas"');

content = content.replace(
  /  const currentTabs = useMemo\(\(\) => \{\n    if \(mode === "ventas"\) \{\n      return TABS\.filter\(\(t\) => t\.id !== "servicio" && t\.id !== "en_progreso" && t\.id !== "historico"\);\n    \}\n    if \(mode === "contact-center"\) \{\n      return TABS\.filter\(\(t\) => t\.id !== "ventas"\);\n    \}\n    return TABS;\n  \}, \[mode\]\);/g,
  `  const currentTabs = useMemo(() => {
    return TABS.filter((t) => t.id !== "servicio" && t.id !== "en_progreso" && t.id !== "historico");
  }, []);`
);

content = content.replace(/if \(mode === "ventas" \|\| activeTab === "ventas"\) \{/g, 'if (true) {');

fs.writeFileSync('src/components/VentasDashboard.tsx', content);
