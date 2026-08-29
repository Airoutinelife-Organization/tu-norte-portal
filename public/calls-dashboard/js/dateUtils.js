/**
 * @fileoverview Utilidades para manejo, cálculo y formateo de fechas.
 */

/**
 * Formatea un objeto Date en formato ISO estándar YYYY-MM-DD en la zona horaria local.
 * @param {Date} date - Fecha a formatear.
 * @returns {string} Fecha formateada como YYYY-MM-DD.
 */
export function formatDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene el rango de fechas (begin y end) según el tipo de preset seleccionado.
 * Siempre retorna un objeto con 'begin' y 'end', incluso para 'today' donde begin === end.
 * @param {string} preset - Tipo de preset ('today', '7days', '14days', '30days').
 * @returns {{begin: string, end: string, label: string}} Objeto con las fechas en formato YYYY-MM-DD.
 */
export function getPresetDateRange(preset) {
  const now = new Date();
  const endFormatted = formatDateISO(now);

  switch (preset) {
    case 'today': {
      return {
        begin: endFormatted,
        end: endFormatted,
        label: 'Hoy',
      };
    }
    case '7days': {
      const beginDate = new Date();
      beginDate.setDate(now.getDate() - 6);
      return {
        begin: formatDateISO(beginDate),
        end: endFormatted,
        label: 'Últimos 7 días',
      };
    }
    case '14days': {
      const beginDate = new Date();
      beginDate.setDate(now.getDate() - 13);
      return {
        begin: formatDateISO(beginDate),
        end: endFormatted,
        label: 'Últimos 14 días',
      };
    }
    case '30days': {
      const beginDate = new Date();
      beginDate.setDate(now.getDate() - 29);
      return {
        begin: formatDateISO(beginDate),
        end: endFormatted,
        label: 'Últimos 30 días (Un mes)',
      };
    }
    default:
      return {
        begin: endFormatted,
        end: endFormatted,
        label: 'Hoy',
      };
  }
}

/**
 * Formatea un rango de fechas para mostrarlo de forma legible al usuario.
 * @param {string} begin - Fecha inicio YYYY-MM-DD.
 * @param {string} end - Fecha fin YYYY-MM-DD.
 * @returns {string} Texto formateado legible.
 */
export function formatDisplayDateRange(begin, end) {
  if (begin === end) {
    return begin;
  }
  return `${begin} al ${end}`;
}
