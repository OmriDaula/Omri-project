// reports.js (מתוקן)

function safeGetExpenses() {
  if (typeof getExpenses === 'function') return getExpenses();

  const key = (typeof LOCAL_STORAGE_KEY === 'string') ? LOCAL_STORAGE_KEY : 'expenses';
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

let pieChartInstance = null;
let barChartInstance = null;

const PALETTE = [
  '#6366F1', '#22C55E', '#F97316', '#EF4444', '#06B6D4',
  '#A855F7', '#F59E0B', '#14B8A6', '#3B82F6', '#84CC16'
];

// ✅ שם חדש כדי לא להתנגש עם utils.js
function formatCurrency(amount) {
  if (typeof window.formatILS === 'function') return window.formatILS(amount);
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
}

function sumByCategory(expenses) {
  const map = {};
  for (const e of expenses) map[e.category] = (map[e.category] || 0) + e.amount;
  return map;
}

function sumByYear(expenses) {
  const map = {};
  for (const e of expenses) {
    const year = e.date.slice(0, 4);
    map[year] = (map[year] || 0) + e.amount;
  }
  return map;
}

function sumByMonth(expenses) {
  const map = {};
  for (const e of expenses) {
    const ym = e.date.slice(0, 7);
    map[ym] = (map[ym] || 0) + e.amount;
  }
  return map;
}

function updateStats(expenses) {
  const total = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const count = expenses.length;
  const avg = count ? total / count : 0;

  const byCat = sumByCategory(expenses);
  let topCat = '—';
  let topSum = 0;
  for (const [k, v] of Object.entries(byCat)) {
    if (v > topSum) { topSum = v; topCat = k; }
  }

  const statTotal = document.getElementById('statTotal');
  const statCount = document.getElementById('statCount');
  const statAvg = document.getElementById('statAvg');
  const statTopCat = document.getElementById('statTopCat');
  const statTopCatSum = document.getElementById('statTopCatSum');

  if (statTotal) statTotal.textContent = formatCurrency(total);
  if (statCount) statCount.textContent = `${count} רשומות`;
  if (statAvg) statAvg.textContent = formatCurrency(avg);
  if (statTopCat) statTopCat.textContent = topCat;
  if (statTopCatSum) statTopCatSum.textContent = formatCurrency(topSum);
}

function renderPie(expenses) {
  const byCat = sumByCategory(expenses);
  const labels = Object.keys(byCat);
  const values = Object.values(byCat);

  const emptyMsg = document.getElementById('pieEmpty');
  const canvas = document.getElementById('pieChart');

  if (pieChartInstance) pieChartInstance.destroy();

  if (!labels.length) {
    if (emptyMsg) emptyMsg.classList.remove('hidden');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }
  if (emptyMsg) emptyMsg.classList.add('hidden');

  const colors = labels.map((_, i) => PALETTE[i % PALETTE.length]);

  pieChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 10 } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.parsed)}`
          }
        }
      },
      cutout: '62%'
    }
  });
}

function renderBar(expenses) {
  const groupBy = document.getElementById('groupBy').value;
  const grouped = groupBy === 'year' ? sumByYear(expenses) : sumByMonth(expenses);

  const labels = Object.keys(grouped).sort();
  const values = labels.map(k => grouped[k]);

  const emptyMsg = document.getElementById('barEmpty');
  const canvas = document.getElementById('barChart');

  if (barChartInstance) barChartInstance.destroy();

  if (!labels.length) {
    if (emptyMsg) emptyMsg.classList.remove('hidden');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }
  if (emptyMsg) emptyMsg.classList.add('hidden');

  barChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: groupBy === 'year' ? 'סך הוצאות לשנה' : 'סך הוצאות לחודש',
        data: values,
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 10,
        maxBarThickness: 48
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => formatCurrency(ctx.parsed.y)
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => formatCurrency(v)
          }
        }
      }
    }
  });
}

function renderAll() {
  const expenses = safeGetExpenses();
  updateStats(expenses);
  renderPie(expenses);
  renderBar(expenses);
}

(function initReports() {
  if (typeof renderMainNav === 'function') renderMainNav('reports');

  const csvBtn = document.getElementById('csvBtn');
  const pdfBtn = document.getElementById('pdfBtn');
  const groupBy = document.getElementById('groupBy');

  if (csvBtn) csvBtn.addEventListener('click', exportCSV);
  if (pdfBtn) pdfBtn.addEventListener('click', exportPDF);
  if (groupBy) groupBy.addEventListener('change', renderAll);

  renderAll();
})();
