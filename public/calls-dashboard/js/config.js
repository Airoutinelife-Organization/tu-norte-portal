/**
 * @fileoverview Configuración global de la aplicación.
 * Contiene endpoints de API, constantes de filtros y valores por defecto.
 */

let baseUrl = 'https://vmi3533489.contaboserver.net/webhook';

try {
  const res = await fetch('/api/public/dashboard-config');
  const env = await res.json();
  if (env.VITE_WEBHOOK_BASE_URL) {
    baseUrl = env.VITE_WEBHOOK_BASE_URL;
  }
} catch (e) {
  console.warn('Could not fetch dashboard config, using default base URL.', e);
}

export const CONFIG = {
  WEBHOOK_URL: `${baseUrl}/stats-hour`,
  SOLVED_WEBHOOK_URL: `${baseUrl}/stats-solved`,
  VENTAS_WEBHOOK_URL: `${baseUrl}/get-purchasing`,
  SERVICIO_WEBHOOK_URL: `${baseUrl}/get-service`,
  ABANDONADAS_WEBHOOK_URL: `${baseUrl}/stats-outcome-agent_hangup`,
  ESCALADAS_PROCESO_WEBHOOK_URL: `${baseUrl}/stats-transferred`,
  PBX_FALLIDA_WEBHOOK_URL: `${baseUrl}/stats-pbx`,
  SENTIMENT_WEBHOOK_URL: `${baseUrl}/stats-sentiment`,
  OUTCOME_WEBHOOK_URL: `${baseUrl}/stats-call_successful`,
  DEFAULT_FILTER: 'today',
  PAGES: {
    GENERAL: 'panel-general',
    VENTAS: 'ventas',
    SERVICIO: 'servicio-cliente'
  },
  FILTER_PRESETS: {
    TODAY: 'today',
    DAYS_7: '7days',
    DAYS_14: '14days',
    DAYS_30: '30days',
    CUSTOM: 'custom',
  },
};

