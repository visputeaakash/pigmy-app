/* ========================================
   PIGMY PWA — Charts Module (Chart.js)
   Monthly Trend, Distribution, Daily Pattern
   ======================================== */

let monthlyChart = null;
let distributionChart = null;
let dailyChart = null;

const CHART_COLORS = [
  '#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

// ---- 1. Monthly Collection Trend (Bar Chart) ----
function renderMonthlyTrendChart(feeds) {
  const ctx = document.getElementById('chart-monthly');
  if (!ctx) return;

  // Aggregate feeds by month
  const monthMap = {};
  feeds.forEach(f => {
    if (!f.feed_date) return;
    const key = f.feed_date.substring(0, 7); // "YYYY-MM"
    monthMap[key] = (monthMap[key] || 0) + (f.net_deposited || 0);
  });

  const sorted = Object.entries(monthMap).sort((a, b) => a[0].localeCompare(b[0]));
  const labels = sorted.map(([m]) => {
    const [y, mo] = m.split('-');
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return monthNames[parseInt(mo) - 1] + ' ' + y.substring(2);
  });
  const data = sorted.map(([, v]) => v);

  if (monthlyChart) monthlyChart.destroy();
  monthlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '₹ Net Deposited',
        data,
        backgroundColor: data.map((_, i) => CHART_COLORS[i % CHART_COLORS.length] + '99'),
        borderColor: data.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => '₹' + ctx.parsed.y.toLocaleString('en-IN', { minimumFractionDigits: 2 })
          }
        }
      },
      scales: {
        y: {
          ticks: { color: '#94a3b8', callback: v => '₹' + (v / 1000).toFixed(0) + 'K' },
          grid: { color: 'rgba(51,65,85,0.3)' }
        },
        x: {
          ticks: { color: '#94a3b8', maxRotation: 45 },
          grid: { display: false }
        }
      }
    }
  });
}

// ---- 2. Account Distribution (Doughnut) ----
function renderDistributionChart(feeds, accounts) {
  const ctx = document.getElementById('chart-distribution');
  if (!ctx) return;

  // Balance per account
  const balMap = {};
  feeds.forEach(f => {
    balMap[f.account_number] = (balMap[f.account_number] || 0) + (f.net_deposited || 0);
  });

  const activeAccounts = accounts.filter(a => a.status === 'Active');
  const labels = activeAccounts.map(a => a.bank_name);
  const data = activeAccounts.map(a => Math.max(0, balMap[a.id] || 0));

  if (data.every(v => v === 0)) {
    // No data — skip rendering
    return;
  }

  if (distributionChart) distributionChart.destroy();
  distributionChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: CHART_COLORS.slice(0, labels.length),
        borderColor: '#1e293b',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', padding: 12, usePointStyle: true, pointStyleWidth: 10 }
        },
        tooltip: {
          callbacks: {
            label: ctx => ctx.label + ': ₹' + ctx.parsed.toLocaleString('en-IN', { minimumFractionDigits: 2 })
          }
        }
      }
    }
  });
}

// ---- 3. Last 30 Days Activity (Line Chart) ----
function renderDailyPatternChart(feeds) {
  const ctx = document.getElementById('chart-daily');
  if (!ctx) return;

  const today = new Date();
  const last30 = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last30.push(d.toISOString().slice(0, 10));
  }

  const dayMap = {};
  feeds.forEach(f => {
    if (!f.feed_date) return;
    dayMap[f.feed_date] = (dayMap[f.feed_date] || 0) + (f.net_deposited || 0);
  });

  const labels = last30.map(d => d.substring(8)); // just DD
  const data = last30.map(d => dayMap[d] || 0);

  if (dailyChart) dailyChart.destroy();
  dailyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '₹ Daily',
        data,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: data.map(v => v > 0 ? '#10b981' : '#ef4444'),
        pointBorderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: items => 'Day ' + items[0].label,
            label: ctx => '₹' + ctx.parsed.y.toLocaleString('en-IN', { minimumFractionDigits: 2 })
          }
        }
      },
      scales: {
        y: {
          ticks: { color: '#94a3b8', callback: v => '₹' + v.toLocaleString('en-IN') },
          grid: { color: 'rgba(51,65,85,0.3)' }
        },
        x: {
          ticks: { color: '#94a3b8' },
          grid: { display: false }
        }
      }
    }
  });
}

// ---- Master Render ----
function renderAllCharts(feeds, accounts) {
  renderMonthlyTrendChart(feeds);
  renderDistributionChart(feeds, accounts);
  renderDailyPatternChart(feeds);
}
