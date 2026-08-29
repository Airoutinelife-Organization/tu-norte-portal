/**
 * @fileoverview Configuración global de la aplicación.
 * Contiene endpoints de API, constantes de filtros y valores por defecto.
 */

export const CONFIG = {
  WEBHOOK_URL: 'https://vmi3345591.contaboserver.net/webhook/stats-hour',
  SOLVED_WEBHOOK_URL: 'https://vmi3345591.contaboserver.net/webhook/stats-solved',
  VENTAS_WEBHOOK_URL: 'https://vmi3345591.contaboserver.net/webhook/get-purchasing',
  SERVICIO_WEBHOOK_URL: 'https://vmi3345591.contaboserver.net/webhook/get-service',
  ABANDONADAS_WEBHOOK_URL: 'https://vmi3345591.contaboserver.net/webhook/stats-outcome-agent_hangup',
  ESCALADAS_PROCESO_WEBHOOK_URL: 'https://vmi3345591.contaboserver.net/webhook/stats-transferred',
  PBX_FALLIDA_WEBHOOK_URL: 'https://vmi3345591.contaboserver.net/webhook/stats-pbx',
  SENTIMENT_WEBHOOK_URL: 'https://vmi3345591.contaboserver.net/webhook/stats-sentiment',
  OUTCOME_WEBHOOK_URL: 'https://vmi3345591.contaboserver.net/webhook/stats-call_successful',
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
