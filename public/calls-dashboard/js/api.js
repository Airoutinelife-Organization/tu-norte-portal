/**
 * @fileoverview Servicio de comunicación con la API / Webhook.
 */

import { CONFIG } from './config.js';

/**
 * @typedef {Object} StatsResponse
 * @property {number} llamadasAtendidas - Total de llamadas atendidas en el período.
 * @property {{labels: string[], atendidas: number[], resueltasIA: number[]}} dailyData
 *   Desglose diario para el gráfico de tendencia.
 * @property {boolean} success
 * @property {string|null} error
 */

/**
 * Consulta las estadísticas para el rango de fechas especificado.
 * Siempre envía `begin` y `end` en el payload JSON.
 *
 * @param {{begin: string, end: string}} dateRange - Fechas en formato YYYY-MM-DD.
 * @returns {Promise<StatsResponse>}
 */
export async function fetchKPIStats({ begin, end }) {
  try {
    const payload = { begin, end };
    console.info('[API] Enviando solicitud a webhooks:', { WEBHOOK_URL: CONFIG.WEBHOOK_URL, SOLVED_WEBHOOK_URL: CONFIG.SOLVED_WEBHOOK_URL, ABANDONADAS_WEBHOOK_URL: CONFIG.ABANDONADAS_WEBHOOK_URL, PBX_FALLIDA_WEBHOOK_URL: CONFIG.PBX_FALLIDA_WEBHOOK_URL }, payload);

    const fetchLlamadas = fetch(CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const fetchResueltas = fetch(CONFIG.SOLVED_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const fetchAbandonadas = fetch(CONFIG.ABANDONADAS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const fetchEscaladasProceso = fetch(CONFIG.ESCALADAS_PROCESO_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const fetchPbxFallida = fetch(CONFIG.PBX_FALLIDA_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const [resLlamadas, resResueltas, resAbandonadas, resEscaladasProceso, resPbxFallida] = await Promise.all([fetchLlamadas, fetchResueltas, fetchAbandonadas, fetchEscaladasProceso, fetchPbxFallida]);

    let errorMessages = [];
    if (!resLlamadas.ok) {
      errorMessages.push(`Webhook Llamadas respondió con código ${resLlamadas.status}`);
      console.warn(`[API] Webhook Llamadas respondió con status ${resLlamadas.status}`);
    }
    if (!resResueltas.ok) {
      errorMessages.push(`Webhook Resueltas respondió con código ${resResueltas.status}`);
      console.warn(`[API] Webhook Resueltas respondió con status ${resResueltas.status}`);
    }
    if (!resAbandonadas.ok) {
      errorMessages.push(`Webhook Abandonadas respondió con código ${resAbandonadas.status}`);
      console.warn(`[API] Webhook Abandonadas respondió con status ${resAbandonadas.status}`);
    }
    if (!resEscaladasProceso.ok) {
      errorMessages.push(`Webhook Escaladas Proceso respondió con código ${resEscaladasProceso.status}`);
      console.warn(`[API] Webhook Escaladas Proceso respondió con status ${resEscaladasProceso.status}`);
    }
    if (!resPbxFallida.ok) {
      errorMessages.push(`Webhook PBX Fallida respondió con código ${resPbxFallida.status}`);
      console.warn(`[API] Webhook PBX Fallida respondió con status ${resPbxFallida.status}`);
    }

    if (errorMessages.length > 0 && !resLlamadas.ok && !resResueltas.ok && !resAbandonadas.ok && !resEscaladasProceso.ok && !resPbxFallida.ok) {
      return {
        llamadasAtendidas: 0,
        resueltasIA: 0,
        abandonadas: 0,
        escaladasProceso: 0,
        pbxFallida: 0,
        dailyData: { labels: [], atendidas: [], resueltasIA: [] },
        success: false,
        error: errorMessages.join('; '),
      };
    }

    const dataLlamadas = resLlamadas.ok ? await resLlamadas.json() : {};
    const dataResueltas = resResueltas.ok ? await resResueltas.json() : {};
    const dataAbandonadas = resAbandonadas.ok ? await resAbandonadas.json() : {};
    const dataEscaladasProceso = resEscaladasProceso.ok ? await resEscaladasProceso.json() : {};
    const dataPbxFallida = resPbxFallida.ok ? await resPbxFallida.json() : {};
    console.info('[API] Respuestas recibidas:', { dataLlamadas, dataResueltas, dataAbandonadas, dataEscaladasProceso, dataPbxFallida });

    const llamadasAtendidas = normalizarLlamadasAtendidas(dataLlamadas);
    const resueltasIA = normalizarLlamadasAtendidas(dataResueltas); // Reusamos la lógica de normalización
    const abandonadas = normalizarLlamadasAtendidas(dataAbandonadas);
    const escaladasProceso = normalizarLlamadasAtendidas(dataEscaladasProceso);
    const pbxFallida = normalizarLlamadasAtendidas(dataPbxFallida);
    const dailyData = agruparPorDia(dataLlamadas, dataResueltas);

    return {
      llamadasAtendidas,
      resueltasIA,
      abandonadas,
      escaladasProceso,
      pbxFallida,
      dailyData,
      rawData: dataLlamadas,
      success: true,
      error: errorMessages.length > 0 ? errorMessages.join('; ') : null,
    };
  } catch (error) {
    console.error('[API] Error al conectar con los webhooks:', error);
    return {
      llamadasAtendidas: 0,
      resueltasIA: 0,
      abandonadas: 0,
      escaladasProceso: 0,
      pbxFallida: 0,
      dailyData: { labels: [], atendidas: [], resueltasIA: [] },
      success: false,
      error: error.message || 'Error de red al consultar estadísticas',
    };
  }
}

/**
 * Agrupa los datos horarios por día para alimentar el gráfico de tendencia.
 * Soporta el formato n8n: [{"stats:hour:YYYY-MM-DD HH": N}, ...]
 *
 * @param {*} data - Respuesta raw del webhook.
 * @returns {{labels: string[], atendidas: number[], resueltasIA: number[]}}
 */
function agruparPorDia(dataLlamadas, dataResueltas = null) {

  /** @type {Map<string, number>} */
  const porDiaAtendidas = new Map();
  /** @type {Map<string, number>} */
  const porDiaResueltas = new Map();

  const procesarObjeto = (obj, map) => {
    for (const [key, value] of Object.entries(obj)) {
      // Buscar una fecha YYYY-MM-DD en la clave (ej: "stats:hour:2026-08-18 09", "stats:solved:2026-08-18", "2026-08-18")
      const matchDate = key.match(/(\d{4}-\d{2}-\d{2})/);

      const dia = matchDate ? matchDate[1] : null;
      if (!dia) continue;

      const num = Number(value);
      if (isNaN(num)) continue;

      map.set(dia, (map.get(dia) ?? 0) + num);
    }
  };

  if (Array.isArray(dataLlamadas)) {
    dataLlamadas.forEach((item) => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        procesarObjeto(item, porDiaAtendidas);
      }
    });
  } else if (typeof dataLlamadas === 'object' && dataLlamadas !== null) {
    procesarObjeto(dataLlamadas, porDiaAtendidas);
  }

  if (dataResueltas) {
    if (Array.isArray(dataResueltas)) {
      dataResueltas.forEach((item) => {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          procesarObjeto(item, porDiaResueltas);
        }
      });
    } else if (typeof dataResueltas === 'object' && dataResueltas !== null) {
      procesarObjeto(dataResueltas, porDiaResueltas);
    }
  }

  // Ordenar las fechas cronológicamente
  const todasLasFechas = new Set([...porDiaAtendidas.keys(), ...porDiaResueltas.keys()]);
  const labelsOrdenados = [...todasLasFechas].sort();

  return {
    labels: labelsOrdenados,
    atendidas: labelsOrdenados.map((d) => porDiaAtendidas.get(d) ?? 0),
    resueltasIA: labelsOrdenados.map((d) => porDiaResueltas.get(d) ?? 0),
  };
}

/**
 * Agrupa los datos horarios por hora del día (0-23) para Llamadas Atendidas.
 * Extrae la hora del key "stats:hour:YYYY-MM-DD HH" o "YYYY-MM-DD HH".
 * Devuelve un objeto con labels (0-23) y atendidas por hora.
 *
 * @param {*} data - Respuesta raw del webhook.
 * @returns {{labels: string[], atendidas: number[]}}
 */
export function agruparPorHora(data) {
  /** @type {Map<string, number>} */
  const porHora = new Map();

  const procesarObjeto = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      // Match hour in key
      const match = key.match(/(\d{4}-\d{2}-\d{2})\s+(\d{1,2})/);
      if (!match) continue;
      const hora = parseInt(match[2], 10);
      const num = Number(value);
      if (isNaN(num)) continue;
      const etiqueta = hora.toString();
      porHora.set(etiqueta, (porHora.get(etiqueta) ?? 0) + num);
    }
  };

  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        procesarObjeto(item);
      }
    });
  } else if (typeof data === 'object' && data !== null) {
    procesarObjeto(data);
  }

  // Ensure all 0-23 present
  const labels = [];
  const atendidas = [];
  for (let i = 0; i < 24; i++) {
    const h = i.toString();
    labels.push(h);
    atendidas.push(porHora.get(h) ?? 0);
  }

  return { labels, atendidas };
}


/**
 * Normaliza la respuesta del webhook para extraer el total de Llamadas Atendidas.
 *
 * Estrategia (en orden de prioridad):
 * 1. Número directo → lo retorna.
 * 2. Objeto con clave explícita "Llamadas Atendidas" / variantes → la retorna.
 * 3. Array de objetos n8n (ej: [{"stats:hour:2026-08-18 09": 8}, ...])
 *    → suma todos los valores numéricos de cada objeto.
 * 4. Array de arrays ([[key, N], ...]) → suma el segundo elemento de cada par.
 * 5. Array de números → suma directa.
 * 6. Objeto plano con múltiples keys numéricas → suma de todos los valores.
 *
 * @param {*} data - Respuesta JSON del webhook.
 * @returns {number} Total de llamadas atendidas.
 */
function normalizarLlamadasAtendidas(data) {
  // Caso 1: número directo
  if (typeof data === 'number') {
    return data;
  }

  // Caso 2 y 6: objeto plano (no array)
  if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
    const claveExplicita =
      data['Llamadas Atendidas'] ??
      data['llamadas_atendidas'] ??
      data['llamadasAtendidas'] ??
      data['atendidas'] ??
      data['total'] ??
      data['count'];

    if (claveExplicita !== undefined) {
      return Number(claveExplicita) || 0;
    }

    // Objeto con múltiples keys numéricas → sumar todos los valores numéricos
    return sumarValoresNumericos(Object.values(data));
  }

  // Casos 3, 4 y 5: array
  if (Array.isArray(data)) {
    if (data.length === 0) return 0;

    const primerItem = data[0];

    // Caso 4: array de arrays [[key, N], ...]
    if (Array.isArray(primerItem)) {
      return data.reduce((acc, par) => {
        const val = Number(par[1]);
        return acc + (isNaN(val) ? 0 : val);
      }, 0);
    }

    // Caso 3: array de objetos (formato n8n por hora)
    if (typeof primerItem === 'object' && primerItem !== null) {
      // Buscar clave explícita en el primer objeto del array
      const claveExplicita =
        primerItem['Llamadas Atendidas'] ??
        primerItem['llamadas_atendidas'] ??
        primerItem['llamadasAtendidas'] ??
        primerItem['atendidas'];

      if (claveExplicita !== undefined) {
        // Sumar esa clave en todos los objetos
        return data.reduce((acc, obj) => {
          const val = Number(
            obj['Llamadas Atendidas'] ??
            obj['llamadas_atendidas'] ??
            obj['llamadasAtendidas'] ??
            obj['atendidas'] ?? 0
          );
          return acc + (isNaN(val) ? 0 : val);
        }, 0);
      }

      // Formato n8n: {"stats:hour:2026-08-18 09": 8}
      // Cada objeto tiene una sola key con valor numérico → sumar todos
      return data.reduce((acc, obj) => {
        return acc + sumarValoresNumericos(Object.values(obj));
      }, 0);
    }

    // Caso 5: array de números [8, 3, 1, ...]
    return sumarValoresNumericos(data);
  }

  console.warn('[API] Formato de respuesta no reconocido:', data);
  return 0;
}

/**
 * Suma todos los valores numéricos de un array de valores mixtos.
 * @param {Array<*>} valores
 * @returns {number}
 */
function sumarValoresNumericos(valores) {
  return valores.reduce((acc, val) => {
    const n = Number(val);
    return acc + (isNaN(n) ? 0 : n);
  }, 0);
}

/**
 * Consulta las estadísticas al webhook de Ventas.
 * @returns {Promise<Array<Object>|null>} Un array de registros, o null si falla.
 */
export async function fetchVentasData() {
  try {
    const response = await fetch(CONFIG.VENTAS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      console.warn(`[API] Webhook de ventas respondió con estado ${response.status}`);
      return null;
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data ? [data] : []);
  } catch (error) {
    console.error('[API] Error al consultar webhook de ventas:', error);
    return null;
  }
}


/**
 * Consulta las estadísticas al webhook de Servicio al Cliente.
 * @returns {Promise<Array<Object>|null>} Un array de registros, o null si falla.
 */
export async function fetchServiceData() {
  try {
    const response = await fetch(CONFIG.SERVICIO_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      console.warn(`[API] Webhook servicio respondió con estado ${response.status}`);
      return null;
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data ? [data] : []);
  } catch (error) {
    console.error('[API] Error al consultar webhook servicio:', error);
    return null;
  }
}

/**
 * Consulta las estadísticas de sentimiento al webhook.
 * @param {{begin: string, end: string}} dateRange
 * @returns {Promise<{positive: number, negative: number, neutral: number, success: boolean, error: string|null}>}
 */
export async function fetchSentimentStats({ begin, end }) {
  try {
    const payload = { begin, end };
    const response = await fetch(CONFIG.SENTIMENT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.warn(`[API] Webhook sentimiento respondió con estado ${response.status}`);
      return { positive: 0, negative: 0, neutral: 0, success: false, error: `Error ${response.status}` };
    }
    const data = await response.json();
    
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    const procesarValores = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const num = Number(value) || 0;
        
        // Ignorar si el value no es número válido mayor que 0
        if (num === 0) continue;

        if (lowerKey.includes('positive') || lowerKey.includes('positivo')) {
          positive += num;
        } else if (lowerKey.includes('negative') || lowerKey.includes('negativo')) {
          negative += num;
        } else if (lowerKey.includes('neutral')) {
          neutral += num;
        }
      }
    };

    if (Array.isArray(data)) {
      data.forEach(item => {
         if (typeof item === 'object' && item !== null) {
            procesarValores(item);
         }
      });
    } else if (typeof data === 'object' && data !== null) {
      procesarValores(data);
    }

    return { positive, negative, neutral, success: true, error: null };
  } catch (error) {
    console.error('[API] Error al consultar webhook sentimiento:', error);
    return { positive: 0, negative: 0, neutral: 0, success: false, error: error.message };
  }
}

/**
 * Consulta las estadísticas de resultados (éxito/fracaso) al webhook.
 * @param {{begin: string, end: string}} dateRange
 * @returns {Promise<{outcomes: Record<string, number>, success: boolean, error: string|null}>}
 */
export async function fetchOutcomeStats({ begin, end }) {
  try {
    const payload = { begin, end };
    const response = await fetch(CONFIG.OUTCOME_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.warn(`[API] Webhook outcome respondió con estado ${response.status}`);
      return { outcomes: {}, success: false, error: `Error ${response.status}` };
    }
    const data = await response.json();
    
    const outcomes = {};

    const procesarValores = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const num = Number(value) || 0;
        if (num === 0) continue;

        if (lowerKey.includes('true')) {
          outcomes['Exitosa'] = (outcomes['Exitosa'] || 0) + num;
        } else if (lowerKey.includes('false')) {
          outcomes['Fallida'] = (outcomes['Fallida'] || 0) + num;
        } else {
          // Fallback por si devuelve otras llaves
          const parts = key.split(':');
          const lastPart = parts[parts.length - 1];
          outcomes[lastPart] = (outcomes[lastPart] || 0) + num;
        }
      }
    };

    if (Array.isArray(data)) {
      data.forEach(item => {
         if (typeof item === 'object' && item !== null) {
            procesarValores(item);
         }
      });
    } else if (typeof data === 'object' && data !== null) {
      procesarValores(data);
    }

    return { outcomes, success: true, error: null };
  } catch (error) {
    console.error('[API] Error al consultar webhook outcome:', error);
    return { outcomes: {}, success: false, error: error.message };
  }
}
