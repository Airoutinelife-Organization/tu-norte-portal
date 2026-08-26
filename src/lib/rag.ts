import { KB_CHUNKS, type KbChunk } from "@/data/manual-tu-norte";

const STOP = new Set([
  "el","la","los","las","un","una","unos","unas","de","del","al","y","o","que","en","por","para",
  "con","se","su","sus","es","son","como","mi","me","te","lo","le","hay","tengo","quiero","puedo",
  "cual","cuál","cuanto","cuánto","como","cómo","donde","dónde","cuando","cuándo","qué","que",
]);

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ");
}

function tokens(s: string): string[] {
  return normalize(s)
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

export function retrieve(query: string, topK = 4): KbChunk[] {
  const qt = tokens(query);
  if (!qt.length) return KB_CHUNKS.slice(0, topK);

  const scored = KB_CHUNKS.map((chunk) => {
    const body = normalize(chunk.text);
    const title = normalize(chunk.title);
    let score = 0;
    for (const t of qt) {
      const occurrences = body.split(t).length - 1;
      if (occurrences) score += 1 + Math.min(occurrences, 5) * 0.4;
      if (title.includes(t)) score += 3;
    }
    return { chunk, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return (scored.length ? scored : KB_CHUNKS.map((chunk) => ({ chunk, score: 0 })))
    .slice(0, topK)
    .map((s) => s.chunk);
}

export function buildContext(query: string, topK = 4): string {
  return retrieve(query, topK)
    .map((c) => c.text)
    .join("\n\n---\n\n");
}
