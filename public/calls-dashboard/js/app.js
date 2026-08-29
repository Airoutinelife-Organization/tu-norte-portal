/**
 * @fileoverview Controlador principal de la interfaz y gestión de eventos.
 */

import { CONFIG } from './config.js';
import { getPresetDateRange, formatDisplayDateRange, formatDateISO } from './dateUtils.js';
import { fetchKPIStats, agruparPorHora, fetchVentasData, fetchServiceData, fetchSentimentStats, fetchOutcomeStats } from './api.js';
import { renderLlamadasChart, renderLlamadasHoraChart, renderSentimentChart, renderOutcomeChart } from './chartRenderer.js';

/**
 * Estado global de la vista
 */
const state = {
  activePage: CONFIG.PAGES.GENERAL,
  activeFilterPreset: CONFIG.FILTER_PRESETS.TODAY,
  currentRange: getPresetDateRange(CONFIG.FILTER_PRESETS.TODAY),
};

// Referencias a elementos del DOM
const elements = {
  tabButtons: document.querySelectorAll('.nav-tab-btn'),
  pageViews: document.querySelectorAll('.page-view'),
  filterButtons: document.querySelectorAll('.filter-btn'),
  rangeModal: document.getElementById('rangeModal'),
  modalCloseBtn: document.getElementById('modalCloseBtn'),
  btnCancelRange: document.getElementById('btnCancelRange'),
  btnApplyRange: document.getElementById('btnApplyRange'),
  inputDateBegin: document.getElementById('inputDateBegin'),
  inputDateEnd: document.getElementById('inputDateEnd'),
  activeRangeDatesText: document.getElementById('activeRangeDatesText'),
  activeRangeLabelText: document.getElementById('activeRangeLabelText'),
  kpiLlamadasAtendidas: document.getElementById('kpiLlamadasAtendidas'),
  kpiResueltasIA: document.getElementById('kpiResueltasIA'),
  kpiResueltasIASubtitle: document.getElementById('kpiResueltasIASubtitle'),
  kpiAbandonadas: document.getElementById('kpiAbandonadas'),
  kpiAbandonadasSubtitle: document.getElementById('kpiAbandonadasSubtitle'),
  kpiEscaladasProceso: document.getElementById('kpiEscaladasProceso'),
  kpiEscaladasProcesoSubtitle: document.getElementById('kpiEscaladasProcesoSubtitle'),
  kpiTransferenciaFallidaPbx: document.getElementById('kpiTransferenciaFallidaPbx'),
  kpiTransferenciaFallidaPbxSubtitle: document.getElementById('kpiTransferenciaFallidaPbxSubtitle'),
  btnExit: document.getElementById('btnExit'),
};

/**
 * Cambia la página activa en la vista.
 * @param {string} pageId - ID de la página a mostrar.
 */
function switchPage(pageId) {
  state.activePage = pageId;
  sessionStorage.setItem('activePage', pageId);

  // Actualizar botones de navegación
  elements.tabButtons.forEach((btn) => {
    if (btn.dataset.target === pageId) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });

  // Actualizar vistas
  elements.pageViews.forEach((view) => {
    if (view.id === pageId) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });
  
  if (pageId === CONFIG.PAGES.VENTAS) {
    loadVentasData();
  } else if (pageId === CONFIG.PAGES.SERVICIO) {
    loadServiceData();
  }
}

/**
 * Actualiza el banner informativo del rango activo.
 */
function updateRangeDisplay() {
  if (elements.activeRangeDatesText && elements.activeRangeLabelText) {
    elements.activeRangeLabelText.textContent = state.currentRange.label || 'Período';
    elements.activeRangeDatesText.textContent = formatDisplayDateRange(
      state.currentRange.begin,
      state.currentRange.end
    );
  }
}

/**
 * Consulta las estadísticas al webhook y actualiza el KPI 'Llamadas Atendidas' y el gráfico.
 * Se ejecuta exclusivamente para el 'Panel General'.
 */
async function loadStatistics() {
  // Validar que solo se aplique en la página Panel General
  if (state.activePage !== CONFIG.PAGES.GENERAL) {
    return;
  }

  if (!elements.kpiLlamadasAtendidas) return;

  // Estado de carga
  elements.kpiLlamadasAtendidas.classList.add('loading', 'skeleton');
  elements.kpiLlamadasAtendidas.textContent = '...';
  if (elements.kpiResueltasIA) {
    elements.kpiResueltasIA.classList.add('loading', 'skeleton');
    elements.kpiResueltasIA.textContent = '...';
  }
  if (elements.kpiAbandonadas) {
    elements.kpiAbandonadas.classList.add('loading', 'skeleton');
    elements.kpiAbandonadas.textContent = '...';
  }
  if (elements.kpiEscaladasProceso) {
    elements.kpiEscaladasProceso.classList.add('loading', 'skeleton');
    elements.kpiEscaladasProceso.textContent = '...';
  }
  if (elements.kpiTransferenciaFallidaPbx) {
    elements.kpiTransferenciaFallidaPbx.classList.add('loading', 'skeleton');
    elements.kpiTransferenciaFallidaPbx.textContent = '...';
  }

  try {
    const stats = await fetchKPIStats({
      begin: state.currentRange.begin,
      end: state.currentRange.end,
    });

    // Actualizar KPI
    elements.kpiLlamadasAtendidas.textContent = stats.llamadasAtendidas.toLocaleString();
    if (elements.kpiResueltasIA) {
      elements.kpiResueltasIA.textContent = stats.resueltasIA.toLocaleString();
      if (elements.kpiResueltasIASubtitle && stats.llamadasAtendidas > 0) {
        const percentage = Math.round((stats.resueltasIA / stats.llamadasAtendidas) * 100);
        elements.kpiResueltasIASubtitle.textContent = `(${percentage}%)`;
      } else if (elements.kpiResueltasIASubtitle) {
        elements.kpiResueltasIASubtitle.textContent = `(0%)`;
      }
    }
    
    if (elements.kpiAbandonadas) {
      elements.kpiAbandonadas.textContent = stats.abandonadas.toLocaleString();
      if (elements.kpiAbandonadasSubtitle && stats.llamadasAtendidas > 0) {
        const percentage = Math.round((stats.abandonadas / stats.llamadasAtendidas) * 100);
        elements.kpiAbandonadasSubtitle.textContent = `(${percentage}%)`;
      } else if (elements.kpiAbandonadasSubtitle) {
        elements.kpiAbandonadasSubtitle.textContent = `(0%)`;
      }
    }

    if (elements.kpiEscaladasProceso) {
      elements.kpiEscaladasProceso.textContent = stats.escaladasProceso.toLocaleString();
      if (elements.kpiEscaladasProcesoSubtitle && stats.llamadasAtendidas > 0) {
        const percentage = Math.round((stats.escaladasProceso / stats.llamadasAtendidas) * 100);
        elements.kpiEscaladasProcesoSubtitle.textContent = `(${percentage}%)`;
      } else if (elements.kpiEscaladasProcesoSubtitle) {
        elements.kpiEscaladasProcesoSubtitle.textContent = `(0%)`;
      }
    }

    if (elements.kpiTransferenciaFallidaPbx) {
      elements.kpiTransferenciaFallidaPbx.textContent = stats.pbxFallida.toLocaleString();
      if (elements.kpiTransferenciaFallidaPbxSubtitle && stats.escaladasProceso > 0) {
        const percentage = Math.round((stats.pbxFallida / stats.escaladasProceso) * 100);
        elements.kpiTransferenciaFallidaPbxSubtitle.textContent = `(${percentage}%)`;
      } else if (elements.kpiTransferenciaFallidaPbxSubtitle) {
        elements.kpiTransferenciaFallidaPbxSubtitle.textContent = `(0%)`;
      }
    }

    // Actualizar gráfico de tendencia diaria
    renderLlamadasChart(stats.dailyData);
    // Tendencia horaria de llamadas atendidas
    const horaData = agruparPorHora(stats.rawData);
    renderLlamadasHoraChart(horaData);
    
    // Fetch and render Sentiment chart
    const sentimentStats = await fetchSentimentStats({
      begin: state.currentRange.begin,
      end: state.currentRange.end,
    });
    if (sentimentStats.success) {
      renderSentimentChart(sentimentStats);
    } else {
      renderSentimentChart({ positive: 0, negative: 0, neutral: 0 });
    }

    // Fetch and render Outcome chart
    const outcomeStats = await fetchOutcomeStats({
      begin: state.currentRange.begin,
      end: state.currentRange.end,
    });
    if (outcomeStats.success) {
      renderOutcomeChart(outcomeStats.outcomes);
    } else {
      renderOutcomeChart({});
    }
  } catch (err) {
    console.error('[KPI] Error al actualizar Llamadas Atendidas y Resueltas por IA:', err);
    elements.kpiLlamadasAtendidas.textContent = '0';
    if (elements.kpiResueltasIA) elements.kpiResueltasIA.textContent = '0';
    if (elements.kpiAbandonadas) elements.kpiAbandonadas.textContent = '0';
    if (elements.kpiEscaladasProceso) elements.kpiEscaladasProceso.textContent = '0';
    if (elements.kpiTransferenciaFallidaPbx) elements.kpiTransferenciaFallidaPbx.textContent = '0';
    renderLlamadasChart({ labels: [], atendidas: [], resueltasIA: [] });
    renderSentimentChart({ positive: 0, negative: 0, neutral: 0 });
    renderOutcomeChart({});
  } finally {
    elements.kpiLlamadasAtendidas.classList.remove('loading', 'skeleton');
    if (elements.kpiResueltasIA) elements.kpiResueltasIA.classList.remove('loading', 'skeleton');
    if (elements.kpiAbandonadas) elements.kpiAbandonadas.classList.remove('loading', 'skeleton');
    if (elements.kpiEscaladasProceso) elements.kpiEscaladasProceso.classList.remove('loading', 'skeleton');
    if (elements.kpiTransferenciaFallidaPbx) elements.kpiTransferenciaFallidaPbx.classList.remove('loading', 'skeleton');
  }
}


/**
 * Renderiza una tabla dinámica con soporte para ordenamiento.
 */
function renderDynamicTable(prefix, rawData) {
  const tableHeader = document.getElementById(prefix + 'TableHeader');
  const tableBody = document.getElementById(prefix + 'TableBody');
  const tableWrapper = document.getElementById(prefix + 'TableWrapper');
  
  if (!rawData || rawData.length === 0) return;

  // Aplanar datos
  const flattenObject = (obj, prefixStr = '') => {
    const flattened = {};
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefixStr ? `${prefixStr}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value, fullKey));
      } else {
        flattened[fullKey] = value;
      }
    }
    return flattened;
  };

  const flattenedData = rawData.map(record => flattenObject(record));
  const allKeysSet = new Set();
  flattenedData.forEach(record => {
    Object.keys(record).forEach(key => allKeysSet.add(key));
  });
  let allKeys = Array.from(allKeysSet).filter(k => 
    k !== 'Call_summary' && k !== 'call_summary' && 
    k !== 'caller_name' && k !== 'Caller_name' &&
    k.toLowerCase().trim() !== 'url' &&
    k.toLowerCase().trim() !== 'recording_url' &&
    k.toLowerCase().trim() !== 'notes'
  );

  if (prefix !== 'ventas') {
    allKeys = allKeys.filter(k => k !== 'specialist' && k !== 'Specialist');
  } else {
    const specIdx1 = allKeys.indexOf('specialist');
    const specIdx2 = allKeys.indexOf('Specialist');
    const specKey = specIdx1 > -1 ? 'specialist' : (specIdx2 > -1 ? 'Specialist' : null);
    
    if (specKey) {
      allKeys = allKeys.filter(k => k !== specKey);
      const startIdx = allKeys.indexOf('start_timestamp');
      if (startIdx > -1) {
        allKeys.splice(startIdx + 1, 0, specKey);
      } else {
        allKeys.push(specKey);
      }
    }
  }

  // Estado de ordenamiento
  let sortState = {
    key: allKeys.includes('start_timestamp') ? 'start_timestamp' : allKeys[0],
    order: 'desc'
  };

  const render = () => {
    // Ordenar datos
    const sortedData = [...flattenedData].sort((a, b) => {
      let valA = a[sortState.key];
      let valB = b[sortState.key];
      
      if (valA == null) valA = '';
      if (valB == null) valB = '';
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        const compare = valA.localeCompare(valB);
        return sortState.order === 'asc' ? compare : -compare;
      } else {
        if (valA < valB) return sortState.order === 'asc' ? -1 : 1;
        if (valA > valB) return sortState.order === 'asc' ? 1 : -1;
        return 0;
      }
    });

    // Renderizar cabeceras
    tableHeader.innerHTML = `
      <tr>
        ${allKeys.map(key => {
          let arrowColorAsc = 'inherit';
          let arrowColorDesc = 'inherit';
          if (sortState.key === key) {
            if (sortState.order === 'asc') arrowColorAsc = 'var(--primary)';
            if (sortState.order === 'desc') arrowColorDesc = 'var(--primary)';
          }
          const arrowHtml = `<span style="display: inline-flex; flex-direction: column; font-size: 0.6em; line-height: 1; vertical-align: middle; margin-left: 4px; color: #a0aec0;">
            <span style="color: ${arrowColorAsc}">▲</span>
            <span style="color: ${arrowColorDesc}">▼</span>
          </span>`;
          
          return `<th data-key="${escapeHtml(key)}" style="white-space: nowrap; cursor: pointer; user-select: none;" class="sortable-header">
            ${escapeHtml(key)} ${arrowHtml}
          </th>`;
        }).join('')}
      </tr>
    `;

    // Renderizar cuerpo
    tableBody.innerHTML = sortedData.map(record => `
      <tr>
        ${allKeys.map(key => {
          let cellValue = escapeHtml(String(record[key] ?? '-'));
          if (key === 'Key' || key === 'key') {
            const summaryRaw = record['Call_summary'] || record['call_summary'] || '-';
            const summary = encodeURIComponent(String(summaryRaw));
            const recordKey = escapeHtml(String(record[key]));
            const urlRaw = record['url'] || record['Url'] || record['URL'] || record['recording_url'] || record['Recording_url'] || '-';
            const rawNotes = record['notes'] || record['Notes'] || '';
            const encodedNotes = encodeURIComponent(String(rawNotes));
            
            const iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#104a8e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>`;

            const closeIconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>`;

            const listenIconHtml = urlRaw !== '-' ? `
              <a href="${escapeHtml(urlRaw)}" target="_blank" style="display: inline-flex; color: #104a8e; cursor: pointer; text-decoration: none;" title="Oír grabación">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              </a>` : '';

            const notesIconHtml = `
              <span style="cursor: pointer; display: inline-flex;" title="Editar Notas" onclick="openNotesModal('${recordKey}', '${encodedNotes}')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#104a8e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </span>`;
            
            return `<td>
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; text-align: center;">
                <span style="font-weight: 500;">${cellValue}</span>
                <div style="display: flex; gap: 12px; align-items: center;">
                  <span style="cursor: pointer; display: inline-flex;" title="Ver resumen" onclick="openSummaryModal('${recordKey}', '${summary}')">${iconSvg}</span>
                  ${listenIconHtml}
                  ${notesIconHtml}
                  <span style="cursor: pointer; display: inline-flex;" title="Finalizar proceso" onclick="confirmCloseCall('${recordKey}')">${closeIconSvg}</span>
                </div>
              </div>
            </td>`;
          } else if (key === 'phone' || key === 'Phone') {
            const callerName = escapeHtml(String(record['caller_name'] || record['Caller_name'] || ''));
            return `<td>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <span style="font-weight: 500;">${cellValue}</span>
                ${callerName ? `<span style="font-size: 0.85em; color: var(--text-secondary);">${callerName}</span>` : ''}
              </div>
            </td>`;
          } else if (key === 'agent' || key === 'Agent') {
            if (prefix !== 'ventas') {
              const specialist = escapeHtml(String(record['specialist'] || record['Specialist'] || ''));
              return `<td>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-weight: 500;">${cellValue}</span>
                  ${specialist ? `<span style="font-size: 0.85em; color: var(--text-secondary);">${specialist}</span>` : ''}
                </div>
              </td>`;
            } else {
              return `<td>${cellValue}</td>`;
            }
          }
          return `<td>${cellValue}</td>`;
        }).join('')}
      </tr>
    `).join('');

    // Añadir eventos a cabeceras
    const ths = tableHeader.querySelectorAll('th.sortable-header');
    ths.forEach(th => {
      th.addEventListener('click', () => {
        const key = th.getAttribute('data-key');
        if (sortState.key === key) {
          sortState.order = sortState.order === 'asc' ? 'desc' : 'asc';
        } else {
          sortState.key = key;
          sortState.order = 'desc'; // Por defecto desc para nuevas columnas
        }
        render();
      });
    });
  };

  render();
  tableWrapper.style.display = 'block';
}

/**
 * Consulta y renderiza la tabla de datos de Ventas de forma dinámica.
 */
async function loadVentasData() {
  const container = document.getElementById('ventasTableContainer');
  const loading = document.getElementById('ventasLoading');
  const empty = document.getElementById('ventasEmpty');
  const tableWrapper = document.getElementById('ventasTableWrapper');
  const tableHeader = document.getElementById('ventasTableHeader');
  const tableBody = document.getElementById('ventasTableBody');

  if (!container) return;

  // Estados visuales iniciales
  loading.style.display = 'block';
  empty.style.display = 'none';
  tableWrapper.style.display = 'none';

  const data = await fetchVentasData();

  loading.style.display = 'none';

  if (!data || data.length === 0) {
    empty.style.display = 'block';
    return;
  }

  renderDynamicTable('ventas', data);
}


/**
 * Consulta y renderiza la tabla de datos de Servicio al Cliente de forma dinámica.
 */
async function loadServiceData() {
  const container = document.getElementById('serviceTableContainer');
  const loading = document.getElementById('serviceLoading');
  const empty = document.getElementById('serviceEmpty');
  const tableWrapper = document.getElementById('serviceTableWrapper');
  const tableHeader = document.getElementById('serviceTableHeader');
  const tableBody = document.getElementById('serviceTableBody');

  if (!container) return;

  // Estados visuales iniciales
  loading.style.display = 'block';
  empty.style.display = 'none';
  tableWrapper.style.display = 'none';

  const data = await fetchServiceData();

  loading.style.display = 'none';

  if (!data || data.length === 0) {
    empty.style.display = 'block';
    return;
  }

  renderDynamicTable('service', data);
}

/**
 * Escapa HTML simple para evitar XSS básico.
 */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

/**
 * Selecciona un filtro predeterminado de fecha.
 * @param {string} presetKey - Clave del filtro ('today', '7days', '14days', '30days').
 */
function applyPresetFilter(presetKey) {
  state.activeFilterPreset = presetKey;
  state.currentRange = getPresetDateRange(presetKey);

  // Actualizar clases activas en los botones
  elements.filterButtons.forEach((btn) => {
    if (btn.dataset.preset === presetKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  updateRangeDisplay();
  loadStatistics();
}

/**
 * Abre el modal selector de rango personalizado.
 */
function openRangeModal() {
  const todayIso = formatDateISO(new Date());
  elements.inputDateBegin.value = state.currentRange.begin || todayIso;
  elements.inputDateEnd.value = state.currentRange.end || todayIso;
  elements.inputDateBegin.max = todayIso;
  elements.inputDateEnd.max = todayIso;

  elements.rangeModal.classList.add('active');
}

/**
 * Cierra el modal selector de rango.
 */
function closeRangeModal() {
  elements.rangeModal.classList.remove('active');
}

/**
 * Aplica el rango de fechas personalizado seleccionado en el modal.
 */
function applyCustomRange() {
  const begin = elements.inputDateBegin.value;
  const end = elements.inputDateEnd.value;

  if (!begin || !end) {
    alert('Por favor selecciona ambas fechas.');
    return;
  }

  if (begin > end) {
    alert('La fecha de inicio no puede ser posterior a la fecha final.');
    return;
  }

  state.activeFilterPreset = CONFIG.FILTER_PRESETS.CUSTOM;
  state.currentRange = {
    begin,
    end,
    label: 'Rango personalizado',
  };

  // Marcar botón de Rango como activo
  elements.filterButtons.forEach((btn) => {
    if (btn.dataset.preset === 'custom') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  closeRangeModal();
  updateRangeDisplay();
  loadStatistics();
}

/**
 * Inicializa todos los event listeners de la aplicación.
 */
function initEventListeners() {
  // Navegación por pestañas
  elements.tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetPage = btn.dataset.target;
      if (targetPage) {
        switchPage(targetPage);
      }
    });
  });

  // Filtros de fecha
  elements.filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      if (preset === 'custom') {
        openRangeModal();
      } else if (preset) {
        applyPresetFilter(preset);
      }
    });
  });

  // Modal de Rango
  elements.modalCloseBtn?.addEventListener('click', closeRangeModal);
  elements.btnCancelRange?.addEventListener('click', closeRangeModal);
  elements.btnApplyRange?.addEventListener('click', applyCustomRange);

  // Cerrar modal al hacer clic en el backdrop
  elements.rangeModal?.addEventListener('click', (e) => {
    if (e.target === elements.rangeModal) {
      closeRangeModal();
    }
  });

  // Botón Salir
  elements.btnExit?.addEventListener('click', () => {
    if (confirm('¿Deseas cerrar la sesión del panel administrativo?')) {
      localStorage.removeItem('tunorte_admin_session');
      window.location.href = '/';
    }
  });
}

/**
 * Punto de entrada al cargar el DOM.
 */
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  updateRangeDisplay();
  
  const savedPage = sessionStorage.getItem('activePage');
  if (savedPage) {
    switchPage(savedPage);
    if (savedPage === CONFIG.PAGES.GENERAL) {
      loadStatistics();
    }
  } else {
    loadStatistics();
  }
});
