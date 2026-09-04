const fs = require('fs');
let content = fs.readFileSync('src/components/ContactCenterDashboard.tsx', 'utf8');

// Rename component
content = content.replace(
  /export default function AdminDashboard\(\{\n  mode = "contact-center",\n  onLogout,\n\}: \{\n  mode\?: "contact-center" \| "ventas";\n  onLogout: \(\) => void;\n\}\) \{/g,
  'export default function ContactCenterDashboard({ onLogout }: { onLogout: () => void }) {'
);

// Remove mode references
content = content.replace(/mode === "ventas" \? "ventas" : "servicio"/g, '"servicio"');

content = content.replace(
  /  const currentTabs = useMemo\(\(\) => \{\n    if \(mode === "ventas"\) \{\n      return TABS\.filter\(\(t\) => t\.id !== "servicio" && t\.id !== "en_progreso" && t\.id !== "historico"\);\n    \}\n    if \(mode === "contact-center"\) \{\n      return TABS\.filter\(\(t\) => t\.id !== "ventas"\);\n    \}\n    return TABS;\n  \}, \[mode\]\);/g,
  `  const currentTabs = useMemo(() => {
    return TABS.filter((t) => t.id !== "ventas");
  }, []);`
);

// We can leave the "fetchPurchasing" logic if we want, or remove it. It's safe to just leave it dead code for now, or remove the 'mode' condition from fetchService.
content = content.replace(/if \(mode === "contact-center" \|\| activeTab === "servicio" \|\| activeTab === "en_progreso" \|\| activeTab === "historico"\) \{/g, 'if (true) {');

fs.writeFileSync('src/components/ContactCenterDashboard.tsx', content);
