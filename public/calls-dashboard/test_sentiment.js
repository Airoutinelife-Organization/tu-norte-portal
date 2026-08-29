import { fetchSentimentStats } from './js/api.js';

(async () => {
  try {
    const stats = await fetchSentimentStats({ begin: "2026-08-24", end: "2026-08-24" });
    console.log("SUCCESS:", stats);
  } catch(e) {
    console.error("FAIL:", e);
  }
})();
