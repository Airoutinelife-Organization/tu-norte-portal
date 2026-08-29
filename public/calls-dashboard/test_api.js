import { fetchKPIStats } from './js/api.js';

(async () => {
  const stats = await fetchKPIStats({ begin: "2026-08-24", end: "2026-08-24" });
  console.log("STATS:", stats);
})();
