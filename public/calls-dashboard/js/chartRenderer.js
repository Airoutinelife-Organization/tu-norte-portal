/**
 * @fileoverview Módulo de renderizado del gráfico de Tendencia Diaria de Llamadas.
 * Utiliza Chart.js (cargado globalmente desde CDN) para renderizar un área suave.
 */

/** @type {Chart|null} Instancia activa del gráfico diario Chart.js */
let chartInstance = null;

/** @type {Chart|null} Instancia activa del gráfico horario Chart.js */
let hourlyChartInstance = null;

/** @type {Chart|null} Instancia activa del gráfico de sentimiento Chart.js */
let sentimentChartInstance = null;

/** @type {Chart|null} Instancia activa del gráfico de resultados Chart.js */
let outcomeChartInstance = null;

/**
 * Colores de las series del gráfico.
 */
const SERIES_COLORS = {
  atendidas: {
    border: '#0b57d0',
    background: 'rgba(11, 87, 208, 0.10)',
  },
  resueltasIA: {
    border: '#16a34a',
    background: 'rgba(22, 163, 74, 0.10)',
  },
};

/**
 * Inicializa o actualiza el gráfico de tendencia diaria.
 * Si el gráfico ya existe, lo destruye y lo recrea con los nuevos datos.
 *
 * @param {{labels: string[], atendidas: number[], resueltasIA: number[]}} chartData
 *   - labels: fechas en formato YYYY-MM-DD.
 *   - atendidas: total de llamadas atendidas por día.
 *   - resueltasIA: total de llamadas resueltas por IA por día (puede ser 0 si no hay datos).
 */
export function renderLlamadasChart({ labels, atendidas, resueltasIA }) {
  const canvas = document.getElementById('llamadasChart');
  if (!canvas) return;

  // Destruir instancia previa para evitar duplicados
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  // Si no hay datos, mostrar estado vacío
  if (!labels || labels.length === 0) {
    mostrarEstadoVacio(canvas);
    return;
  }

  const ctx = canvas.getContext('2d');

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Atendidas',
          data: atendidas,
          borderColor: SERIES_COLORS.atendidas.border,
          backgroundColor: SERIES_COLORS.atendidas.background,
          borderWidth: 2,
          pointRadius: labels.length <= 2 ? 4 : 3,
          pointHoverRadius: 6,
          pointBackgroundColor: SERIES_COLORS.atendidas.border,
          fill: true,
          tension: 0.35,
        },
        {
          label: 'Resueltas por IA',
          data: resueltasIA,
          borderColor: SERIES_COLORS.resueltasIA.border,
          backgroundColor: SERIES_COLORS.resueltasIA.background,
          borderWidth: 2,
          pointRadius: labels.length <= 2 ? 4 : 3,
          pointHoverRadius: 6,
          pointBackgroundColor: SERIES_COLORS.resueltasIA.border,
          fill: true,
          tension: 0.35,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false, // Leyenda personalizada en el HTML
        },
        tooltip: {
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          titleColor: '#0f172a',
          bodyColor: '#475467',
          padding: 12,
          callbacks: {
            title: (items) => `📅 ${items[0].label}`,
            label: (item) =>
              `  ${item.dataset.label}: ${item.formattedValue} llamadas`,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            color: '#94a3b8',
            font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
            maxRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: '#f1f5f9',
            lineWidth: 1,
            borderDash: [4, 4],
          },
          border: {
            display: false,
            dash: [4, 4],
          },
          ticks: {
            color: '#94a3b8',
            font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
            stepSize: 1,
            precision: 0,
          },
        },
      },
    },
  });
}

/**
 * Renderiza la tendencia horaria de llamadas atendidas.
 * Muestra una sola serie de datos (Atendidas) con etiquetas de hora (0-23).
 *
 * @param {{labels: string[], atendidas: number[]}} chartData
 */
export function renderLlamadasHoraChart({ labels, atendidas }) {
  const canvas = document.getElementById('llamadasHoraChart');
  if (!canvas) return;

  if (hourlyChartInstance) {
    hourlyChartInstance.destroy();
    hourlyChartInstance = null;
  }

  if (!labels || labels.length === 0) {
    mostrarEstadoVacio(canvas);
    return;
  }

  const ctx = canvas.getContext('2d');

  hourlyChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Atendidas',
          data: atendidas,
          borderColor: SERIES_COLORS.atendidas.border,
          backgroundColor: SERIES_COLORS.atendidas.background,
          borderWidth: 2,
          pointRadius: labels.length <= 2 ? 4 : 3,
          pointHoverRadius: 6,
          pointBackgroundColor: SERIES_COLORS.atendidas.border,
          fill: true,
          tension: 0.35,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: '#94a3b8', font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" }, maxRotation: 0 },
        },
        y: { beginAtZero: true, grid: { color: '#f1f5f9', lineWidth: 1, borderDash: [4, 4] }, ticks: { color: '#94a3b8', font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" }, stepSize: 1, precision: 0 } },
      },
    },
  });
}

/**
 * Inicializa o actualiza el gráfico de pie de sentimiento.
 * @param {{positive: number, negative: number, neutral: number}} data 
 */
export function renderSentimentChart({ positive, negative, neutral }) {
  const canvas = document.getElementById('sentimentChart');
  if (!canvas) return;

  if (sentimentChartInstance) {
    sentimentChartInstance.destroy();
    sentimentChartInstance = null;
  }

  if (positive === 0 && negative === 0 && neutral === 0) {
    mostrarEstadoVacio(canvas);
    return;
  }

  const ctx = canvas.getContext('2d');
  
  const total = positive + negative + neutral;
  const getPerc = (val) => total > 0 ? ((val / total) * 100).toFixed(2) : 0;

  sentimentChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: [
        `Positivo (${getPerc(positive)}%)`, 
        `Negativo (${getPerc(negative)}%)`, 
        `Neutral (${getPerc(neutral)}%)`
      ],
      datasets: [
        {
          data: [positive, negative, neutral],
          backgroundColor: ['#16a34a', '#dc2626', '#94a3b8'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed || 0;
              return ` ${value} llamadas`;
            }
          }
        }
      },
    },
    plugins: [{
      id: 'pieLabels',
      afterDraw(chart) {
        const { ctx, data } = chart;
        ctx.save();
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const meta = chart.getDatasetMeta(0);
        meta.data.forEach((element, index) => {
          const val = data.datasets[0].data[index];
          if (val === 0) return;
          const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
          const perc = ((val / total) * 100).toFixed(2) + '%';
          
          const pos = element.tooltipPosition();
          ctx.fillText(perc, pos.x, pos.y);
        });
        ctx.restore();
      }
    }]
  });
}

/**
 * Inicializa o actualiza el gráfico de pie de Resultados.
 * @param {Record<string, number>} dataObj
 */
export function renderOutcomeChart(dataObj) {
  const canvas = document.getElementById('outcomeChart');
  if (!canvas) return;

  if (outcomeChartInstance) {
    outcomeChartInstance.destroy();
    outcomeChartInstance = null;
  }

  const entries = Object.entries(dataObj || {});
  if (entries.length === 0) {
    mostrarEstadoVacio(canvas);
    return;
  }

  const total = entries.reduce((sum, [_, val]) => sum + val, 0);
  if (total === 0) {
    mostrarEstadoVacio(canvas);
    return;
  }

  const ctx = canvas.getContext('2d');
  
  // Colores dinámicos para los diferentes resultados
  const colors = ['#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#64748b'];

  const labels = entries.map(([key, val]) => {
    const perc = ((val / total) * 100).toFixed(2);
    return `${key} (${perc}%)`;
  });
  const data = entries.map(([_, val]) => val);
  const backgroundColors = data.map((_, i) => colors[i % colors.length]);

  outcomeChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed || 0;
              return ` ${value} llamadas`;
            }
          }
        }
      },
    },
    plugins: [{
      id: 'pieLabelsOutcome',
      afterDraw(chart) {
        const { ctx, data } = chart;
        ctx.save();
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const meta = chart.getDatasetMeta(0);
        meta.data.forEach((element, index) => {
          const val = data.datasets[0].data[index];
          if (val === 0) return;
          const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
          const perc = ((val / total) * 100).toFixed(2) + '%';
          
          const pos = element.tooltipPosition();
          ctx.fillText(perc, pos.x, pos.y);
        });
        ctx.restore();
      }
    }]
  });
}

/**
 * Muestra un mensaje de estado vacío dentro del canvas.
 * @param {HTMLCanvasElement} canvas
 */
function mostrarEstadoVacio(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#94a3b8';
  ctx.font = "14px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('Sin datos para el período seleccionado', canvas.width / 2, canvas.height / 2);
}
