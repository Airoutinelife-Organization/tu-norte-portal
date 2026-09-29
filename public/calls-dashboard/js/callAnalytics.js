/**
 * Módulo de KPIs jerárquicos de llamadas IA.
 * Separación UI / datos: CallAnalyticsService -> MockCallAnalyticsService (hoy)
 * -> AIRPCallAnalyticsService (futuro, consulta API de Analytics AIRP; sin secretos en el navegador).
 *
 * @typedef {Object} CallKpiSummary
 * @property {number} total_calls
 * @property {number} ai_resolved
 * @property {number} transferred
 * @property {number} abandoned
 * @property {number} transfer_successful
 * @property {number} transfer_failed
 * @property {number} ai_goal_completed
 * @property {number} ai_goal_not_completed
 */

class CallAnalyticsService {
  /** @returns {Promise<CallKpiSummary>} */
  async getCallKpiSummary(_dateRange) { throw new Error('not implemented'); }
}

class MockCallAnalyticsService extends CallAnalyticsService {
  async getCallKpiSummary(dateRange) {
    const days = dateRange?.begin && dateRange?.end
      ? Math.max(1, Math.round((new Date(dateRange.end) - new Date(dateRange.begin)) / 86400000) + 1)
      : 1;
    const f = days === 1 ? 1 : Math.min(days, 30) * 0.9;
    const r = (n) => Math.round(n * f);
    const ai_resolved = r(61), abandoned = r(21);
    const transfer_successful = r(36), transfer_failed = r(2);
    const transferred = transfer_successful + transfer_failed;
    const total_calls = ai_resolved + transferred + abandoned;
    const ai_goal_completed = Math.round(total_calls * 0.683);
    await new Promise((res) => setTimeout(res, 250));
    return {
      total_calls, ai_resolved, transferred, abandoned,
      transfer_successful, transfer_failed,
      ai_goal_completed, ai_goal_not_completed: total_calls - ai_goal_completed,
    };
  }
}

class AIRPCallAnalyticsService extends CallAnalyticsService {
  constructor(baseUrl) { super(); this.baseUrl = baseUrl; }
  async getCallKpiSummary(dateRange) {
    const q = new URLSearchParams({ begin: dateRange.begin, end: dateRange.end });
    const res = await fetch(`${this.baseUrl}?${q}`);
    if (!res.ok) throw new Error(`AIRP analytics ${res.status}`);
    return res.json();
  }
}

// Cambiar a new AIRPCallAnalyticsService('<url>') cuando exista el endpoint.
export const callAnalyticsService = new MockCallAnalyticsService();
export { CallAnalyticsService, MockCallAnalyticsService, AIRPCallAnalyticsService };

export function validateSummary(s) {
  const issues = [];
  const n = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
  for (const k of ['total_calls','ai_resolved','transferred','abandoned','transfer_successful','transfer_failed','ai_goal_completed','ai_goal_not_completed']) {
    if (!n(s?.[k])) issues.push(`${k} inválido`);
  }
  if (issues.length) return issues;
  if (s.ai_resolved + s.transferred + s.abandoned !== s.total_calls) issues.push('resueltas + transferidas + abandonadas ≠ total');
  if (s.transfer_successful + s.transfer_failed !== s.transferred) issues.push('exitosas + fallidas ≠ transferidas');
  if (s.ai_goal_completed + s.ai_goal_not_completed !== s.total_calls) issues.push('objetivo cumplido + no cumplido ≠ total');
  return issues;
}

const pct = (a, b) => (b > 0 ? (a / b) * 100 : 0);
const fmtPct = (v) => `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}%`;
const $ = (id) => document.getElementById(id);
const setText = (id, t) => { const el = $(id); if (el) el.textContent = t; };

let activeFilter = null;
function bindFilters() {
  document.querySelectorAll('[data-ck-filter]').forEach((el) => {
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener('click', () => {
      const f = el.dataset.ckFilter;
      activeFilter = activeFilter === f ? null : f;
      document.querySelectorAll('[data-ck-filter]').forEach((x) => x.classList.toggle('is-selected', x.dataset.ckFilter === activeFilter));
      const labels = {
        AI_RESOLVED: 'final_outcome = AI_RESOLVED',
        TRANSFERRED: 'final_outcome = TRANSFERRED',
        ABANDONED: 'final_outcome = ABANDONED',
        TRANSFER_OK: 'TRANSFERRED · transfer_successful = true',
        TRANSFER_FAIL: 'TRANSFERRED · transfer_successful = false',
      };
      const note = $('ckFilterNote');
      if (note) {
        note.hidden = !activeFilter;
        note.textContent = activeFilter ? `Filtro preparado: ${labels[activeFilter]} (detalle de llamadas disponible al conectar AIRP)` : '';
      }
      document.dispatchEvent(new CustomEvent('callkpi:filter', { detail: { filter: activeFilter } }));
    });
  });
}

export async function renderCallKpis(dateRange) {
  const root = $('callKpiModule');
  if (!root) return;
  bindFilters();
  root.classList.add('is-loading');
  const status = $('ckStatus');
  try {
    const s = await callAnalyticsService.getCallKpiSummary(dateRange);
    const issues = validateSummary(s);
    if (issues.length) {
      console.warn('[CallKPI] Inconsistencia detectada', issues, s);
      root.classList.add('is-invalid');
      if (status) { status.hidden = false; status.textContent = 'Inconsistencia detectada'; }
      return;
    }
    root.classList.remove('is-invalid');
    if (status) status.hidden = true;

    const T = s.total_calls;
    const pr = pct(s.ai_resolved, T), pt = pct(s.transferred, T), pa = pct(s.abandoned, T);
    const pOk = pct(s.transfer_successful, s.transferred), pFail = pct(s.transfer_failed, s.transferred);
    const pg = pct(s.ai_goal_completed, T);

    setText('ckTotal', T.toLocaleString());
    setText('ckResolved', s.ai_resolved.toLocaleString()); setText('ckResolvedPct', fmtPct(pr));
    setText('ckTransferred', s.transferred.toLocaleString()); setText('ckTransferredPct', fmtPct(pt));
    setText('ckAbandoned', s.abandoned.toLocaleString()); setText('ckAbandonedPct', fmtPct(pa));
    setText('ckOk', s.transfer_successful.toLocaleString()); setText('ckOkPct', fmtPct(pOk));
    setText('ckFail', s.transfer_failed.toLocaleString()); setText('ckFailPct', fmtPct(pFail));
    $('ckSegResolved').style.width = `${pr}%`;
    $('ckSegTransferred').style.width = `${pt}%`;
    $('ckSegAbandoned').style.width = `${pa}%`;

    setText('ckGoalRatio', `${s.ai_goal_completed.toLocaleString()} / ${T.toLocaleString()}`);
    setText('ckGoalPct', fmtPct(pg));
    setText('ckGoalDone', s.ai_goal_completed.toLocaleString());
    setText('ckGoalNot', s.ai_goal_not_completed.toLocaleString());
    $('ckGoalBar').style.width = `${pg}%`;
  } catch (err) {
    console.error('[CallKPI] Error obteniendo resumen', err);
    if (status) { status.hidden = false; status.textContent = 'Datos en validación'; }
  } finally {
    root.classList.remove('is-loading');
  }
}
