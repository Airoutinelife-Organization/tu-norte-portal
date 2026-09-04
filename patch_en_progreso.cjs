const fs = require('fs');
let content = fs.readFileSync('src/components/ContactCenterDashboard.tsx', 'utf8');

// Import getEnProgresoCalls
content = content.replace(
  'getHistoricoCalls,',
  'getHistoricoCalls,\n  getEnProgresoCalls,'
);

// We need to inject the fetch block for En Progreso Calls
const fetchLogic = `
  // ── En Progreso Calls ──────────────────────────────────────────────────────
  const [enProgresoCalls, setEnProgresoCalls] = useState<ServiceCall[]>([]);
  const [enProgresoLoading, setEnProgresoLoading] = useState(false);
  const [enProgresoError, setEnProgresoError] = useState<string | null>(null);
  const fetchEnProgreso = useServerFn(getEnProgresoCalls);

  useEffect(() => {
    let cancelled = false;
    if (activeTab === "en_progreso") {
        setEnProgresoLoading(true);
        let beginDate = new Date();
        let endDate = new Date();
        if (filterMode === "preset") {
            beginDate.setDate(beginDate.getDate() - (days - 1));
        } else {
            if (rangeStart) beginDate = new Date(rangeStart + "T00:00:00");
            if (rangeEnd) endDate = new Date(rangeEnd + "T23:59:59");
        }
        
        const begin = beginDate.toISOString().split("T")[0];
        const end = endDate.toISOString().split("T")[0];

        fetchEnProgreso({ data: { begin, end } })
          .then((res) => {
            if (!cancelled) {
              setEnProgresoCalls(res.calls || []);
              setEnProgresoError(res.error ?? null);
            }
          })
          .catch((e) => { if (!cancelled) setEnProgresoError(String(e)); })
          .finally(() => { if (!cancelled) setEnProgresoLoading(false); });
    }
    return () => { cancelled = true; };
  }, [fetchEnProgreso, activeTab, days, filterMode, rangeStart, rangeEnd]);
`;

content = content.replace(
  '  // ── Historico Calls ────────────────────────────────────────────────────────',
  fetchLogic + '\n  // ── Historico Calls ────────────────────────────────────────────────────────'
);

fs.writeFileSync('src/components/ContactCenterDashboard.tsx', content);
