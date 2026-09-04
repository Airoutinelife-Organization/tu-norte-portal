const fs = require('fs');
let content = fs.readFileSync('src/components/ContactCenterDashboard.tsx', 'utf8');

// Import getHistoricoCalls
content = content.replace(
  'getServiceCalls,',
  'getServiceCalls,\n  getHistoricoCalls,'
);

// We need to inject the fetch block for Historico Calls
const fetchLogic = `
  // ── Historico Calls ────────────────────────────────────────────────────────
  const [historicoCalls, setHistoricoCalls] = useState<ServiceCall[]>([]);
  const [historicoLoading, setHistoricoLoading] = useState(false);
  const [historicoError, setHistoricoError] = useState<string | null>(null);
  const fetchHistorico = useServerFn(getHistoricoCalls);

  useEffect(() => {
    let cancelled = false;
    if (activeTab === "historico") {
        setHistoricoLoading(true);
        let beginDate = new Date();
        let endDate = new Date();
        if (filterMode === "preset") {
            beginDate.setDate(beginDate.getDate() - (days - 1)); // - days or -(days-1)? Let's use exactly days as difference. Or for 1 day, it's today. For 7 days it's today - 7
            // actually if "hoy", begin and end are the same
        } else {
            if (rangeStart) beginDate = new Date(rangeStart + "T00:00:00");
            if (rangeEnd) endDate = new Date(rangeEnd + "T23:59:59");
        }
        
        const begin = beginDate.toISOString().split("T")[0];
        const end = endDate.toISOString().split("T")[0];

        fetchHistorico({ data: { begin, end } })
          .then((res) => {
            if (!cancelled) {
              setHistoricoCalls(res.calls || []);
              setHistoricoError(res.error ?? null);
            }
          })
          .catch((e) => { if (!cancelled) setHistoricoError(String(e)); })
          .finally(() => { if (!cancelled) setHistoricoLoading(false); });
    }
    return () => { cancelled = true; };
  }, [fetchHistorico, activeTab, days, filterMode, rangeStart, rangeEnd]);
`;

content = content.replace(
  '  // ── Redis ────────────────────────────────────────────────────────────',
  fetchLogic + '\n  // ── Redis ────────────────────────────────────────────────────────────'
);

content = content.replace(
  '{activeTab === "historico" && (',
  '{activeTab === "historico" && (/* Historico Block */'
);

fs.writeFileSync('src/components/ContactCenterDashboard.tsx', content);
