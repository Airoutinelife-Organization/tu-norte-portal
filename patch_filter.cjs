const fs = require('fs');
let content = fs.readFileSync('src/components/ContactCenterDashboard.tsx', 'utf8');

const filterLogic = `
  const filteredServiceCalls = useMemo(() => {
    if (activeTab === "servicio") return serviceCalls;
    
    const now = new Date();
    return serviceCalls.filter((c) => {
      if (!c.start_timestamp) return true;
      
      // Parse DD/MM/YYYY HH:mm:ss or similar. Assuming standard parsable format or ISO.
      // If the webhook returns DD/MM/YYYY, this might be tricky. Let's assume standard ISO or YYYY-MM-DD for now.
      const callDate = new Date(c.start_timestamp);
      if (isNaN(callDate.getTime())) return true;

      if (filterMode === "preset") {
        const diffTime = now.getTime() - callDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= days;
      } else {
        if (!rangeStart || !rangeEnd) return true;
        const start = new Date(rangeStart + "T00:00:00");
        const end = new Date(rangeEnd + "T23:59:59");
        return callDate >= start && callDate <= end;
      }
    });
  }, [serviceCalls, activeTab, filterMode, days, rangeStart, rangeEnd]);
`;

// Insert after fetchService definition
content = content.replace(
  'const fetchService = useServerFn(getServiceCalls);',
  'const fetchService = useServerFn(getServiceCalls);\n' + filterLogic
);

// We need to replace serviceCalls with filteredServiceCalls for en_progreso and historico
// But ONLY in the map functions, not in the length check or we replace both?
// Actually, let's replace `serviceCalls.length` and `serviceCalls.map` in the entire file,
// BUT wait, "servicio" tab still needs `serviceCalls`.
// So we can just use `filteredServiceCalls` everywhere because our useMemo already returns `serviceCalls` when `activeTab === "servicio"`!
content = content.replace(/serviceCalls\.length/g, 'filteredServiceCalls.length');
content = content.replace(/serviceCalls\.map/g, 'filteredServiceCalls.map');

fs.writeFileSync('src/components/ContactCenterDashboard.tsx', content);
