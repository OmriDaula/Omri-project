// fallback - אם storage.js לא נטען, נשתמש בגישה ישירה ל-localStorage
const FILTERS_STORAGE_KEY = (typeof LOCAL_STORAGE_KEY === 'string') ? LOCAL_STORAGE_KEY : 'expenses';

function safeGetExpenses() {
  if (typeof getExpenses === 'function') return getExpenses(); // אם storage.js נטען
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function uniqueYears(expenses) {
  const set = new Set();
  for (const e of expenses) {
    if (e?.date && e.date.length >= 4) set.add(e.date.slice(0, 4));
  }
  return Array.from(set).sort();
}

function fillYearSelect() {
  const select = document.getElementById('yearSelect');
  const years = uniqueYears(safeGetExpenses());

  let html = '<option value="">ללא</option>';
  for (const y of years) html += `<option value="${y}">${y}</option>`;
  select.innerHTML = html;
}

function filterExpenses() {
  const expenses = safeGetExpenses();

  const year = document.getElementById('yearSelect').value;
  const yearMonth = document.getElementById('yearMonthInput').value;
  const date = document.getElementById('dateInput').value;
  const maxAmountRaw = document.getElementById('maxAmountInput').value;

  let result = expenses;

  if (date) result = result.filter(e => e.date === date);
  else if (yearMonth) result = result.filter(e => e.date.slice(0, 7) === yearMonth);
  else if (year) result = result.filter(e => e.date.slice(0, 4) === year);

  if (maxAmountRaw !== '') {
    const maxAmount = Number(maxAmountRaw);
    if (!Number.isNaN(maxAmount)) result = result.filter(e => e.amount <= maxAmount);
  }

  return result;
}

function renderFilteredTable() {
  const data = filterExpenses();
  document.getElementById('filteredCount').textContent = String(data.length);

  const tbody = document.getElementById('filteredTbody');
  let html = '';

  // אם utils.js לא נטען, נציג מספר רגיל
  const format = (typeof formatILS === 'function') ? formatILS : (n) => String(n);

  for (const exp of data) {
    html += `
      <tr class="border-b last:border-b-0">
        <td class="py-2 px-2 whitespace-nowrap">${exp.date}</td>
        <td class="py-2 px-2">${exp.category}</td>
        <td class="py-2 px-2">${exp.description || ''}</td>
        <td class="py-2 px-2 whitespace-nowrap">${format(exp.amount)}</td>
      </tr>
    `;
  }

  tbody.innerHTML = html;
}

function applyFilters() {
  renderFilteredTable();
}

function clearFilters() {
  document.getElementById('yearSelect').value = '';
  document.getElementById('yearMonthInput').value = '';
  document.getElementById('dateInput').value = '';
  document.getElementById('maxAmountInput').value = '';
  applyFilters();
}

(function initFilters() {
  if (typeof renderMainNav === 'function') renderMainNav('filters');

  console.log('getExpenses:', typeof getExpenses); // כדי שתראה אם storage.js נטען
  console.log('safeGetExpenses length:', safeGetExpenses().length);

  fillYearSelect();
  renderFilteredTable();

  document.getElementById('yearSelect').addEventListener('change', applyFilters);
  document.getElementById('yearMonthInput').addEventListener('change', applyFilters);
  document.getElementById('dateInput').addEventListener('change', applyFilters);
  document.getElementById('maxAmountInput').addEventListener('input', applyFilters);
  document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
})();
